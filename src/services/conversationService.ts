/**
 * 对话服务
 * 提供AI对话会话和消息的管理接口
 */

import { http } from './request';
import {
  Conversation,
  ConversationWithMessages,
  ConversationMessage,
  ConversationListItem,
  ConversationFilter,
  PaginatedConversations,
  CreateConversationParams,
  UpdateConversationParams,
  ConversationStatus,
  ConversationStorage,
} from '../types/conversation';
import { AIMessage } from '../types/ai';

/**
 * 对话服务类
 * 实现 ConversationStorage 接口
 */
class ConversationService implements ConversationStorage {
  /**
   * 获取对话列表
   * @param filter - 过滤条件
   * @param limit - 每页数量
   * @param cursor - 分页游标
   */
  async getConversations(
    filter?: ConversationFilter,
    limit: number = 20,
    cursor?: string
  ): Promise<PaginatedConversations> {
    const params: Record<string, any> = {
      limit,
    };

    if (filter?.status) {
      params.status = filter.status;
    }
    if (filter?.stockSymbol) {
      params.stockSymbol = filter.stockSymbol;
    }
    if (filter?.dateFrom) {
      params.dateFrom = filter.dateFrom.toISOString();
    }
    if (filter?.dateTo) {
      params.dateTo = filter.dateTo.toISOString();
    }
    if (filter?.searchQuery) {
      params.searchQuery = filter.searchQuery;
    }
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await http.get<PaginatedConversations>('/conversations', params);
    
    // 转换日期字符串为Date对象
    const conversations = response.data.conversations.map(conv => ({
      ...conv,
      lastActivity: new Date(conv.lastActivity),
    }));

    return {
      ...response.data,
      conversations,
    };
  }

  /**
   * 获取单个对话详情（含消息）
   * @param id - 对话ID
   */
  async getConversation(id: string): Promise<ConversationWithMessages | null> {
    try {
      const response = await http.get<ConversationWithMessages>(`/conversations/${id}`);
      
      if (!response.data) {
        return null;
      }

      const data = response.data;
      
      // 转换日期字符串为Date对象
      return {
        ...data,
        metadata: {
          ...data.metadata,
          lastActivity: new Date(data.metadata.lastActivity),
        },
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        messages: data.messages.map(msg => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          content: this.parseMessageContent(msg.content),
        })),
      };
    } catch {
      return null;
    }
  }

  /**
   * 创建新对话
   * @param params - 创建参数
   */
  async createConversation(params: CreateConversationParams): Promise<Conversation> {
    const response = await http.post<{ conversation: Conversation }>('/conversations', {
      title: params.title || '新对话',
      stockSymbol: params.stockSymbol,
      stockName: params.stockName,
      stockPrice: params.stockPrice,
      tags: params.tags || [],
    });

    const data = response.data.conversation;
    
    return {
      ...data,
      metadata: {
        ...data.metadata,
        lastActivity: new Date(data.metadata.lastActivity),
      },
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * 更新对话
   * @param id - 对话ID
   * @param params - 更新参数
   */
  async updateConversation(id: string, params: UpdateConversationParams): Promise<Conversation> {
    const response = await http.put<{ conversation: Conversation }>(`/conversations/${id}`, params);

    const data = response.data.conversation;
    
    return {
      ...data,
      metadata: {
        ...data.metadata,
        lastActivity: new Date(data.metadata.lastActivity),
      },
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * 删除对话（软删除）
   * @param id - 对话ID
   */
  async deleteConversation(id: string): Promise<void> {
    await http.delete(`/conversations/${id}`);
  }

  /**
   * 添加消息到对话
   * @param conversationId - 对话ID
   * @param message - 消息内容
   */
  async addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, 'id' | 'conversationId' | 'createdAt'>
  ): Promise<ConversationMessage> {
    const contentString = typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);

    const response = await http.post<{ message: ConversationMessage }>(
      `/conversations/${conversationId}/messages`,
      {
        role: message.role,
        content: contentString,
        model: message.model || 'auto',
      }
    );

    const data = response.data.message;
    
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      content: this.parseMessageContent(data.content),
    };
  }

  /**
   * 获取对话消息列表
   * @param conversationId - 对话ID
   * @param limit - 每页数量
   * @param cursor - 分页游标
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<ConversationMessage[]> {
    const params: Record<string, any> = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await http.get<{ messages: ConversationMessage[] }>(
      `/conversations/${conversationId}/messages`,
      params
    );

    return (response.data.messages || []).map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
      content: this.parseMessageContent(msg.content),
    }));
  }

  /**
   * 解析消息内容
   * @param content - 消息内容（可能是字符串或AIMessage）
   */
  private parseMessageContent(content: string | AIMessage): string | AIMessage {
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    }
    return content;
  }
}

/**
 * 导出对话服务单例
 */
export const conversationService = new ConversationService();

/**
 * 便捷方法：创建对话
 */
export const createConversation = (params: CreateConversationParams): Promise<Conversation> =>
  conversationService.createConversation(params);

/**
 * 便捷方法：获取对话列表
 */
export const getConversations = (
  filter?: ConversationFilter,
  limit?: number,
  cursor?: string
): Promise<PaginatedConversations> => conversationService.getConversations(filter, limit, cursor);

/**
 * 便捷方法：获取单个对话
 */
export const getConversation = (id: string): Promise<ConversationWithMessages | null> =>
  conversationService.getConversation(id);

/**
 * 便捷方法：更新对话
 */
export const updateConversation = (id: string, params: UpdateConversationParams): Promise<Conversation> =>
  conversationService.updateConversation(id, params);

/**
 * 便捷方法：删除对话
 */
export const deleteConversation = (id: string): Promise<void> =>
  conversationService.deleteConversation(id);

/**
 * 便捷方法：添加消息
 */
export const addMessage = (
  conversationId: string,
  message: Omit<ConversationMessage, 'id' | 'conversationId' | 'createdAt'>
): Promise<ConversationMessage> =>
  conversationService.addMessage(conversationId, message);

/**
 * 便捷方法：获取消息列表
 */
export const getMessages = (
  conversationId: string,
  limit?: number,
  cursor?: string
): Promise<ConversationMessage[]> =>
  conversationService.getMessages(conversationId, limit, cursor);
