/**
 * ConversationHistory 组件 Props 类型定义
 */

import { ConversationListItem } from '../../../types/conversation';

export interface ConversationHistoryProps {
  onClose: () => void;
  onSelectConversation: (conversation: ConversationListItem) => void;
}
