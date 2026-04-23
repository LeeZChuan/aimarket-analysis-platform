/**
 * ChatInput 组件相关的 TypeScript 类型定义（Props / 模型选项等）
 *
 * 说明：运行时主要 Props 以 `ChatInput/index.tsx` 中导出的接口为准；本文件可作类型复用或文档对齐。
 */

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  isLoading: boolean;
  selectedModel: string;
  availableModels: AIModel[];
  onModelChange: (modelId: string) => void;
}
