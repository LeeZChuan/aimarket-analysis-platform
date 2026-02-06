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

export interface KLineContextData {
  stockSymbol: string;
  stockName: string;
  timeframe: string;
  startTime: string;
  endTime: string;
  data: Array<{
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
