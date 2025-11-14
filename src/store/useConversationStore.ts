import { create } from 'zustand';
import {
  Conversation,
  ConversationWithMessages,
  ConversationMessage,
  ConversationListItem,
  ConversationFilter,
  CreateConversationParams,
} from '../types/conversation';
import { conversationService } from '../services/conversationService';

interface ConversationState {
  activeConversationId: string | null;
  activeConversation: ConversationWithMessages | null;
  openTabs: ConversationListItem[];
  conversationList: ConversationListItem[];
  isLoading: boolean;
  error: string | null;

  setActiveConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (params?: CreateConversationParams) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  loadConversations: (filter?: ConversationFilter) => Promise<void>;
  addMessageToActive: (
    role: 'user' | 'assistant',
    content: string | any,
    model?: string
  ) => Promise<ConversationMessage | null>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
  closeTab: (conversationId: string) => void;
  openTab: (conversation: ConversationListItem) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearError: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  activeConversationId: null,
  activeConversation: null,
  openTabs: [],
  conversationList: [],
  isLoading: false,
  error: null,

  setActiveConversation: async (conversationId: string) => {
    const { openTabs } = get();
    const existingTab = openTabs.find((tab) => tab.id === conversationId);

    if (!existingTab) {
      set({ isLoading: true, error: null });
      try {
        const conversation = await conversationService.getConversation(conversationId);
        if (conversation) {
          const tabItem: ConversationListItem = {
            id: conversation.id,
            title: conversation.title,
            lastActivity: conversation.metadata.lastActivity,
            messageCount: conversation.metadata.messageCount,
            stockSymbol: conversation.metadata.stockSymbol,
          };
          set((state) => ({
            openTabs: [...state.openTabs, tabItem],
            activeConversationId: conversationId,
            activeConversation: conversation,
            isLoading: false,
          }));
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load conversation',
          isLoading: false,
        });
      }
    } else {
      set({ isLoading: true, error: null });
      try {
        const conversation = await conversationService.getConversation(conversationId);
        set({
          activeConversationId: conversationId,
          activeConversation: conversation,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load conversation',
          isLoading: false,
        });
      }
    }
  },

  createNewConversation: async (params?: CreateConversationParams) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationService.createConversation(params || {});
      const fullConversation = await conversationService.getConversation(conversation.id);

      if (fullConversation) {
        const tabItem: ConversationListItem = {
          id: conversation.id,
          title: conversation.title,
          lastActivity: conversation.metadata.lastActivity,
          messageCount: conversation.metadata.messageCount,
          stockSymbol: conversation.metadata.stockSymbol,
        };

        set((state) => ({
          openTabs: [...state.openTabs, tabItem],
          activeConversationId: conversation.id,
          activeConversation: fullConversation,
          conversationList: [tabItem, ...state.conversationList],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create conversation',
        isLoading: false,
      });
    }
  },

  loadConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationService.getConversation(conversationId);
      if (conversation) {
        set({
          activeConversationId: conversationId,
          activeConversation: conversation,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load conversation',
        isLoading: false,
      });
    }
  },

  loadConversations: async (filter?: ConversationFilter) => {
    set({ isLoading: true, error: null });
    try {
      const result = await conversationService.getConversations(filter);
      set({
        conversationList: result.conversations,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load conversations',
        isLoading: false,
      });
    }
  },

  addMessageToActive: async (
    role: 'user' | 'assistant',
    content: string | any,
    model?: string
  ): Promise<ConversationMessage | null> => {
    const { activeConversationId, activeConversation } = get();

    if (!activeConversationId || !activeConversation) {
      set({ error: 'No active conversation' });
      return null;
    }

    try {
      const message = await conversationService.addMessage(activeConversationId, {
        userId: activeConversation.userId,
        role,
        content,
        model,
      });

      set((state) => ({
        activeConversation: state.activeConversation
          ? {
              ...state.activeConversation,
              messages: [...state.activeConversation.messages, message],
              metadata: {
                ...state.activeConversation.metadata,
                messageCount: state.activeConversation.metadata.messageCount + 1,
                lastActivity: message.createdAt,
              },
            }
          : null,
        openTabs: state.openTabs.map((tab) =>
          tab.id === activeConversationId
            ? {
                ...tab,
                messageCount: tab.messageCount + 1,
                lastActivity: message.createdAt,
                lastMessage: typeof content === 'string' ? content.substring(0, 100) : 'AI Message',
              }
            : tab
        ),
      }));

      return message;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add message',
      });
      return null;
    }
  },

  updateConversationTitle: async (conversationId: string, title: string) => {
    try {
      await conversationService.updateConversation(conversationId, { title });

      set((state) => ({
        activeConversation:
          state.activeConversation?.id === conversationId
            ? { ...state.activeConversation, title }
            : state.activeConversation,
        openTabs: state.openTabs.map((tab) =>
          tab.id === conversationId ? { ...tab, title } : tab
        ),
        conversationList: state.conversationList.map((conv) =>
          conv.id === conversationId ? { ...conv, title } : conv
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update title',
      });
    }
  },

  closeTab: (conversationId: string) => {
    set((state) => {
      const newTabs = state.openTabs.filter((tab) => tab.id !== conversationId);
      const isClosingActive = state.activeConversationId === conversationId;

      if (isClosingActive && newTabs.length > 0) {
        const newActiveId = newTabs[newTabs.length - 1].id;
        conversationService.getConversation(newActiveId).then((conversation) => {
          set({
            activeConversationId: newActiveId,
            activeConversation: conversation,
          });
        });

        return {
          openTabs: newTabs,
          activeConversationId: newActiveId,
        };
      }

      return {
        openTabs: newTabs,
        activeConversationId: isClosingActive ? null : state.activeConversationId,
        activeConversation: isClosingActive ? null : state.activeConversation,
      };
    });
  },

  openTab: (conversation: ConversationListItem) => {
    const { openTabs } = get();
    if (!openTabs.find((tab) => tab.id === conversation.id)) {
      set((state) => ({
        openTabs: [...state.openTabs, conversation],
      }));
    }
    get().setActiveConversation(conversation.id);
  },

  deleteConversation: async (conversationId: string) => {
    try {
      await conversationService.deleteConversation(conversationId);

      set((state) => ({
        openTabs: state.openTabs.filter((tab) => tab.id !== conversationId),
        conversationList: state.conversationList.filter((conv) => conv.id !== conversationId),
        activeConversationId:
          state.activeConversationId === conversationId ? null : state.activeConversationId,
        activeConversation:
          state.activeConversationId === conversationId ? null : state.activeConversation,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete conversation',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
