import { ConversationListItem } from '../../types/conversation';

export interface ConversationHistoryProps {
  onClose: () => void;
  onSelectConversation: (conversation: ConversationListItem) => void;
}
