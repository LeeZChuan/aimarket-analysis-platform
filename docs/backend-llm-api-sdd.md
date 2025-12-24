# LLM 代理服务 API 设计文档 (SDD)

> 版本: 1.0.0  
> 更新日期: 2024-12-24  
> 状态: 设计阶段

## 1. 概述

本文档定义了 AI Market Analysis Platform 后端 LLM 代理服务的 API 规范。该服务作为前端与各 LLM 供应商之间的代理层，负责：

- 统一的 API 接口抽象
- API Key 安全管理
- 请求转发与响应处理
- 速率限制与错误处理

## 2. 系统架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│  LLM Proxy API  │────▶│   LLM Provider  │
│  (React App)    │◀────│    (Backend)    │◀────│  (OpenAI/DS)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Config Store  │
                        │  (API Keys等)   │
                        └─────────────────┘
```

## 3. API 接口规范

### 3.1 基础信息

- **Base URL**: `/api/llm`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (用户会话 Token)

### 3.2 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/providers` | 获取可用的 LLM 供应商列表 |
| GET | `/models` | 获取指定供应商的模型列表 |
| POST | `/chat` | 聊天补全（非流式） |
| POST | `/stream` | 聊天补全（流式 SSE） |

---

### 3.3 GET /api/llm/providers

获取系统支持的所有 LLM 供应商列表。

#### 请求

```http
GET /api/llm/providers
Authorization: Bearer <token>
```

#### 响应

```typescript
// 成功响应 200 OK
interface ProvidersResponse {
  providers: ProviderInfo[];
}

interface ProviderInfo {
  /** 供应商唯一标识 */
  id: string;
  /** 供应商显示名称 */
  name: string;
  /** 供应商描述 */
  description: string;
  /** 是否可用（已配置 API Key） */
  available: boolean;
  /** 供应商图标 URL（可选） */
  icon?: string;
}
```

#### 示例响应

```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "description": "GPT 系列模型，通用智能分析",
      "available": true,
      "icon": "/icons/openai.svg"
    },
    {
      "id": "deepseek",
      "name": "DeepSeek",
      "description": "高性价比，优秀的中文能力",
      "available": true,
      "icon": "/icons/deepseek.svg"
    }
  ]
}
```

---

### 3.4 GET /api/llm/models

获取指定供应商支持的模型列表。

#### 请求

```http
GET /api/llm/models?provider=openai
Authorization: Bearer <token>
```

#### 查询参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| provider | string | 是 | 供应商 ID |

#### 响应

```typescript
// 成功响应 200 OK
interface ModelsResponse {
  provider: string;
  models: ModelInfo[];
}

interface ModelInfo {
  /** 模型唯一标识 */
  id: string;
  /** 模型显示名称 */
  name: string;
  /** 模型描述 */
  description: string;
  /** 最大上下文长度 (tokens) */
  maxContextLength: number;
  /** 是否支持视觉（图片输入） */
  supportsVision: boolean;
  /** 是否支持函数调用 */
  supportsFunctions: boolean;
  /** 输入价格 ($/1M tokens) */
  inputPrice?: number;
  /** 输出价格 ($/1M tokens) */
  outputPrice?: number;
}
```

#### 示例响应

```json
{
  "provider": "openai",
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "description": "最新旗舰模型，支持多模态",
      "maxContextLength": 128000,
      "supportsVision": true,
      "supportsFunctions": true,
      "inputPrice": 2.5,
      "outputPrice": 10
    },
    {
      "id": "gpt-4o-mini",
      "name": "GPT-4o Mini",
      "description": "轻量快速，性价比高",
      "maxContextLength": 128000,
      "supportsVision": true,
      "supportsFunctions": true,
      "inputPrice": 0.15,
      "outputPrice": 0.6
    }
  ]
}
```

---

### 3.5 POST /api/llm/chat

发送聊天补全请求（非流式响应）。

#### 请求

```http
POST /api/llm/chat
Authorization: Bearer <token>
Content-Type: application/json
```

```typescript
interface ChatRequest {
  /** 供应商 ID */
  provider: string;
  /** 模型 ID */
  model: string;
  /** 消息数组 */
  messages: ChatMessage[];
  /** 温度参数 (0-2)，默认 0.7 */
  temperature?: number;
  /** 最大输出 tokens，默认由模型决定 */
  maxTokens?: number;
  /** 系统提示词（可选，会插入到 messages 开头） */
  systemPrompt?: string;
}

interface ChatMessage {
  /** 角色: system, user, assistant */
  role: 'system' | 'user' | 'assistant';
  /** 消息内容 */
  content: string | MessageContent[];
}

/** 多模态内容（用于图片输入） */
interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // base64 或 URL
    detail?: 'low' | 'high' | 'auto';
  };
}
```

