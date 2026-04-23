/**
 * ConversationTabBar 组件 Props 类型定义
 */

import { ConversationListItem } from '../../../types/conversation';

export interface ConversationTabBarProps {
  openTabs: ConversationListItem[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewConversation: () => void;
  onShowHistory: () => void;
  onRenameTab?: (tabId: string, newTitle: string) => void;
}
