import { create } from 'zustand';
import {
  ConversationWithMessages,
  ConversationMessage,
  ConversationListItem,
  ConversationFilter,
  CreateConversationParams,
  ConversationStatus,
  ChatRequest,
  ChatSSEEvent,
  ToolCallUIState,
  AgentMessageContent,
  PlannerEnterRequest,
  PlannerResponsePayload,
  PlannerState,
  PlanSuggestionEvent,
  ChatRunResult,
} from '../types/conversation';
import type { AIMessage } from '../types/ai';
import { conversationService } from '../services/conversationService';
import { notifyError } from '../utils/notify';

// 当前项目统一走后端接口，不使用本地模式/Mock
const DEFAULT_USE_LOCAL_MODE = false;

interface LocalConversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  stockSymbol?: string;
  stockName?: string;
  stockPrice?: number;
  createdAt: Date;
  lastActivity: Date;
}

interface ConversationState {
  activeConversationId: string | null;
  activeConversation: ConversationWithMessages | null;
  openTabs: ConversationListItem[];
  conversationList: ConversationListItem[];
  localConversations: Map<string, LocalConversation>;
  isLoading: boolean;
  error: string | null;
  useLocalMode: boolean;

  // 流式消息状态
  streamingMessageId: string | null;
  streamingContent: string;
  isStreaming: boolean;

  // Agent 模式状态
  /** 正在进行中的工具调用列表（按顺序） */
  activeToolCalls: ToolCallUIState[];
  /** 当前 thinking 内容 */
  activeThinking: string;
  /** 当前工具调用轮次 */
  currentTurn: number;
  /** SSE 中断控制器（用于用户主动停止） */
  _abortController: AbortController | null;
  plannerState: PlannerState | null;
  planSuggestion: PlanSuggestionEvent | null;

  setActiveConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (params?: CreateConversationParams) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  loadConversations: (filter?: ConversationFilter) => Promise<void>;
  addMessageToActive: (
    role: 'user' | 'assistant',
    content: string | AIMessage,
    model?: string
  ) => Promise<ConversationMessage | null>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
  closeTab: (conversationId: string) => void;
  openTab: (conversation: ConversationListItem) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearError: () => void;
  initializeDefaultConversation: () => void;

  // 流式消息管理方法
  /** 添加本地用户消息到 UI（不调用后端，仅用于即时显示） */
  addLocalUserMessage: (content: string) => ConversationMessage | null;
  /** 开始流式消息（创建占位消息） */
  startStreamingMessage: (messageId: string, model?: string) => void;
  /** 追加内容到流式消息 */
  appendToStreamingMessage: (content: string) => void;
  /** 完成流式消息 */
  finalizeStreamingMessage: (messageId: string, fullContent: string) => void;
  /** 发送聊天消息（集成 Agent 流式处理） */
  sendChatMessage: (request: ChatRequest) => Promise<ChatRunResult>;
  /** 停止正在进行的 Agent 运行 */
  stopAgentRun: () => void;
  loadPlannerState: (conversationId: string) => Promise<void>;
  enterPlannerMode: (payload?: PlannerEnterRequest) => Promise<PlannerState | null>;
  respondPlanner: (payload: PlannerResponsePayload) => Promise<PlannerState | null>;
  setPlanSuggestion: (payload: PlanSuggestionEvent | null) => void;
  clearPlannerState: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  activeConversationId: null,
  activeConversation: null,
  openTabs: [],
  conversationList: [],
  localConversations: new Map(),
  isLoading: false,
  error: null,
  useLocalMode: DEFAULT_USE_LOCAL_MODE,

  // 流式消息状态初始值
  streamingMessageId: null,
  streamingContent: '',
  isStreaming: false,

  // Agent 模式状态初始值
  activeToolCalls: [],
  activeThinking: '',
  currentTurn: 0,
  _abortController: null,
  plannerState: null,
  planSuggestion: null,

