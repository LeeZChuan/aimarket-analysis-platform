/**
 * AI聊天面板主组件
 *
 * 功能：
 * - 管理AI对话的整体交互流程
 * - 协调会话标签栏、消息列表、输入框等子组件
 * - 处理消息发送、模型选择、会话管理等核心逻辑
 * - 支持多会话标签切换和历史记录查看
 * - 支持 SSE 流式消息返回（打字机效果）
 *
 * 使用位置：
 * - /views/TradingView/index.tsx - 股票交易主视图（右侧AI助手面板）
 * - /views/StockDetailView/index.tsx - 股票详情页（右侧AI助手面板）
 */

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useChartStore } from '../../../store/useChartStore';
import { useAIConfigStore } from '../../../store/useAIConfigStore';
import { useConversationStore } from '../../../store/useConversationStore';
import { stockService } from '../../../services/stockService';
import { ConversationTabBar } from '../ConversationTabBar';
import { ChatMessageList } from '../ChatMessageList';
import { ChatInput } from '../ChatInput';
import { ConversationHistory } from '../ConversationHistory';
import { GuidanceWizardModal } from '../GuidanceWizard';
import { ConversationListItem, KLineContextData, GuidanceAttachment } from '../../../types/conversation';

export function ChatPanel() {
  const { selectedStock } = useStore();
  const { setConfirmedSelectionData, clearConfirmedSelectionData } = useChartStore();
  const {
    initialize,
    selectedSceneId,
    selectedProviderId,
    selectedModelId,
    scenes,
    providers,
    setSelectedScene,
    setProviderAndModel,
  } = useAIConfigStore();

  const {
    activeConversationId,
    activeConversation,
    openTabs,
    isLoading,
    isStreaming,
    setActiveConversation,
    createNewConversation,
    updateConversationTitle,
    closeTab,
    openTab,
    initializeDefaultConversation,
    sendChatMessage,
    stopAgentRun,
  } = useConversationStore();


  const [showHistory, setShowHistory] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // 初始化 AI 配置
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    initializeDefaultConversation();
  }, [initializeDefaultConversation]);

  useEffect(() => {
    let cancelled = false;

    const restoreSelectionData = async () => {
      const klineContext = activeConversation?.klineContext;
      if (!klineContext) {
        clearConfirmedSelectionData();
        return;
      }

      const startDate = Date.parse(klineContext.startTime);
      const endDate = Date.parse(klineContext.endTime);
      if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
        setConfirmedSelectionData({
          stockSymbol: klineContext.stockSymbol,
          stockName: klineContext.stockName,
          timeframe: klineContext.timeframe,
          startTime: klineContext.startTime,
          endTime: klineContext.endTime,
          dataCount: 0,
          klineData: [],
        });
        return;
      }

      const start = new Date(startDate).toISOString().slice(0, 10);
      const end = new Date(endDate).toISOString().slice(0, 10);
      const klineData = await stockService.getKLineData(
        klineContext.stockSymbol,
        'day',
        start,
        end,
      );

      if (cancelled) return;
      setConfirmedSelectionData({
        stockSymbol: klineContext.stockSymbol,
        stockName: klineContext.stockName,
        timeframe: klineContext.timeframe,
        startTime: klineContext.startTime,
        endTime: klineContext.endTime,
        dataCount: klineData.length,
        klineData,
      });
    };

    restoreSelectionData();

    return () => {
      cancelled = true;
    };
  }, [activeConversation?.id, activeConversation?.klineContext, clearConfirmedSelectionData, setConfirmedSelectionData]);

  /**
   * 处理消息发送
   * 使用后端 /api/conversations/:id/chat 接口，支持 SSE 流式返回
   */
  const handleSend = async (message: string, images?: string[]) => {
    void images;
    if (isLoading || isStreaming) return;

    const {
      confirmedSelectionData: selectionSnapshot,
      clearConfirmedSelectionData,
    } = useChartStore.getState();

    let conversationId = activeConversationId;
    if (!conversationId) {
      await createNewConversation({
        title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
        stockSymbol: selectedStock?.symbol,
        stockName: selectedStock?.name,
        stockPrice: selectedStock?.price,
      });
      conversationId = useConversationStore.getState().activeConversationId;
    }

    if (!conversationId) return;

    let klineContext: KLineContextData | undefined;
    if (selectionSnapshot) {
      klineContext = {
        stockSymbol: selectionSnapshot.stockSymbol,
        stockName: selectionSnapshot.stockName,
        timeframe: selectionSnapshot.timeframe,
        startTime: selectionSnapshot.startTime,
        endTime: selectionSnapshot.endTime,
        data: selectionSnapshot.klineData,
      };
      clearConfirmedSelectionData();
    }

    await sendChatMessage({
      content: message,
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      expectedType: 'markdown',
      stream: true,
      klineContext,
    });
  };

  const ensureConversationIdForGuidance = async () => {
    let conversationId = activeConversationId;
    if (!conversationId) {
      await createNewConversation({
        title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
        stockSymbol: selectedStock?.symbol,
        stockName: selectedStock?.name,
        stockPrice: selectedStock?.price,
      });
      conversationId = useConversationStore.getState().activeConversationId;
    }
    return conversationId;
  };

  /** 需求澄清完成：用户可见摘要一条 + guidanceAttachment 注入后端 system */
  const handleGuidanceComplete = async (summary: string, attachment: GuidanceAttachment) => {
    if (isLoading || isStreaming) return;

    const conversationId = activeConversationId ?? (await ensureConversationIdForGuidance());
    if (!conversationId) return;

    const {
      confirmedSelectionData: selectionSnapshot,
      clearConfirmedSelectionData,
    } = useChartStore.getState();

    let klineContext: KLineContextData | undefined;
    if (selectionSnapshot) {
      klineContext = {
        stockSymbol: selectionSnapshot.stockSymbol,
        stockName: selectionSnapshot.stockName,
        timeframe: selectionSnapshot.timeframe,
        startTime: selectionSnapshot.startTime,
        endTime: selectionSnapshot.endTime,
        data: selectionSnapshot.klineData,
      };
      clearConfirmedSelectionData();
    }

    await sendChatMessage({
      content: summary,
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      expectedType: 'markdown',
      stream: true,
      klineContext,
      guidanceAttachment: attachment,
    });
  };

  const handleNewConversation = () => {
    createNewConversation({
      title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
      stockSymbol: selectedStock?.symbol,
      stockName: selectedStock?.name,
      stockPrice: selectedStock?.price,
    });
  };

  const handleSelectConversation = (conversation: ConversationListItem) => {
    openTab(conversation);
  };

  // 格式化供应商和模型选项供 ChatInput 使用
  const modelOptions = providers.flatMap(p =>
    p.models.map(m => ({
      id: `${p.provider.id}/${m.id}`,
      name: `${p.provider.name} - ${m.name}`,
      description: m.description,
      disabled: !!m.disabled,
      providerId: p.provider.id,
      modelId: m.id,
    }))
  );

  const currentModelOption = modelOptions.find(
    m => m.providerId === selectedProviderId && m.modelId === selectedModelId
  );

  return (
    <>
      <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg-secondary)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>AI 分析助手</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowGuidance(true)}
              disabled={isLoading || isStreaming}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-md border transition-colors"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
              }}
              title="先选择答题策略，再进入需求澄清"
            >
              需求澄清
            </button>
          </div>
        </div>

        <ConversationTabBar
          openTabs={openTabs}
          activeTabId={activeConversationId}
          onTabClick={setActiveConversation}
          onTabClose={closeTab}
          onNewConversation={handleNewConversation}
          onShowHistory={() => setShowHistory(true)}
          onRenameTab={updateConversationTitle}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ChatMessageList
            messages={activeConversation?.messages || []}
            isLoading={isLoading || isStreaming}
          />
        </div>

        <ChatInput
          onSend={handleSend}
          onStop={isLoading || isStreaming ? stopAgentRun : undefined}
          isLoading={isLoading || isStreaming}
          // 场景选择
          selectedSceneId={selectedSceneId}
          availableScenes={scenes}
          onSceneChange={setSelectedScene}
          // 模型选择
          selectedModel={currentModelOption?.id || ''}
          availableModels={modelOptions}
          onModelChange={(id) => {
            const option = modelOptions.find(m => m.id === id);
            if (option) {
              setProviderAndModel(option.providerId, option.modelId);
            }
          }}
        />
      </div>

      {showHistory && (
        <ConversationHistory
          onClose={() => setShowHistory(false)}
          onSelectConversation={handleSelectConversation}
        />
      )}

      {showGuidance && (
        <GuidanceWizardModal
          open={showGuidance}
          onClose={() => setShowGuidance(false)}
          conversationId={activeConversationId}
          onEnsureConversationId={ensureConversationIdForGuidance}
          onComplete={handleGuidanceComplete}
          busy={isLoading || isStreaming}
        />
      )}
    </>
  );
}
