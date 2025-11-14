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