#### 响应

```typescript
// 成功响应 200 OK
interface ChatResponse {
  /** 响应 ID */
  id: string;
  /** 生成的内容 */
  content: string;
  /** 使用的模型 */
  model: string;
  /** Token 使用统计 */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 完成原因 */
  finishReason: 'stop' | 'length' | 'content_filter';
}
```

#### 示例请求

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": "分析一下苹果公司最近的股票走势"
    }
  ],
  "temperature": 0.7,
  "systemPrompt": "你是一位专业的股票分析师..."
}
```

#### 示例响应

```json
{
  "id": "chatcmpl-abc123",
  "content": "根据苹果公司（AAPL）最近的股票走势分析...",
  "model": "gpt-4o",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 500,
    "totalTokens": 650
  },
  "finishReason": "stop"
}
```

---

### 3.6 POST /api/llm/stream

发送聊天补全请求（流式 SSE 响应）。

#### 请求

与 `/chat` 接口相同。

#### 响应

使用 Server-Sent Events (SSE) 格式：

```typescript
// Content-Type: text/event-stream

// 内容块事件
interface StreamChunk {
  event: 'chunk';
  data: {
    content: string;  // 增量内容
  };
}

// 完成事件
interface StreamDone {
  event: 'done';
  data: {
    id: string;
    model: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    finishReason: 'stop' | 'length' | 'content_filter';
  };
}

// 错误事件
interface StreamError {
  event: 'error';
  data: {
    code: string;
    message: string;
  };
}
```

#### SSE 响应示例

```
event: chunk
data: {"content": "根据"}

event: chunk
data: {"content": "苹果公司"}

event: chunk
data: {"content": "的股票走势..."}

event: done
data: {"id": "chatcmpl-abc123", "model": "gpt-4o", "usage": {"promptTokens": 150, "completionTokens": 500, "totalTokens": 650}, "finishReason": "stop"}
```

---

## 4. 错误处理

### 4.1 错误响应格式

```typescript
interface ErrorResponse {
  error: {
    /** 错误码 */
    code: string;
    /** 错误信息 */
    message: string;
    /** 详细信息（可选） */
    details?: Record<string, any>;
  };
}
```

### 4.2 错误码定义

| 错误码 | HTTP 状态码 | 描述 |
|--------|------------|------|
| `INVALID_REQUEST` | 400 | 请求参数无效 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `PROVIDER_NOT_FOUND` | 404 | 供应商不存在 |
| `MODEL_NOT_FOUND` | 404 | 模型不存在 |
| `PROVIDER_UNAVAILABLE` | 503 | 供应商暂不可用（未配置 API Key） |
| `RATE_LIMITED` | 429 | 请求过于频繁 |
| `PROVIDER_ERROR` | 502 | LLM 供应商返回错误 |
| `CONTENT_FILTERED` | 400 | 内容被安全过滤 |
| `CONTEXT_LENGTH_EXCEEDED` | 400 | 上下文长度超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

### 4.3 错误响应示例

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "请求过于频繁，请稍后重试",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## 5. 供应商集成指南

### 5.1 OpenAI 集成

#### API 端点

- 聊天补全: `https://api.openai.com/v1/chat/completions`

#### 支持的模型

| 模型 ID | 名称 | 说明 |
|---------|------|------|
| `gpt-4o` | GPT-4o | 旗舰多模态模型 |
| `gpt-4o-mini` | GPT-4o Mini | 轻量快速版本 |
| `gpt-4-turbo` | GPT-4 Turbo | 高性能版本 |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | 经济实惠选择 |

#### 请求转换

```typescript
// 前端请求 -> OpenAI API 请求
function transformToOpenAI(request: ChatRequest): OpenAIRequest {
  return {
    model: request.model,
    messages: request.systemPrompt 
      ? [{ role: 'system', content: request.systemPrompt }, ...request.messages]
      : request.messages,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens,
    stream: false
  };
}
```

#### 响应转换

```typescript
// OpenAI API 响应 -> 统一响应
function transformFromOpenAI(response: OpenAIResponse): ChatResponse {
  return {
    id: response.id,
    content: response.choices[0].message.content,
    model: response.model,
    usage: {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    },
    finishReason: response.choices[0].finish_reason
  };
}
```

---

### 5.2 DeepSeek 集成

#### API 端点

