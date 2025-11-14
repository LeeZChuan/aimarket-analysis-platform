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
