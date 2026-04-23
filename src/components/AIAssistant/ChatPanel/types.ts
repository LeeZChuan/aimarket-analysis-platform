/**
 * ChatPanel 子模块的本地类型定义（演示/历史结构中的 Message、AIModel、ChatPanelProps）
 *
 * 说明：线上会话与消息实体以 `src/types/conversation.ts`、`src/types/ai.ts` 为准；此处类型可能与运行时略有差异，以 ChatPanel 实际使用为准。
 */

import { AIMessage } from '../../../types/ai';

/**
 * AI 模型配置
 */
export interface AIModel {
  /** 模型 ID */
  id: string;
  /** 模型显示名称 */
  name: string;
  /** 模型描述 */
  description: string;
}

/**
 * 聊天消息
 */
export interface Message {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色：用户或助手 */
  role: 'user' | 'assistant';
  /** 消息内容：文本或AI分析结果 */
  content: string | AIMessage;
  /** 消息时间戳 */
  timestamp: Date;
}

/**
 * ChatPanel 组件属性
 */
export interface ChatPanelProps {
  /** 自定义类名 */
  className?: string;
}
