/**
 * AI聊天面板主组件
 *
 * 功能：
 * - 管理AI对话的整体交互流程
 * - 协调会话标签栏、消息列表、输入框等子组件
 * - 处理消息发送、模型选择、会话管理等核心逻辑
 * - 支持多会话标签切换和历史记录查看
 *
 * 使用位置：
 * - /views/TradingView/index.tsx - 股票交易主视图（右侧AI助手面板）
 * - /views/StockDetailView/index.tsx - 股票详情页（右侧AI助手面板）
 */

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useConversationStore } from '../../../store/useConversationStore';
import { sendAnalysisRequest } from '../../../services/aiService';
import { ConversationTabBar } from '../ConversationTabBar';
import { ChatMessageList } from '../ChatMessageList';
import { ChatInput } from '../ChatInput';
import { ConversationHistory } from '../ConversationHistory';
import { ConversationListItem } from '../../../types/conversation';

const AI_MODELS = [
  { id: 'auto', name: 'Auto', description: '自动选择最佳模型' },
  { id: 'gpt-4', name: 'GPT-4', description: '通用智能分析' },
  { id: 'quant-llm', name: 'Quant-LLM', description: '量化分析模型' },
  { id: 'news-bot', name: 'News-Bot', description: '市场新闻摘要' },
];

export function ChatPanel() {
  const { selectedModel, setSelectedModel, selectedStock } = useStore();
  const {
    activeConversationId,
    activeConversation,
    openTabs,
    setActiveConversation,
    createNewConversation,
    addMessageToActive,
    updateConversationTitle,
    closeTab,
    openTab,
    initializeDefaultConversation,
  } = useConversationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    initializeDefaultConversation();
  }, [initializeDefaultConversation]);

  const handleSend = async (message: string, images?: string[]) => {
    if (!activeConversationId || isLoading) return;

    await addMessageToActive('user', message);
    setIsLoading(true);

    try {
      const response = await sendAnalysisRequest(message, {
        stockSymbol: selectedStock?.symbol || activeConversation?.metadata.stockSymbol || 'AAPL',
        stockPrice: selectedStock?.price || activeConversation?.metadata.stockPrice || 178.72,
        modelId: selectedModel,
        images,
      });

      if (response.status === 'success') {
        await addMessageToActive('assistant', response.message, response.modelId);
      } else {
        await addMessageToActive(
          'assistant',
          `抱歉，分析请求失败：${response.error || '未知错误'}。请稍后重试。`
        );
      }
    } catch (error) {
      await addMessageToActive('assistant', '抱歉，系统出现错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <>
      <div className="bg-[#1A1A1A] flex flex-col h-full w-full">
        <div className="p-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#3A9FFF]" />
            <h2 className="text-lg font-semibold text-white">AI 分析助手</h2>
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
            isLoading={isLoading}
          />
        </div>

        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          selectedModel={selectedModel}
          availableModels={AI_MODELS}
          onModelChange={setSelectedModel}
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
