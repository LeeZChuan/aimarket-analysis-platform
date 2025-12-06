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
    <div className="relative flex items-center bg-[#0D0D0D] border-b border-[#2A2A2A]">
      <button
        onClick={onShowHistory}
        className="sticky left-0 flex-shrink-0 p-1.5 px-2 bg-[#0D0D0D] hover:bg-[#2A2A2A] rounded transition-colors group z-10 border-r border-[#2A2A2A]"
        title="对话历史"
      >
        <History className="w-4 h-4 text-gray-400 group-hover:text-white" />
      </button>

      <div className="flex items-center gap-1 px-2 py-1 flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-[#2A2A2A] scrollbar-track-transparent">
        <div className="flex items-center gap-1 min-w-0">
          {openTabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-t transition-colors cursor-pointer group min-w-[120px] max-w-[200px] ${
                activeTabId === tab.id
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#0D0D0D] text-gray-400 hover:bg-[#1A1A1A]'
              }`}
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
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2A2A2A] rounded transition-opacity"
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
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2A2A2A] rounded transition-opacity"
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
        className="sticky right-0 flex-shrink-0 p-1.5 px-2 bg-[#0D0D0D] hover:bg-[#2A2A2A] rounded transition-colors group z-10 border-l border-[#2A2A2A]"
        title="新建对话"
      >
        <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
      </button>
    </div>
  );
}
