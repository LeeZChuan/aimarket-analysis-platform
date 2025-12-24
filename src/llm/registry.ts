/**
 * LLM Provider 注册中心
 */

import type {
  LLMProvider,
  ProviderInfo,
  ModelInfo,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  SelectedModel,
} from './types';

/**
 * Provider 注册中心
 */
class ProviderRegistry {
  /** Provider 存储 */
  private providers: Map<string, LLMProvider> = new Map();

  /** 默认 Provider */
  private defaultProviderId?: string;

  /** 默认模型 */
  private defaultModelId?: string;

  /**
   * 注册 Provider
   */
  register(provider: LLMProvider): void {
    if (this.providers.has(provider.id)) {
      console.warn(`Provider "${provider.id}" 已存在，将被覆盖`);
    }
    this.providers.set(provider.id, provider);
  }

  /**
   * 批量注册
   */
  registerAll(providers: LLMProvider[]): void {
    providers.forEach(p => this.register(p));
  }

  /**
   * 获取 Provider
   */
  get(id: string): LLMProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * 检查是否存在
   */
  has(id: string): boolean {
    return this.providers.has(id);
  }

  /**
   * 移除 Provider
   */
  remove(id: string): boolean {
    return this.providers.delete(id);
  }

  /**
   * 获取所有 Provider 信息
   */
  list(): ProviderInfo[] {
    const results: ProviderInfo[] = [];

    this.providers.forEach(provider => {
      results.push({
        id: provider.id,
        name: provider.name,
        description: provider.description,
        available: provider.isAvailable(),
      });
    });

    return results;
  }

  /**
   * 获取指定 Provider 的模型列表
   */
  getModels(providerId: string): ModelInfo[] {
    const provider = this.providers.get(providerId);
    return provider?.models || [];
  }

  /**
   * 获取所有可用的 Provider 和模型
   */
  getAllModels(): Array<{ provider: ProviderInfo; models: ModelInfo[] }> {
    return this.list().map(providerInfo => ({
      provider: providerInfo,
      models: this.getModels(providerInfo.id),
    }));
  }

  /**
   * 设置默认 Provider 和模型
   */
  setDefault(providerId: string, modelId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider "${providerId}" 不存在`);
    }

    const provider = this.providers.get(providerId)!;
    if (!provider.models.some(m => m.id === modelId)) {
      throw new Error(`模型 "${modelId}" 不存在于 Provider "${providerId}"`);
    }

    this.defaultProviderId = providerId;
    this.defaultModelId = modelId;
  }

  /**
   * 获取默认设置
   */
  getDefault(): SelectedModel | undefined {
    if (this.defaultProviderId && this.defaultModelId) {
      return {
        providerId: this.defaultProviderId,
        modelId: this.defaultModelId,
      };
    }
    return undefined;
  }

  /**
   * 发送聊天请求
   */
  async chat(
    providerId: string,
    modelId: string,
    request: ChatRequest
  ): Promise<ChatResponse> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider "${providerId}" 不存在`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider "${providerId}" 暂不可用`);
    }

    return provider.chat(modelId, request);
  }

  /**
   * 发送流式聊天请求
   */
  async *streamChat(
    providerId: string,
    modelId: string,
    request: ChatRequest
  ): AsyncGenerator<StreamChunk> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider "${providerId}" 不存在`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider "${providerId}" 暂不可用`);
    }

    if (!provider.streamChat) {
      throw new Error(`Provider "${providerId}" 不支持流式响应`);
    }

    yield* provider.streamChat(modelId, request);
  }

  /**
   * 使用默认设置发送请求
   */
  async chatWithDefault(request: ChatRequest): Promise<ChatResponse> {
    const defaultSetting = this.getDefault();
    if (!defaultSetting) {
      throw new Error('未设置默认 Provider 和模型');
    }

    return this.chat(defaultSetting.providerId, defaultSetting.modelId, request);
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.providers.clear();
    this.defaultProviderId = undefined;
    this.defaultModelId = undefined;
  }

  /**
   * 获取统计信息
   */
  stats(): { providers: number; totalModels: number } {
    let totalModels = 0;
    this.providers.forEach(p => {
      totalModels += p.models.length;
    });

    return {
      providers: this.providers.size,
      totalModels,
    };
  }
}

// 导出单例
export const providerRegistry = new ProviderRegistry();

// 导出类用于测试
export { ProviderRegistry };

