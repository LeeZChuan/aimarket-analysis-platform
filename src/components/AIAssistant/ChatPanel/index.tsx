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
import { useAIConfigStore } from '../../../store/useAIConfigStore';
import { useConversationStore } from '../../../store/useConversationStore';
import { ConversationTabBar } from '../ConversationTabBar';
import { ChatMessageList } from '../ChatMessageList';
import { ChatInput } from '../ChatInput';
import { ConversationHistory } from '../ConversationHistory';
import { ConversationListItem } from '../../../types/conversation';

export function ChatPanel() {
  const { selectedStock } = useStore();
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
  } = useConversationStore();

  const [showHistory, setShowHistory] = useState(false);

  // 初始化 AI 配置
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    initializeDefaultConversation();
  }, [initializeDefaultConversation]);

  /**
   * 处理消息发送
   * 使用后端 /api/conversations/:id/chat 接口，支持 SSE 流式返回
   */
  const handleSend = async (message: string, images?: string[]) => {
    // 如果正在加载或流式传输中，不允许发送
    if (isLoading || isStreaming) return;

    // remote 模式下首次发送：如果当前没有会话，则先创建会话，再发送消息
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

    // 使用新的聊天接口发送消息（支持 SSE 流式）
    await sendChatMessage({
      content: message,
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      expectedType: 'markdown',
      stream: true,
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
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI 分析助手</h2>
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
    </>
  );
}
