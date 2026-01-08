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

import { useState, useEffect, useRef } from 'react';
import { X, Search, Trash2, Clock } from 'lucide-react';
import { ConversationListItem, ConversationFilter } from '../../../types/conversation';
import { useConversationStore } from '../../../store/useConversationStore';
import { notifySuccess } from '../../../utils/notify';

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
      notifySuccess('已删除对话');
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
    <div className="fixed inset-0 flex items-center justify-center z-[20000]" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>对话历史</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索对话..."
              className="w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--accent-primary)' }} />
                <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ background: 'var(--accent-primary)' }} />
                <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ background: 'var(--accent-primary)' }} />
              </div>
            </div>
          ) : conversationList.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm" style={{ color: 'var(--text-disabled)' }}>暂无对话记录</p>
            </div>
          ) : (
            conversationList.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  onSelectConversation(conversation);
                  onClose();
                }}
                className="rounded-lg p-3 cursor-pointer transition-colors group"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                    {conversation.title}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="删除对话"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {conversation.lastMessage && (
                  <p className="text-xs truncate mb-2" style={{ color: 'var(--text-muted)' }}>
                    {conversation.lastMessage}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-disabled)' }}>
                  <div className="flex items-center gap-3">
                    <span>{conversation.messageCount} 条消息</span>
                    {conversation.stockSymbol && (
                      <span className="px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
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
