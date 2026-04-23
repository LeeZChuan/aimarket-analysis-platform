# AIAssistant（对话栏）

右侧 AI 对话区域：多会话标签、消息列表、流式回复、场景/模型选择与输入。业务入口一般为 **`ChatPanel`**（如 `TradingView` / `StockDetailView`）。

## 目录与职责

| 路径 | 职责 |
|------|------|
| `ChatPanel/index.tsx` | 编排标签栏、历史弹窗、消息列表、输入框；初始化 AI 配置与会话；调用 `sendChatMessage`（SSE：`/api/conversations/:id/chat`）；同步图表选区与 `klineContext` |
| `ConversationTabBar` | 多标签切换、新建、关闭、重命名、打开历史 |
| `ConversationHistory` | 历史会话列表、搜索、删除、打开 |
| `ChatMessageList` | 用户/助手气泡；Markdown；兼容旧格式；Agent 模式下的流式工具条、正文与完成后的 `ThinkingRenderer` + `ToolCallRenderer` |
| `ChatInput` | 多行输入、图片、场景与模型选择、发送/停止 |
| `AIMessageRenderer` | 结构化 `AIMessage`（多内容块）渲染与可注册扩展 |
| `ThinkingRenderer` | 展示 Agent 返回的 `thinking` 文本（与正文分离），默认折叠 |
| `ToolCallRenderer` | 工具调用状态与入参/结果折叠展示 |
| `index.ts` | 对外导出（面板与输入等） |

各文件顶部有简要功能说明；`*/*.tsx` 与 `*/types.ts` 已对齐。

## 数据流（简要）

1. **配置**：`useAIConfigStore`（场景、供应商、模型）。
2. **会话**：`useConversationStore`（当前会话、标签、列表、流式状态、`sendChatMessage` / `stopAgentRun`）。
3. **图表上下文**：`useChartStore` 的选区在发送时写入请求的 `klineContext`（若有）。

请求须走项目统一的 `src/services/request.ts`；错误用 `src/utils/notify.ts` 提示用户。

## 消息内容形态

- **用户**：字符串。
- **助手**：可能是纯字符串 Markdown；旧版 `AIMessage` 对象；或 **Agent** 完成后的 JSON（含 `text`、`toolCalls`、`thinking`、`totalTurns` 等），由 `ChatMessageList` 解析。

## 「思考过程」与未来的「需求澄清」

- **`ThinkingRenderer`**：展示**模型/Agent 已产生的推理文本**（链上思考、与最终回答分离），偏**只读展示**，不替代用户表达需求。
- **启发式需求澄清（规划）**：通过**可选**的选择题/分步引导，帮非金融用户把目标说清，再把**结构化摘要**注入后续对话（系统提示或首条用户消息），与底层用哪家模型**解耦**。

默认行为：**不强制**走选择题；用户可直接自由输入并发送。

## 启发式引导：展示理念（与模型无关的上层）

**理念**：UI 只认一份稳定的 **「引导步骤协议」**（例如 JSON：`stepId`、`prompt`、`choices[]`、`allowSkip`、`allowFreeText`、`next` 规则），不解析各家模型的私有格式。底层换模型时，只要服务端仍产出该协议（或由纯规则引擎产出），前端组件可复用。

**建议交互**（实现时二选一或组合，待产品定稿）：

- **内嵌气泡**：在对话流中插入「引导卡片」消息类型；或
- **侧栏/折叠条**：与主对话并行，完成后一键「填入输入框」或自动附带隐藏上下文。

**前后端分工（后续迭代）**

| 层级 | 前端 | 后端 |
|------|------|------|
| 协议 | 定义 TypeScript 类型 + 渲染组件（选项按钮、跳过、自定义一句） | 返回符合协议的 `nextStep`；或提供 `POST .../guidance/step` 仅做规则/模板，不绑 OpenAI/DeepSeek 字段 |
| 状态 | 当前 `flowId`、`answers`、`currentStep`（可放 store 或会话元数据） | 可选持久化会话内引导进度 |
| 与主对话衔接 | 引导结束生成「需求摘要」字符串，由用户确认后 `onSend` 或合并进 `sendChatMessage` 的 payload | 在 chat 接口将摘要写入 system 或首条 user，**不改变**现有 SSE 消费方式 |

## 需求澄清（已实现）

- 分步说明与树状扩展设计见同目录 [GUIDANCE-IMPLEMENTATION-STEPS.md](./GUIDANCE-IMPLEMENTATION-STEPS.md)。  
- 入口：`ChatPanel` 标题栏「需求澄清」→ 先选策略 → 顺序题 → 编辑摘要 →「插入摘要并请求 AI」。  
- API：`GET /api/guidance/strategies`、`GET /api/guidance/flows/:flowId`、`POST /api/conversations/:id/guidance/advance`；主对话 `POST .../chat` 可选带 `guidanceAttachment`。

## 相关全局类型与 Store

- `src/types/conversation.ts` — `ConversationMessage`、`AgentMessageContent`、`ToolCallUIState` 等  
- `src/types/ai.ts` — `AIMessage` 等  
- `src/store/useConversationStore.ts` — 发送与流式状态  
