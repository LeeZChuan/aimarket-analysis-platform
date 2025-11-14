import { ConversationListItem } from '../../types/conversation';

export interface ConversationTabBarProps {
  openTabs: ConversationListItem[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewConversation: () => void;
  onShowHistory: () => void;
  onRenameTab?: (tabId: string, newTitle: string) => void;
}
