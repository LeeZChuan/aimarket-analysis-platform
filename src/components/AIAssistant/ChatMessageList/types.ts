import { ConversationMessage } from '../../../types/conversation';

export interface ChatMessageListProps {
  messages: ConversationMessage[];
  isLoading: boolean;
}