- 聊天补全: `https://api.deepseek.com/chat/completions`

#### 支持的模型

| 模型 ID | 名称 | 说明 |
|---------|------|------|
| `deepseek-chat` | DeepSeek Chat | 通用对话模型 |
| `deepseek-reasoner` | DeepSeek Reasoner | 推理增强模型 |

#### 特殊说明

DeepSeek API 与 OpenAI API 兼容，可使用相同的请求/响应格式，仅需更改：
- API 端点 URL
- API Key Header

```typescript
// DeepSeek 使用 OpenAI 兼容格式
const headers = {
  'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
  'Content-Type': 'application/json'
};
```

---

### 5.3 扩展新供应商

新供应商需实现以下接口：

```typescript
interface LLMProviderAdapter {
  /** 供应商 ID */
  id: string;
  
  /** 获取可用模型列表 */
  getModels(): Promise<ModelInfo[]>;
  
  /** 发送聊天请求 */
  chat(request: ChatRequest): Promise<ChatResponse>;
  
  /** 发送流式聊天请求 */
  streamChat(request: ChatRequest): AsyncGenerator<StreamChunk | StreamDone>;
  
  /** 验证 API Key 是否有效 */
  validateApiKey(apiKey: string): Promise<boolean>;
}
```

---

## 6. 安全配置

### 6.1 API Key 管理

API Key 应存储在服务端环境变量中，**绝不**暴露给前端：

```bash
# .env 配置示例
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 6.2 环境变量配置

```typescript
interface LLMConfig {
  providers: {
    openai?: {
      apiKey: string;
      baseUrl?: string;  // 可选，用于代理
      orgId?: string;    // 组织 ID（可选）
    };
    deepseek?: {
      apiKey: string;
      baseUrl?: string;
    };
  };
  defaults: {
    provider: string;    // 默认供应商
    model: string;       // 默认模型
    temperature: number; // 默认温度
    maxTokens: number;   // 默认最大 tokens
  };
  rateLimit: {
    requestsPerMinute: number;  // 每分钟请求限制
    tokensPerMinute: number;    // 每分钟 token 限制
  };
}
```

### 6.3 速率限制建议

| 层级 | 限制 | 说明 |
|------|------|------|
| 用户级 | 60 请求/分钟 | 防止单用户滥用 |
| IP 级 | 120 请求/分钟 | 防止恶意攻击 |
| 全局 | 取决于 API 配额 | 遵守供应商限制 |

### 6.4 请求验证

后端应验证：

1. 用户认证状态
2. 请求参数合法性
3. 供应商/模型存在性
4. 消息内容安全性（可选）

---

## 7. 数据模型汇总

### 7.1 TypeScript 类型定义

```typescript
// ==================== 供应商相关 ====================

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  available: boolean;
  icon?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  maxContextLength: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  inputPrice?: number;
  outputPrice?: number;
}

// ==================== 聊天相关 ====================

export type MessageRole = 'system' | 'user' | 'assistant';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export type MessageContent = TextContent | ImageContent;

export interface ChatMessage {
  role: MessageRole;
  content: string | MessageContent[];
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  usage: TokenUsage;
  finishReason: FinishReason;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type FinishReason = 'stop' | 'length' | 'content_filter';

// ==================== 流式响应 ====================

export interface StreamChunkEvent {
  event: 'chunk';
  data: { content: string };
}

export interface StreamDoneEvent {
  event: 'done';
  data: Omit<ChatResponse, 'content'>;
}

export interface StreamErrorEvent {
  event: 'error';
  data: { code: string; message: string };
}

export type StreamEvent = StreamChunkEvent | StreamDoneEvent | StreamErrorEvent;

// ==================== 错误处理 ====================

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
}

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'PROVIDER_NOT_FOUND'
  | 'MODEL_NOT_FOUND'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'CONTENT_FILTERED'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'INTERNAL_ERROR';
```

---

## 8. 实现检查清单

后端开发时可参考此检查清单：

- [ ] 实现 `GET /api/llm/providers` 接口
- [ ] 实现 `GET /api/llm/models` 接口
- [ ] 实现 `POST /api/llm/chat` 接口
- [ ] 实现 `POST /api/llm/stream` 接口
- [ ] 集成 OpenAI API
- [ ] 集成 DeepSeek API
- [ ] 实现 API Key 安全存储
- [ ] 实现用户认证验证
- [ ] 实现速率限制
- [ ] 实现错误处理和日志
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 编写 API 文档（Swagger/OpenAPI）

---

## 9. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2024-12-24 | 初始版本 |

