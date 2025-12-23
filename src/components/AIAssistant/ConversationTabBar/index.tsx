/**
 * 会话标签栏组件
 *
 * 功能：
 * - 展示已打开的多个会话标签（类似浏览器标签页）
 * - 支持标签切换、关闭、重命名
 * - 新建会话按钮（右侧固定）
 * - 查看历史记录按钮（左侧固定）
 * - 横向滚动支持（标签过多时）
 * - 活跃标签高亮显示
 * - 鼠标悬停显示编辑和关闭按钮
 *
 * 使用位置：
 * - /components/AIAssistant/ChatPanel/index.tsx - AI聊天面板（顶部标签栏）
 */

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Edit2, History } from 'lucide-react';
import { ConversationListItem } from '../../../types/conversation';

interface ConversationTabBarProps {
  openTabs: ConversationListItem[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewConversation: () => void;
  onShowHistory: () => void;
  onRenameTab?: (tabId: string, newTitle: string) => void;
}

export function ConversationTabBar({
  openTabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewConversation,
  onShowHistory,
  onRenameTab,
}: ConversationTabBarProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleStartEdit = (tab: ConversationListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  };

  const handleSaveEdit = () => {
    if (editingTabId && editingTitle.trim() && onRenameTab) {
      onRenameTab(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="relative flex items-center" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-primary)' }}>
      <button
        onClick={onShowHistory}
        className="sticky left-0 flex-shrink-0 p-1.5 px-2 rounded transition-colors group z-10"
        style={{
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-primary)',
          color: 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          const icon = e.currentTarget.querySelector('svg');
          if (icon instanceof HTMLElement) icon.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-primary)';
          const icon = e.currentTarget.querySelector('svg');
          if (icon instanceof HTMLElement) icon.style.color = 'var(--text-muted)';
        }}
        title="对话历史"
      >
        <History className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 px-2 py-1 flex-1 overflow-x-auto scrollbar-thin scrollbar-track-transparent">
        <div className="flex items-center gap-1 min-w-0">
          {openTabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center gap-1 px-3 py-1.5 rounded-t transition-colors cursor-pointer group min-w-[120px] max-w-[200px]"
              style={
                activeTabId === tab.id
                  ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)' }
                  : { background: 'var(--bg-primary)', color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => {
                if (activeTabId !== tab.id) {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTabId !== tab.id) {
                  e.currentTarget.style.background = 'var(--bg-primary)';
                }
              }}
              onClick={() => onTabClick(tab.id)}
            >
              {editingTabId === tab.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-xs focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="flex-1 text-xs truncate">{tab.title}</span>
                  {onRenameTab && (
                    <button
                      onClick={(e) => handleStartEdit(tab, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="重命名"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                title="关闭"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNewConversation}
        className="sticky right-0 flex-shrink-0 p-1.5 px-2 rounded transition-colors group z-10"
        style={{
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-primary)',
          color: 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          const icon = e.currentTarget.querySelector('svg');
          if (icon instanceof HTMLElement) icon.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-primary)';
          const icon = e.currentTarget.querySelector('svg');
          if (icon instanceof HTMLElement) icon.style.color = 'var(--text-muted)';
        }}
        title="新建对话"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
