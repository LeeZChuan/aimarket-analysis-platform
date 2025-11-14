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
