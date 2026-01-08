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
  ChatRequest,
  ChatSSEEvent,
  ChatResponse,
} from '../types/conversation';
import { AIMessage } from '../types/ai';

/** API 基础路径 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

  // ==================== Chat API ====================

  /**
   * 发送聊天消息（支持 SSE 流式）
   * 调用后端 POST /api/conversations/:id/chat 接口
   * 
   * @param conversationId - 对话ID
   * @param request - 聊天请求参数
   * @param onEvent - SSE 事件回调函数
   */
  async chatWithStream(
    conversationId: string,
    request: ChatRequest,
    onEvent: (event: ChatSSEEvent) => void
  ): Promise<void> {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/conversations/${conversationId}/chat?stream=1`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let errorMessage = `Chat failed: ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorMessage;
      } catch {
        if (text) errorMessage = text;
      }
      onEvent({ type: 'error', data: { message: errorMessage } });
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onEvent({ type: 'error', data: { message: 'No response body' } });
      throw new Error('No response body');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentEvent = 'message';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 事件以空行分隔
        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const lines = chunk.split('\n').map(s => s.replace(/\r$/, ''));
          let dataStr = '';
          currentEvent = 'message';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
            }
            if (line.startsWith('data:')) {
              dataStr += line.slice(5).trim();
            }
          }

          if (!dataStr) continue;

          let data: any;
          try {
            data = JSON.parse(dataStr);
          } catch {
            data = dataStr;
          }

          // 根据事件类型触发回调
          switch (currentEvent) {
            case 'meta':
              onEvent({ type: 'meta', data });
              break;
            case 'delta':
              onEvent({ type: 'delta', data });
              break;
            case 'done':
              onEvent({ type: 'done', data });
              break;
            case 'error':
              onEvent({ type: 'error', data: { message: data.message || 'Unknown error' } });
              break;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 发送聊天消息（非流式）
   * 调用后端 POST /api/conversations/:id/chat 接口
   * 
   * @param conversationId - 对话ID
   * @param request - 聊天请求参数
   * @returns 包含 user 和 assistant 消息的响应
   */
  async chat(
    conversationId: string,
    request: Omit<ChatRequest, 'stream'>
  ): Promise<ChatResponse> {
    const response = await http.post<ChatResponse>(
      `/conversations/${conversationId}/chat`,
      {
        ...request,
        stream: false,
      }
    );

    // 转换消息中的日期和内容
    const messages = (response.data.messages || []).map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
      content: this.parseMessageContent(msg.content),
    }));

    return { messages };
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

/**
 * 便捷方法：发送聊天消息（流式）
 */
export const chatWithStream = (
  conversationId: string,
  request: ChatRequest,
  onEvent: (event: ChatSSEEvent) => void
): Promise<void> =>
  conversationService.chatWithStream(conversationId, request, onEvent);

/**
 * 便捷方法：发送聊天消息（非流式）
 */
export const chat = (
  conversationId: string,
  request: Omit<ChatRequest, 'stream'>
): Promise<ChatResponse> =>
  conversationService.chat(conversationId, request);
