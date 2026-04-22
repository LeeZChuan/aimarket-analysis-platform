import { AIMessage } from './ai';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface ConversationMetadata {
  stockSymbol?: string;
  stockName?: string;
  stockPrice?: number;
  tags?: string[];
  lastActivity: Date;
  messageCount: number;
}

export interface ConversationKLineContext {
  stockSymbol: string;
  stockName: string;
  timeframe: string;
  startTime: string;
  endTime: string;
  data?: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
  klineContext?: ConversationKLineContext | null;
  metadata: ConversationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string | AIMessage;
  model?: string;
  createdAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: ConversationMessage[];
}

export interface CreateConversationParams {
  title?: string;
  stockSymbol?: string;
  stockName?: string;
  stockPrice?: number;
  tags?: string[];
}

export interface UpdateConversationParams {
  title?: string;
  status?: ConversationStatus;
  metadata?: Partial<ConversationMetadata>;
}

export interface ConversationListItem {
  id: string;
  title: string;
  lastMessage?: string;
  lastActivity: Date;
  messageCount: number;
  stockSymbol?: string;
}

export interface ConversationFilter {
  status?: ConversationStatus;
  stockSymbol?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

export interface PaginatedConversations {
  conversations: ConversationListItem[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ConversationStorage {
  getConversations(filter?: ConversationFilter, limit?: number, cursor?: string): Promise<PaginatedConversations>;
  getConversation(id: string): Promise<ConversationWithMessages | null>;
  createConversation(params: CreateConversationParams): Promise<Conversation>;
  updateConversation(id: string, params: UpdateConversationParams): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  addMessage(conversationId: string, message: Omit<ConversationMessage, 'id' | 'conversationId' | 'createdAt'>): Promise<ConversationMessage>;
  getMessages(conversationId: string, limit?: number, cursor?: string): Promise<ConversationMessage[]>;
}

// ==================== Chat API Types ====================

export interface KLineContextData {
  stockSymbol: string;
  stockName: string;
  timeframe: string;
  startTime: string;
  endTime: string;
  data?: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface ChatRequest {
  content: string;
  systemPrompt?: string;
  modelId?: string;
  providerId?: string;
  sceneId?: string;
  expectedType?: string;
  messageType?: string;
  stream?: boolean;
  klineContext?: KLineContextData;
}

// ==================== ContentBlock 消息块类型 ====================

export interface TextContentBlock {
  type: 'text';
  text: string;
}

export interface ToolUseContentBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContentBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface ThinkingContentBlock {
  type: 'thinking';
  text: string;
}

export type ContentBlock =
  | TextContentBlock
  | ToolUseContentBlock
  | ToolResultContentBlock
  | ThinkingContentBlock;

// ==================== SSE 事件类型 ====================

export type ChatSSEEventType =
  | 'meta'
  | 'delta'
  | 'thinking'
  | 'tool_start'
  | 'tool_result'
  | 'turn_end'
  | 'done'
  | 'error'
  | 'ping';

export interface ChatSSEMetaData {
  conversationId: string;
  userMessageId?: string;
  modelId: string;
  providerId?: string;
  agentMode?: boolean;
  /** 断点续传用：本次 agentRunId */
  agentRunId?: string;
}

export interface ChatSSEDeltaData {
  content: string;
  seq?: number;
}

export interface ChatSSEThinkingData {
  content: string;
  seq?: number;
}

export interface ChatSSEToolStartData {
  toolUseId: string;
  toolName: string;
  input: Record<string, unknown>;
  seq?: number;
}

export interface ChatSSEToolResultData {
  toolUseId: string;
  toolName: string;
  result: string;
  isError: boolean;
  seq?: number;
}

export interface ChatSSETurnEndData {
  turnCount: number;
  seq?: number;
}

export interface ChatSSEDoneData {
  assistantMessageId: string;
  conversationId?: string;
  content: string;
  modelId?: string;
  totalTurns?: number;
  seq?: number;
}

export interface ChatSSEErrorData {
  message: string;
  seq?: number;
}

export type ChatSSEEvent =
  | { type: 'meta'; data: ChatSSEMetaData }
  | { type: 'delta'; data: ChatSSEDeltaData }
  | { type: 'thinking'; data: ChatSSEThinkingData }
  | { type: 'tool_start'; data: ChatSSEToolStartData }
  | { type: 'tool_result'; data: ChatSSEToolResultData }
  | { type: 'turn_end'; data: ChatSSETurnEndData }
  | { type: 'done'; data: ChatSSEDoneData }
  | { type: 'error'; data: ChatSSEErrorData }
  | { type: 'ping'; data: { ts: number; seq?: number } };

/**
 * 非流式聊天响应
 */
export interface ChatResponse {
  messages: ConversationMessage[];
}

// ==================== Agent UI 状态 ====================

/** 工具调用的 UI 状态 */
export interface ToolCallUIState {
  toolUseId: string;
  toolName: string;
  input: Record<string, unknown>;
  status: 'loading' | 'done' | 'error';
  result?: string;
  isError?: boolean;
}

/** Agent 模式消息（替代纯文本 content） */
export interface AgentMessageContent {
  /** 已完成的文本内容 */
  text: string;
  /** 工具调用列表（按时间顺序） */
  toolCalls: ToolCallUIState[];
  /** thinking 内容（可选） */
  thinking?: string;
  /** 是否正在流式输出 */
  isStreaming: boolean;
  /** 总轮次 */
  totalTurns?: number;
}
