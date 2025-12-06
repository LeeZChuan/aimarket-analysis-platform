/**
 * 会话历史记录弹窗组件
 *
 * 功能：
 * - 展示所有历史对话记录列表
 * - 搜索功能（按标题或内容搜索）
 * - 显示对话元信息（消息数量、股票代码、最后活动时间）
 * - 人性化时间显示（刚刚/X分钟前/X小时前/X天前）
 * - 点击打开历史对话
 * - 删除对话功能（带二次确认）
 * - 加载状态和空状态处理
 *
 * 使用位置：
 * - /components/AIAssistant/ChatPanel/index.tsx - 点击历史按钮后弹出的模态框
 */

import { useState, useEffect } from 'react';
import { X, Search, Trash2, Clock } from 'lucide-react';
import { ConversationListItem, ConversationFilter } from '../../../types/conversation';
import { useConversationStore } from '../../../store/useConversationStore';

interface ConversationHistoryProps {
  onClose: () => void;
  onSelectConversation: (conversation: ConversationListItem) => void;
}

export function ConversationHistory({ onClose, onSelectConversation }: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>({});
  const { conversationList, loadConversations, deleteConversation, isLoading } =
    useConversationStore();

  useEffect(() => {
    loadConversations(filter);
  }, [filter, loadConversations]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilter((prev) => ({ ...prev, searchQuery: query || undefined }));
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个对话吗？')) {
      await deleteConversation(conversationId);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[20000]">
      <div className="bg-[#1A1A1A] rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3A9FFF]" />
            <h2 className="text-lg font-semibold text-white">对话历史</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-[#2A2A2A]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索对话..."
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          ) : conversationList.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-sm">暂无对话记录</p>
            </div>
          ) : (
            conversationList.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  onSelectConversation(conversation);
                  onClose();
                }}
                className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 cursor-pointer hover:border-[#3A9FFF] transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-white truncate flex-1">
                    {conversation.title}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2A2A] rounded transition-opacity"
                    title="删除对话"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {conversation.lastMessage && (
                  <p className="text-xs text-gray-400 truncate mb-2">
                    {conversation.lastMessage}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>{conversation.messageCount} 条消息</span>
                    {conversation.stockSymbol && (
                      <span className="px-2 py-0.5 bg-[#2A2A2A] rounded text-[#3A9FFF]">
                        {conversation.stockSymbol}
                      </span>
                    )}
                  </div>
                  <span>{formatDate(conversation.lastActivity)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
