/**
 * LLM 供应商抽象层类型定义
 */

/**
 * 供应商信息
 */
export interface ProviderInfo {
  /** 供应商唯一标识 */
  id: string;
  /** 供应商名称 */
  name: string;
  /** 供应商描述 */
  description: string;
  /** 供应商图标 */
  icon?: string;
  /** 是否可用 */
  available: boolean;
}

/**
 * 模型信息
 */
export interface ModelInfo {
  /** 模型唯一标识 */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型描述 */
  description: string;
  /** 最大上下文长度 */
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

/**
 * 消息角色
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * 文本消息内容
 */
export interface TextContent {
  type: 'text';
  text: string;
}

/**
 * 图片消息内容
 */
export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

/**
 * 消息内容（可以是文本或图片）
 */
export type MessageContent = TextContent | ImageContent;

/**
 * 聊天消息
 */
export interface ChatMessage {
  /** 角色 */
  role: MessageRole;
  /** 内容（字符串或多模态内容数组） */
  content: string | MessageContent[];
}

/**
 * 聊天请求
 */
export interface ChatRequest {
  /** 消息数组 */
  messages: ChatMessage[];
  /** 温度参数 (0-2) */
  temperature?: number;
  /** 最大输出 tokens */
  maxTokens?: number;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 是否流式响应 */
  stream?: boolean;
}

/**
 * Token 使用统计
 */
export interface TokenUsage {
  /** 提示词 tokens */
  promptTokens: number;
  /** 生成 tokens */
  completionTokens: number;
  /** 总 tokens */
  totalTokens: number;
}

/**
 * 完成原因
 */
export type FinishReason = 'stop' | 'length' | 'content_filter';

/**
 * 聊天响应
 */
export interface ChatResponse {
  /** 响应 ID */
  id: string;
  /** 生成的内容 */
  content: string;
  /** 使用的模型 */
  model: string;
  /** Token 使用统计 */
  usage?: TokenUsage;
  /** 完成原因 */
  finishReason?: FinishReason;
}

/**
 * 流式响应块
 */
export interface StreamChunk {
  /** 增量内容 */
  content: string;
  /** 是否结束 */
  done: boolean;
  /** 完成时的额外信息 */
  finishData?: {
    id: string;
    model: string;
    usage?: TokenUsage;
    finishReason?: FinishReason;
  };
}

/**
 * LLM 供应商接口
 */
export interface LLMProvider {
  /** 供应商 ID */
  readonly id: string;
  /** 供应商名称 */
  readonly name: string;
  /** 供应商描述 */
  readonly description: string;
  /** 支持的模型列表 */
  readonly models: ModelInfo[];

  /**
   * 发送聊天请求
   * @param model - 模型 ID
   * @param request - 聊天请求
   * @returns 聊天响应
   */
  chat(model: string, request: ChatRequest): Promise<ChatResponse>;

  /**
   * 发送流式聊天请求
   * @param model - 模型 ID
   * @param request - 聊天请求
   * @returns 异步迭代器
   */
  streamChat?(model: string, request: ChatRequest): AsyncGenerator<StreamChunk>;

  /**
   * 检查供应商是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean;
}

/**
 * 供应商配置
 */
export interface ProviderConfig {
  /** API 基础 URL */
  baseUrl?: string;
  /** 默认温度 */
  defaultTemperature?: number;
  /** 默认最大 tokens */
  defaultMaxTokens?: number;
  /** 请求超时（毫秒） */
  timeout?: number;
}

/**
 * API 错误
 */
export interface LLMError {
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 原始错误 */
  cause?: Error;
}

/**
 * 选中的模型
 */
export interface SelectedModel {
  /** 供应商 ID */
  providerId: string;
  /** 模型 ID */
  modelId: string;
}

