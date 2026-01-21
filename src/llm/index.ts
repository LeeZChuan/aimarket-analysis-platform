/**
 * LLM 类型定义模块
 * 
 * 注意：LLM Provider 实现已迁移到后端
 * 前端仅保留类型定义供 API 调用使用
 */

// 导出类型
export type {
  LLMProvider,
  ProviderInfo,
  ModelInfo,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  TokenUsage,
  FinishReason,
  MessageRole,
  MessageContent,
  TextContent,
  ImageContent,
  ProviderConfig,
  LLMError,
  SelectedModel,
} from './types';
