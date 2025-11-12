import { AIMessage, AIMessageRenderer as AIMessageRendererType } from '../../types/ai';

/**
 * AIMessageRenderer 组件属性
 */
export interface AIMessageRendererProps {
  /** AI 消息对象 */
  message: AIMessage;
  /** 自定义渲染器数组（用于扩展特定类型消息的渲染逻辑） */
  customRenderers?: AIMessageRendererType[];
}
