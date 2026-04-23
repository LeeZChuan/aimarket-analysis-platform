/**
 * AI 助手（对话栏）模块导出入口
 *
 * 对外导出聊天面板、输入、消息列表、消息渲染、会话标签与历史等子组件。
 * 业务入口一般为 `ChatPanel`（在交易/详情视图中挂载）。
 */

export { ChatPanel } from './ChatPanel';
export { ChatInput } from './ChatInput';
export { ChatMessageList } from './ChatMessageList';
export { AIMessageRenderer } from './AIMessageRenderer';
export { ConversationHistory } from './ConversationHistory';
export { ConversationTabBar } from './ConversationTabBar';
