/**
 * LLM 供应商抽象层入口
 * 
 * 提供可拔插的 LLM Provider 管理
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

// 导出 Provider
export {
  BaseProvider,
  MockProvider,
  OpenAIProvider,
  DeepSeekProvider,
} from './providers';

export type {
  OpenAIProviderConfig,
  DeepSeekProviderConfig,
} from './providers';

// 导出注册中心
export { providerRegistry, ProviderRegistry } from './registry';

// ==================== 初始化函数 ====================

import { providerRegistry } from './registry';
import { MockProvider, OpenAIProvider, DeepSeekProvider } from './providers';

/**
 * 初始化默认 Providers
 * 
 * 在应用启动时调用此函数注册所有默认 Provider
 */
export function initializeProviders(): void {
  // 注册 Mock Provider（开发用）
  providerRegistry.register(new MockProvider());

  // 注册 OpenAI Provider
  providerRegistry.register(new OpenAIProvider());

  // 注册 DeepSeek Provider
  providerRegistry.register(new DeepSeekProvider());

  // 设置默认为 Mock（开发环境）
  // 生产环境应设置为实际的 Provider
  providerRegistry.setDefault('mock', 'mock-instant');

  console.log('[LLM] Providers initialized:', providerRegistry.stats());
}

/**
 * 获取格式化的 Provider 和模型选项
 * 用于 UI 下拉选择
 */
export function getProviderOptions(): Array<{
  provider: {
    id: string;
    name: string;
    description: string;
  };
  models: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}> {
  return providerRegistry.getAllModels().map(({ provider, models }) => ({
    provider: {
      id: provider.id,
      name: provider.name,
      description: provider.description,
    },
    models: models.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
    })),
  }));
}

