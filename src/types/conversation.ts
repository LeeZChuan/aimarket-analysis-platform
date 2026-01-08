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

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
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

/**
 * 聊天请求参数
 * 对应后端 POST /api/conversations/:id/chat 接口
 */
export interface ChatRequest {
  /** 用户输入内容（必填） */
  content: string;
  /** 模型ID，如 gpt-4 / deepseek-chat */
  modelId?: string;
  /** 供应商ID，如 openai / deepseek */
  providerId?: string;
  /** 场景ID，用于 system prompt */
  sceneId?: string;
  /** 期望响应类型，如 text / markdown */
  expectedType?: string;
  /** 消息类型，默认 text */
  messageType?: string;
  /** 是否启用流式返回 */
  stream?: boolean;
}

/**
 * SSE 事件类型
 */
export type ChatSSEEventType = 'meta' | 'delta' | 'done' | 'error';

/**
 * SSE meta 事件数据
 */
export interface ChatSSEMetaData {
  conversationId: string;
  userMessageId: string;
  modelId: string;
  providerId: string;
}

/**
 * SSE delta 事件数据
 */
export interface ChatSSEDeltaData {
  content: string;
}

/**
 * SSE done 事件数据
 */
export interface ChatSSEDoneData {
  assistantMessageId: string;
  content: string;
}

/**
 * SSE error 事件数据
 */
export interface ChatSSEErrorData {
  message: string;
}

/**
 * SSE 事件联合类型
 */
export type ChatSSEEvent =
  | { type: 'meta'; data: ChatSSEMetaData }
  | { type: 'delta'; data: ChatSSEDeltaData }
  | { type: 'done'; data: ChatSSEDoneData }
  | { type: 'error'; data: ChatSSEErrorData };

/**
 * 非流式聊天响应
 */
export interface ChatResponse {
  messages: ConversationMessage[];
}
