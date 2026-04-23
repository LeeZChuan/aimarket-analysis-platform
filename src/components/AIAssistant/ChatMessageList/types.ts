/**
 * ChatMessageList 组件 Props 等类型定义
 */

import { ConversationMessage } from '../../../types/conversation';

export interface ChatMessageListProps {
  messages: ConversationMessage[];
  isLoading: boolean;
}
