# 对话/消息接口与前端流式接入说明（后端已实现）

## 目标
- 前端只需要按统一流程调用接口，即可实现：**会话列表**、**历史消息**、**发送消息 + AI 流式回复**。
- 所有聊天消息最终都会写入数据库表 **`chat_history`**（Prisma 模型 `ChatHistory`），并通过触发器自动更新 **`conversations.message_count / last_activity`**。

## 鉴权与统一响应
- 所有接口都需要：
  - Header：`Authorization: Bearer <token>`
- 非 SSE 接口统一响应结构（`src/utils/response.ts`）：

```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "requestId": "req_...",
  "timestamp": 1736...
}
```

## 数据结构（前端关心的字段）
### Conversation
- `id`: string
- `title`: string
- `status`: `active | archived | deleted`
- `metadata.stockSymbol/stockName/stockPrice/tags`
- `metadata.messageCount`
- `metadata.lastActivity`

### Message（来自 chat_history）
- `id`: string
- `conversationId`: string
- `userId`: string
- `role`: `user | assistant | system`
- `content`: string
- `model`: string（如 `gpt-4` / `deepseek-chat`）
- `createdAt`: ISO datetime

## 接口清单（前端页面用这几个就够）
### 1) 创建对话
- `POST /api/conversations`
- Body：

```json
{
  "title": "AAPL技术分析",
  "stockSymbol": "AAPL",
  "stockName": "Apple Inc.",
  "stockPrice": 178.72,
  "tags": ["技术分析", "美股"]
}
```

- 返回：`data.conversation`

### 2) 会话列表（左侧列表）
- `GET /api/conversations?status=active&limit=20&cursor=<id?>`
- 返回：`data.conversations[]`

### 3) 会话详情（进入会话页：会话信息 + 全量消息）
- `GET /api/conversations/:id`
- 返回：
  - `data.conversation`
  - `data.messages[]`（按时间升序）

### 4) 分页拉取消息（可选：上拉加载历史）
- `GET /api/conversations/:id/messages?limit=50&cursor=<messageId?>`
- 返回：`data.messages[]` + `data.hasMore` + `data.cursor`

---

## 核心：发送消息 + AI 回复（支持 SSE 流式，**会写两条记录**）
### 5) 聊天接口（推荐前端只用这个发消息）
- `POST /api/conversations/:id/chat`

### 请求 Body 字段
```json
{
  "content": "请分析AAPL的技术面",
  "modelId": "gpt-4",
  "providerId": "openai",
  "sceneId": "technical",
  "expectedType": "markdown",
  "messageType": "text",
  "stream": true
}
```

- **content**：必填，用户输入
- **modelId**：可选，默认 `gpt-4`
- **providerId**：可选（`openai|deepseek`），不传则后端按 `modelId` 自动判断（`deepseek-*` → deepseek，其它 → openai）
- **sceneId**：可选，用于 system prompt（如 `technical/fundamental/...`）
- **expectedType**：可选（`text/markdown/...`），用于 system prompt（建议前端传 `markdown`）
- **messageType**：可选，默认 `text`（入库用）
- **stream**：可选，设置为 `true` 表示走 SSE（也可以用 `?stream=1` 或 `Accept: text/event-stream`）

### 非流式返回（一次性 JSON）
当你不传 `stream=true` 且不加 `Accept: text/event-stream`（也不带 `?stream=1`）时：
- 返回 HTTP 201
- `data.messages` 内包含两条消息：第一条 `user`，第二条 `assistant`

### SSE 流式返回（推荐）
触发条件满足任意一个：
- Header：`Accept: text/event-stream`
- 或 query：`?stream=1`
- 或 body：`"stream": true`

后端 SSE 事件：
- **meta**：开始信息（包含 `conversationId/userMessageId/modelId/providerId`）
- **delta**：增量 token（`{ "content": "..." }`）
- **done**：结束（包含 `assistantMessageId`、全量 `content`）
- **error**：错误信息（`{ "message": "..." }`）

前端渲染策略建议：
- 收到 **meta**：先把用户消息插入 UI（或使用你本地已显示的用户输入）
- 每个 **delta**：把 token 追加到“正在生成中的 assistant message”上（打字机效果）
- 收到 **done**：用 `assistantMessageId` 标记该消息已落库（可选）

---

## 前端（fetch）最短流式示例：解析 SSE
> `EventSource` 无法 POST，所以这里用 `fetch + ReadableStream` 解析 `text/event-stream`。

```js
async function chatStream({ baseUrl, token, conversationId, body, onEvent }) {
  const res = await fetch(`${baseUrl}/api/conversations/${conversationId}/chat?stream=1`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`chat failed: ${res.status} ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  let currentEvent = 'message';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });

    // SSE event 以空行分隔
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);

      const lines = chunk.split('\n').map(s => s.replace(/\r$/, ''));
      let dataStr = '';
      currentEvent = 'message';

      for (const line of lines) {
        if (line.startsWith('event:')) currentEvent = line.slice(6).trim();
        if (line.startsWith('data:')) dataStr += line.slice(5).trim();
      }

      if (!dataStr) continue;
      let data;
      try { data = JSON.parse(dataStr); } catch { data = dataStr; }
      onEvent?.(currentEvent, data);
    }
  }
}

// 用法示例
// chatStream({
//   baseUrl: 'http://localhost:3000',
//   token,
//   conversationId: '1',
//   body: { content: '你好', modelId: 'gpt-4', expectedType: 'markdown' },
//   onEvent: (evt, data) => {
//     if (evt === 'meta') console.log('meta', data);
//     if (evt === 'delta') appendToAssistant(data.content);
//     if (evt === 'done') finalizeAssistant(data);
//     if (evt === 'error') showError(data.message);
//   }
// })
```

---

## 环境变量（后端读取）
你只需要在部署环境配置（不要写死在代码里）：
- `OPENAI_API_KEY=...`（可选）
- `DEEPSEEK_API_KEY=...`（可选）
- `OPENAI_BASE_URL=...`（可选，有代理/网关才需要；默认 `https://api.openai.com/v1`）
- `DEEPSEEK_BASE_URL=...`（可选，有代理/网关才需要；默认 `https://api.deepseek.com/v1`）

> 注意：必须至少配置一个 Key，否则会返回“未配置 API Key”错误。


