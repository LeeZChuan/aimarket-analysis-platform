import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not found. Conversation features will not work.');
      console.warn('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}

class ConversationService implements ConversationStorage {
  async getConversations(
    filter?: ConversationFilter,
    limit: number = 20,
    cursor?: string
  ): Promise<PaginatedConversations> {
    const client = getSupabaseClient();
    let query = client
      .from('conversations')
      .select('id, title, stock_symbol, last_activity, message_count, created_at', { count: 'exact' })
      .order('last_activity', { ascending: false })
      .limit(limit);

    if (filter?.status) {
      query = query.eq('status', filter.status);
    } else {
      query = query.eq('status', ConversationStatus.ACTIVE);
    }

    if (filter?.stockSymbol) {
      query = query.eq('stock_symbol', filter.stockSymbol);
    }

    if (filter?.dateFrom) {
      query = query.gte('created_at', filter.dateFrom.toISOString());
    }

    if (filter?.dateTo) {
      query = query.lte('created_at', filter.dateTo.toISOString());
    }

    if (filter?.searchQuery) {
      query = query.ilike('title', `%${filter.searchQuery}%`);
    }

    if (cursor) {
      query = query.lt('last_activity', cursor);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    const conversations: ConversationListItem[] = await Promise.all(
      (data || []).map(async (conv) => {
        const { data: lastMsg } = await client
          .from('chat_history')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let lastMessage: string | undefined;
        if (lastMsg?.content) {
          try {
            const parsed = JSON.parse(lastMsg.content);
            lastMessage = typeof parsed === 'string' ? parsed : parsed.content || 'AI Message';
          } catch {
            lastMessage = lastMsg.content.substring(0, 100);
          }
        }

        return {
          id: conv.id,
          title: conv.title,
          lastMessage,
          lastActivity: new Date(conv.last_activity),
          messageCount: conv.message_count,
          stockSymbol: conv.stock_symbol,
        };
      })
    );

    return {
      conversations,
      total: count || 0,
      hasMore: (data?.length || 0) === limit,
      cursor: data && data.length > 0 ? data[data.length - 1].last_activity : undefined,
    };
  }

  async getConversation(id: string): Promise<ConversationWithMessages | null> {
    const client = getSupabaseClient();
    const { data: convData, error: convError } = await client
      .from('conversations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (convError || !convData) {
      return null;
    }

    const { data: messagesData, error: messagesError } = await client
      .from('chat_history')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`);
    }

    const messages: ConversationMessage[] = (messagesData || []).map((msg) => {
      let content: string | AIMessage;
      try {
        content = JSON.parse(msg.content);
      } catch {
        content = msg.content;
      }

      return {
        id: msg.id,
        conversationId: msg.conversation_id,
        userId: msg.user_id,
        role: msg.role as 'user' | 'assistant',
        content,
        model: msg.model,
        createdAt: new Date(msg.created_at),
      };
    });

    const conversation: ConversationWithMessages = {
      id: convData.id,
      userId: convData.user_id,
      title: convData.title,
      status: convData.status as ConversationStatus,
      metadata: {
        stockSymbol: convData.stock_symbol,
        stockName: convData.stock_name,
        stockPrice: convData.stock_price ? parseFloat(convData.stock_price) : undefined,
        tags: convData.tags || [],
        lastActivity: new Date(convData.last_activity),
        messageCount: convData.message_count,
      },
      createdAt: new Date(convData.created_at),
      updatedAt: new Date(convData.updated_at),
      messages,
    };

    return conversation;
  }

  async createConversation(params: CreateConversationParams): Promise<Conversation> {
    const client = getSupabaseClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await client
      .from('conversations')
      .insert({
        user_id: userData.user.id,
        title: params.title || 'New Conversation',
        stock_symbol: params.stockSymbol,
        stock_name: params.stockName,
        stock_price: params.stockPrice,
        tags: params.tags || [],
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create conversation: ${error?.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      status: data.status as ConversationStatus,
      metadata: {
        stockSymbol: data.stock_symbol,
        stockName: data.stock_name,
        stockPrice: data.stock_price ? parseFloat(data.stock_price) : undefined,
        tags: data.tags || [],
        lastActivity: new Date(data.last_activity),
        messageCount: data.message_count,
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateConversation(id: string, params: UpdateConversationParams): Promise<Conversation> {
    const client = getSupabaseClient();
    const updateData: any = {};

    if (params.title !== undefined) {
      updateData.title = params.title;
    }

    if (params.status !== undefined) {
      updateData.status = params.status;
    }

    if (params.metadata) {
      if (params.metadata.stockSymbol !== undefined) {
        updateData.stock_symbol = params.metadata.stockSymbol;
      }
      if (params.metadata.stockName !== undefined) {
        updateData.stock_name = params.metadata.stockName;
      }
      if (params.metadata.stockPrice !== undefined) {
        updateData.stock_price = params.metadata.stockPrice;
      }
      if (params.metadata.tags !== undefined) {
        updateData.tags = params.metadata.tags;
      }
    }

    const { data, error } = await client
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update conversation: ${error?.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      status: data.status as ConversationStatus,
      metadata: {
        stockSymbol: data.stock_symbol,
        stockName: data.stock_name,
        stockPrice: data.stock_price ? parseFloat(data.stock_price) : undefined,
        tags: data.tags || [],
        lastActivity: new Date(data.last_activity),
        messageCount: data.message_count,
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async deleteConversation(id: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from('conversations')
      .update({ status: ConversationStatus.DELETED })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  async addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, 'id' | 'conversationId' | 'createdAt'>
  ): Promise<ConversationMessage> {
    const client = getSupabaseClient();
    const contentString = typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);

    const { data, error } = await client
      .from('chat_history')
      .insert({
        conversation_id: conversationId,
        user_id: message.userId,
        role: message.role,
        content: contentString,
        model: message.model || 'auto',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to add message: ${error?.message}`);
    }

    let content: string | AIMessage;
    try {
      content = JSON.parse(data.content);
    } catch {
      content = data.content;
    }

    return {
      id: data.id,
      conversationId: data.conversation_id,
      userId: data.user_id,
      role: data.role as 'user' | 'assistant',
      content,
      model: data.model,
      createdAt: new Date(data.created_at),
    };
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<ConversationMessage[]> {
    const client = getSupabaseClient();
    let query = client
      .from('chat_history')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return (data || []).map((msg) => {
      let content: string | AIMessage;
      try {
        content = JSON.parse(msg.content);
      } catch {
        content = msg.content;
      }

      return {
        id: msg.id,
        conversationId: msg.conversation_id,
        userId: msg.user_id,
        role: msg.role as 'user' | 'assistant',
        content,
        model: msg.model,
        createdAt: new Date(msg.created_at),
      };
    });
  }
}

export const conversationService = new ConversationService();

export const createConversation = (params: CreateConversationParams): Promise<Conversation> =>
  conversationService.createConversation(params);

export const getConversations = (
  filter?: ConversationFilter,
  limit?: number,
  cursor?: string
): Promise<PaginatedConversations> => conversationService.getConversations(filter, limit, cursor);

export const getConversation = (id: string): Promise<ConversationWithMessages | null> =>
  conversationService.getConversation(id);