  setActiveConversation: async (conversationId: string) => {
    const { useLocalMode, localConversations } = get();

    if (useLocalMode && conversationId.startsWith('local_')) {
      const localConv = localConversations.get(conversationId);
      if (localConv) {
        const fullConversation: ConversationWithMessages = {
          id: localConv.id,
          userId: 'local',
          title: localConv.title,
          status: ConversationStatus.ACTIVE,
          metadata: {
            stockSymbol: localConv.stockSymbol,
            stockName: localConv.stockName,
            stockPrice: localConv.stockPrice,
            tags: [],
            lastActivity: localConv.lastActivity,
            messageCount: localConv.messages.length,
          },
          createdAt: localConv.createdAt,
          updatedAt: localConv.lastActivity,
          messages: localConv.messages,
        };

        set({
          activeConversationId: conversationId,
          activeConversation: fullConversation,
        });
      }
      return;
    }

    const { openTabs } = get();
    const existingTab = openTabs.find((tab) => tab.id === conversationId);

    if (!existingTab) {
      set({ isLoading: true, error: null });
      try {
        const conversation = await conversationService.getConversation(conversationId);
        const plannerState = await conversationService.getPlannerState(conversationId);
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
            plannerState,
            planSuggestion: plannerState?.lastSuggestion ?? null,
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
        const plannerState = await conversationService.getPlannerState(conversationId);
        set({
          activeConversationId: conversationId,
          activeConversation: conversation,
          plannerState,
          planSuggestion: plannerState?.lastSuggestion ?? null,
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
    const { useLocalMode, localConversations } = get();

    if (useLocalMode) {
      const newId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const localConv: LocalConversation = {
        id: newId,
        title: params?.title || 'New Conversation',
        messages: [],
        stockSymbol: params?.stockSymbol,
        stockName: params?.stockName,
        stockPrice: params?.stockPrice,
        createdAt: now,
        lastActivity: now,
      };

      const newLocalConversations = new Map(localConversations);
      newLocalConversations.set(newId, localConv);

      const fullConversation: ConversationWithMessages = {
        id: newId,
        userId: 'local',
        title: localConv.title,
        status: ConversationStatus.ACTIVE,
        metadata: {
          stockSymbol: localConv.stockSymbol,
          stockName: localConv.stockName,
          stockPrice: localConv.stockPrice,
          tags: [],
          lastActivity: now,
          messageCount: 0,
        },
        createdAt: now,
        updatedAt: now,
        messages: [],
      };

      const tabItem: ConversationListItem = {
        id: newId,
        title: localConv.title,
        lastActivity: now,
        messageCount: 0,
        stockSymbol: localConv.stockSymbol,
      };

      set((state) => ({
        localConversations: newLocalConversations,
        openTabs: [...state.openTabs, tabItem],
        activeConversationId: newId,
        activeConversation: fullConversation,
        conversationList: [tabItem, ...state.conversationList],
        plannerState: null,
        planSuggestion: null,
      }));
      return;
    }

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
          plannerState: null,
          planSuggestion: null,
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
      const plannerState = await conversationService.getPlannerState(conversationId);
      if (conversation) {
        set({
          activeConversationId: conversationId,
          activeConversation: conversation,
          plannerState,
          planSuggestion: plannerState?.lastSuggestion ?? null,
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
    const { useLocalMode, localConversations } = get();

    if (useLocalMode) {
      const localList: ConversationListItem[] = Array.from(localConversations.values()).map(
        (conv) => ({
          // local 模式下 content 可能是结构化 AIMessage，这里只截取字符串用于列表展示
          id: conv.id,
          title: conv.title,
          lastActivity: conv.lastActivity,
          messageCount: conv.messages.length,
          stockSymbol: conv.stockSymbol,
          lastMessage:
            conv.messages.length > 0
              ? (() => {
                  const lastContent = conv.messages[conv.messages.length - 1].content;
                  return typeof lastContent === 'string'
                    ? lastContent.substring(0, 100)
                    : 'AI Message';
                })()
              : undefined,
        })
      );

      localList.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

      set({
        conversationList: localList,
        isLoading: false,
      });
      return;
    }

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
    content: string | AIMessage,
    model?: string
  ): Promise<ConversationMessage | null> => {
    const { activeConversationId, activeConversation, useLocalMode, localConversations } = get();

    if (!activeConversationId || !activeConversation) {
      set({ error: 'No active conversation' });
      return null;
    }

    if (useLocalMode && activeConversationId.startsWith('local_')) {
      const now = new Date();
      const newMessage: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: activeConversationId,
        userId: 'local',
        role,
        content,
        model,
        createdAt: now,
      };

      const localConv = localConversations.get(activeConversationId);
      if (localConv) {
        const isFirstUserMessage = role === 'user' && localConv.messages.filter(m => m.role === 'user').length === 0;
        const newTitle = isFirstUserMessage && typeof content === 'string'
          ? content.substring(0, 50)
          : localConv.title;

        const updatedLocalConv: LocalConversation = {
          ...localConv,
          title: newTitle,
          messages: [...localConv.messages, newMessage],
          lastActivity: now,
        };
        const newLocalConversations = new Map(localConversations);
        newLocalConversations.set(activeConversationId, updatedLocalConv);

        set((state) => ({
          localConversations: newLocalConversations,
          activeConversation: state.activeConversation
            ? {
                ...state.activeConversation,
                title: newTitle,
                messages: [...state.activeConversation.messages, newMessage],
                metadata: {
                  ...state.activeConversation.metadata,
                  messageCount: state.activeConversation.metadata.messageCount + 1,
                  lastActivity: now,
                },
              }
            : null,
          openTabs: state.openTabs.map((tab) =>
            tab.id === activeConversationId
              ? {
                  ...tab,
                  title: newTitle,
                  messageCount: tab.messageCount + 1,
                  lastActivity: now,
                  lastMessage: typeof content === 'string' ? content.substring(0, 100) : 'AI Message',
                }
              : tab
          ),
          conversationList: state.conversationList.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  title: newTitle,
                  messageCount: conv.messageCount + 1,
                  lastActivity: now,
                  lastMessage: typeof content === 'string' ? content.substring(0, 100) : 'AI Message',
                }
              : conv
          ),
        }));
      }

      return newMessage;
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
    const { useLocalMode, localConversations } = get();

    if (useLocalMode && conversationId.startsWith('local_')) {
      const localConv = localConversations.get(conversationId);
      if (localConv) {
        const updatedLocalConv: LocalConversation = {
          ...localConv,
          title,
        };
        const newLocalConversations = new Map(localConversations);
        newLocalConversations.set(conversationId, updatedLocalConv);

        set((state) => ({
          localConversations: newLocalConversations,
          activeConversation:
            state.activeConversation?.id === conversationId
              ? { ...state.activeConversation, title }
              : state.activeConversation,
          openTabs: state.openTabs.map((tab) =>
            tab.id === conversationId ? { ...tab, title } : tab
          ),
        }));
      }
      return;
    }

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

        if (state.useLocalMode && newActiveId.startsWith('local_')) {
          const localConv = state.localConversations.get(newActiveId);
          if (localConv) {
            const fullConversation: ConversationWithMessages = {
              id: localConv.id,
              userId: 'local',
              title: localConv.title,
              status: ConversationStatus.ACTIVE,
              metadata: {
                stockSymbol: localConv.stockSymbol,
                stockName: localConv.stockName,
                stockPrice: localConv.stockPrice,
                tags: [],
                lastActivity: localConv.lastActivity,
                messageCount: localConv.messages.length,
              },
              createdAt: localConv.createdAt,
              updatedAt: localConv.lastActivity,
              messages: localConv.messages,
            };

            return {
              openTabs: newTabs,
              activeConversationId: newActiveId,
              activeConversation: fullConversation,
            };
          }
        } else {
          Promise.all([
            conversationService.getConversation(newActiveId),
            conversationService.getPlannerState(newActiveId),
          ]).then(([conversation, plannerState]) => {
            set({
              activeConversationId: newActiveId,
              activeConversation: conversation,
              plannerState,
              planSuggestion: plannerState?.lastSuggestion ?? null,
            });
          });
        }

        return {
          openTabs: newTabs,
          activeConversationId: newActiveId,
        };
      }

      return {
        openTabs: newTabs,
        activeConversationId: isClosingActive ? null : state.activeConversationId,
        activeConversation: isClosingActive ? null : state.activeConversation,
        plannerState: isClosingActive ? null : state.plannerState,
        planSuggestion: isClosingActive ? null : state.planSuggestion,
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
    const { useLocalMode, localConversations } = get();

    if (useLocalMode && conversationId.startsWith('local_')) {
      const newLocalConversations = new Map(localConversations);
      newLocalConversations.delete(conversationId);

      set((state) => ({
        localConversations: newLocalConversations,
        openTabs: state.openTabs.filter((tab) => tab.id !== conversationId),
        conversationList: state.conversationList.filter((conv) => conv.id !== conversationId),
        activeConversationId:
          state.activeConversationId === conversationId ? null : state.activeConversationId,
        activeConversation:
          state.activeConversationId === conversationId ? null : state.activeConversation,
        plannerState:
          state.activeConversationId === conversationId ? null : state.plannerState,
        planSuggestion:
          state.activeConversationId === conversationId ? null : state.planSuggestion,
      }));
      return;
    }

    try {
      await conversationService.deleteConversation(conversationId);

      set((state) => ({
        openTabs: state.openTabs.filter((tab) => tab.id !== conversationId),
        conversationList: state.conversationList.filter((conv) => conv.id !== conversationId),
        activeConversationId:
          state.activeConversationId === conversationId ? null : state.activeConversationId,
        activeConversation:
          state.activeConversationId === conversationId ? null : state.activeConversation,
        plannerState:
          state.activeConversationId === conversationId ? null : state.plannerState,
        planSuggestion:
          state.activeConversationId === conversationId ? null : state.planSuggestion,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete conversation',
      });
    }
  },

  clearError: () => set({ error: null }),

  initializeDefaultConversation: () => {
    const { openTabs, activeConversationId, useLocalMode } = get();
    // local 模式下：默认创建一个本地会话，保证用户打开面板即可直接输入
    // remote 模式下：不自动创建空会话；仅在用户首次发送消息时再创建（避免无意义的后端会话记录）
    if (!useLocalMode) return;
    if (openTabs.length === 0 && !activeConversationId) {
      get().createNewConversation({ title: 'New Conversation' });
    }
  },

  // ==================== 流式消息管理方法 ====================

  addLocalUserMessage: (content: string): ConversationMessage | null => {
    const { activeConversationId, activeConversation } = get();
    if (!activeConversationId || !activeConversation) {
      return null;
    }

    const now = new Date();
    const newMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: activeConversationId,
      userId: activeConversation.userId,
      role: 'user',
      content,
      createdAt: now,
    };

    // 更新本地状态，立即显示用户消息
    set((state) => ({
      activeConversation: state.activeConversation
        ? {
            ...state.activeConversation,
            messages: [...state.activeConversation.messages, newMessage],
            metadata: {
              ...state.activeConversation.metadata,
              messageCount: state.activeConversation.metadata.messageCount + 1,
              lastActivity: now,
            },
          }
        : null,
      openTabs: state.openTabs.map((tab) =>
        tab.id === activeConversationId
          ? {
              ...tab,
              messageCount: tab.messageCount + 1,
              lastActivity: now,
              lastMessage: content.substring(0, 100),
            }
          : tab
      ),
    }));

    return newMessage;
  },

  startStreamingMessage: (messageId: string, model?: string) => {
    const { activeConversationId, activeConversation } = get();
    if (!activeConversationId || !activeConversation) return;

    const now = new Date();
    const streamingMessage: ConversationMessage = {
      id: messageId,
      conversationId: activeConversationId,
      userId: activeConversation.userId,
      role: 'assistant',
      content: '',
      model,
      createdAt: now,
    };

    set((state) => ({
      streamingMessageId: messageId,
      streamingContent: '',
      isStreaming: true,
      activeConversation: state.activeConversation
        ? {
            ...state.activeConversation,
            messages: [...state.activeConversation.messages, streamingMessage],
          }
        : null,
    }));
  },

  appendToStreamingMessage: (content: string) => {
    const { streamingMessageId, activeConversation } = get();
    if (!streamingMessageId || !activeConversation) return;

    set((state) => {
      const newStreamingContent = state.streamingContent + content;
      return {
        streamingContent: newStreamingContent,
        activeConversation: state.activeConversation
          ? {
              ...state.activeConversation,
              messages: state.activeConversation.messages.map((msg) =>
                msg.id === streamingMessageId
                  ? { ...msg, content: newStreamingContent }
                  : msg
              ),
            }
          : null,
      };
    });
  },

  finalizeStreamingMessage: (messageId: string, fullContent: string) => {
    const { activeConversationId, activeConversation } = get();
    if (!activeConversation) return;

    const now = new Date();

    set((state) => ({
      streamingMessageId: null,
      streamingContent: '',
      isStreaming: false,
      activeConversation: state.activeConversation
        ? {
            ...state.activeConversation,
            messages: state.activeConversation.messages.map((msg) =>
              msg.id === state.streamingMessageId || msg.id === messageId
                ? { ...msg, id: messageId, content: fullContent }
                : msg
            ),
            metadata: {
              ...state.activeConversation.metadata,
              messageCount: state.activeConversation.metadata.messageCount + 1,
              lastActivity: now,
            },
          }
        : null,
      openTabs: state.openTabs.map((tab) =>
        tab.id === activeConversationId
          ? {
              ...tab,
              messageCount: tab.messageCount + 1,
              lastActivity: now,
              lastMessage: fullContent.substring(0, 100),
            }
          : tab
      ),
    }));
  },

  sendChatMessage: async (request: ChatRequest): Promise<ChatRunResult> => {
    const { activeConversationId, addLocalUserMessage, startStreamingMessage, appendToStreamingMessage, finalizeStreamingMessage } = get();

    if (!activeConversationId) {
      set({ error: 'No active conversation' });
      return { status: 'error', error: 'No active conversation' };
    }

    // 显示用户原始输入
    addLocalUserMessage(request.content);

    // 创建中断控制器（支持用户手动停止）
    const abortController = new AbortController();
    set({
      isLoading: true,
      error: null,
      _abortController: abortController,
      activeToolCalls: [],
      activeThinking: '',
      currentTurn: 0,
      planSuggestion: null,
    });

    const tempMessageId = `temp_${Date.now()}`;
    let hasStartedStreaming = false;
    let timedOut = false;
    let finalResult: ChatRunResult = { status: 'error', error: '响应未完成' };

    // 心跳超时检测：30s 未收到任何事件则判定断线
    let lastEventTime = Date.now();
    const heartbeatCheck = setInterval(() => {
      const state = get();
      if (Date.now() - lastEventTime > 30_000 && (state.isStreaming || state.isLoading)) {
        timedOut = true;
        clearInterval(heartbeatCheck);
        // 超时：标记错误但不重连（避免重复请求）
        const partialContent = state.streamingContent;
        if (hasStartedStreaming) {
          finalizeStreamingMessage(tempMessageId, partialContent + '\n\n⚠️ 连接超时，响应可能不完整。');
        }
        finalResult = { status: 'error', error: '连接超时，响应可能不完整。' };
        set({ isLoading: false, isStreaming: false, streamingMessageId: null, _abortController: null });
        abortController.abort();
      }
    }, 5_000);

    try {
      await conversationService.chatWithStream(
        activeConversationId,
        request,
        (event: ChatSSEEvent) => {
          lastEventTime = Date.now(); // 重置心跳计时

          switch (event.type) {
            case 'plan_suggestion':
              finalResult = { status: 'plan_suggested' };
              set({
                planSuggestion: event.data,
                plannerState: event.data.plannerState ?? {
                  mode: 'plan_suggested',
                  autoSuggestDismissed: false,
                  answers: [],
                  currentQuestion: null,
                  draftPlan: null,
                  confirmedPlan: null,
                  lastIntentSummary: request.content,
                  lastSuggestion: event.data,
                  updatedAt: new Date().toISOString(),
                },
                isLoading: false,
                isStreaming: false,
                streamingMessageId: null,
                streamingContent: '',
                activeToolCalls: [],
                activeThinking: '',
                currentTurn: 0,
                _abortController: null,
              });
              break;
            case 'meta':
              if (!hasStartedStreaming) {
                startStreamingMessage(tempMessageId, request.modelId);
                hasStartedStreaming = true;
              }
              break;

            case 'delta':
              if (event.data.content) {
                appendToStreamingMessage(event.data.content);
              }
              break;

            case 'thinking':
              set({ activeThinking: get().activeThinking + event.data.content });
              break;

            case 'tool_start': {
              const newToolCall: ToolCallUIState = {
                toolUseId: event.data.toolUseId,
                toolName: event.data.toolName,
                input: event.data.input,
                status: 'loading',
              };
              set(state => ({ activeToolCalls: [...state.activeToolCalls, newToolCall] }));
              break;
            }

            case 'tool_result':
              set(state => ({
                activeToolCalls: state.activeToolCalls.map(tc =>
                  tc.toolUseId === event.data.toolUseId
                    ? { ...tc, status: event.data.isError ? 'error' : 'done', result: event.data.result, isError: event.data.isError }
                    : tc
                ),
              }));
              break;

            case 'turn_end':
              set({ currentTurn: event.data.turnCount });
              break;

            case 'ping':
              // 心跳，仅用于重置超时计时，无需其他操作
              break;

            case 'done': {
              const finalContent = event.data.content;
              const toolCalls = get().activeToolCalls;
              // 将工具调用信息附加到最终内容（序列化为 AgentMessageContent 供渲染层使用）
              const agentContent: AgentMessageContent = {
                text: finalContent,
                toolCalls,
                thinking: get().activeThinking || undefined,
                isStreaming: false,
                totalTurns: event.data.totalTurns,
              };
              finalizeStreamingMessage(
                event.data.assistantMessageId,
                JSON.stringify(agentContent),
              );
              finalResult = { status: 'done', assistantMessageId: event.data.assistantMessageId };
              set({ isLoading: false, activeToolCalls: [], activeThinking: '', currentTurn: 0, _abortController: null });
              break;
            }

            case 'error':
              finalResult = { status: 'error', error: event.data.message };
              notifyError('AI 响应失败', event.data.message);
              set({
                error: event.data.message,
                isLoading: false,
                isStreaming: false,
                streamingMessageId: null,
                streamingContent: '',
                activeToolCalls: [],
                activeThinking: '',
                _abortController: null,
              });
              if (hasStartedStreaming) {
                finalizeStreamingMessage(tempMessageId, `⚠️ 错误: ${event.data.message}`);
              }
              break;
          }
        },
        abortController.signal,
      );
    } catch (error) {
      // AbortError 是用户主动停止，不显示错误 toast
      if (error instanceof Error && error.name === 'AbortError') {
        if (!timedOut) {
          const partialContent = get().streamingContent;
          if (hasStartedStreaming && partialContent) {
            finalizeStreamingMessage(tempMessageId, partialContent + '\n\n*(已停止)*');
          } else if (hasStartedStreaming) {
            finalizeStreamingMessage(tempMessageId, '*(已停止)*');
          }
          finalResult = { status: 'stopped' };
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : '发送消息失败';
        finalResult = finalResult.status === 'error'
          ? finalResult
          : { status: 'error', error: errorMessage };
        notifyError('发送消息失败', errorMessage);
        if (hasStartedStreaming) {
          finalizeStreamingMessage(tempMessageId, `⚠️ 错误: ${errorMessage}`);
        }
      }
      set({
        error: null,
        isLoading: false,
        isStreaming: false,
        streamingMessageId: null,
        streamingContent: '',
        activeToolCalls: [],
        activeThinking: '',
        _abortController: null,
      });
    } finally {
      clearInterval(heartbeatCheck);
    }

    return finalResult;
  },

  stopAgentRun: () => {
    const { _abortController } = get();
    if (_abortController) {
      _abortController.abort();
    }
  },

  loadPlannerState: async (conversationId: string) => {
    const plannerState = await conversationService.getPlannerState(conversationId);
    set({
      plannerState,
      planSuggestion: plannerState?.lastSuggestion ?? null,
    });
  },

  enterPlannerMode: async (payload) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return null;
    const plannerState = await conversationService.enterPlanner(activeConversationId, payload || {});
    set({
      plannerState,
      planSuggestion: plannerState.lastSuggestion ?? null,
    });
    return plannerState;
  },

  respondPlanner: async (payload) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return null;
    const plannerState = await conversationService.respondPlanner(activeConversationId, payload);
    set({
      plannerState,
      planSuggestion: plannerState.lastSuggestion ?? null,
    });
    return plannerState;
  },

  setPlanSuggestion: (payload) => set({ planSuggestion: payload }),

  clearPlannerState: () => set({ plannerState: null, planSuggestion: null }),
}));
