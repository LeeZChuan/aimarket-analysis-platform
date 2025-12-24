/**
 * LLM Provider 抽象基类
 */

import type {
  LLMProvider,
  ModelInfo,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ProviderConfig,
  ChatMessage,
} from '../types';

/**
 * Provider 基类
 * 提供通用的实现和工具方法
 */
export abstract class BaseProvider implements LLMProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly models: ModelInfo[];

  protected config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
      timeout: 60000,
      ...config,
    };
  }

  /**
   * 发送聊天请求（需子类实现）
   */
  abstract chat(model: string, request: ChatRequest): Promise<ChatResponse>;

  /**
   * 流式聊天（可选实现）
   */
  streamChat?(model: string, request: ChatRequest): AsyncGenerator<StreamChunk>;

  /**
   * 检查是否可用（需子类实现）
   */
  abstract isAvailable(): boolean;

  /**
   * 获取模型信息
   */
  getModel(modelId: string): ModelInfo | undefined {
    return this.models.find(m => m.id === modelId);
  }

  /**
   * 验证模型是否存在
   */
  validateModel(modelId: string): void {
    if (!this.getModel(modelId)) {
      throw new Error(`模型 "${modelId}" 不存在于供应商 "${this.id}"`);
    }
  }

  /**
   * 准备消息数组（添加系统提示词）
   */
  protected prepareMessages(request: ChatRequest): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // 添加系统提示词
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    // 添加用户消息
    messages.push(...request.messages);

    return messages;
  }

  /**
   * 获取温度参数
   */
  protected getTemperature(request: ChatRequest): number {
    return request.temperature ?? this.config.defaultTemperature ?? 0.7;
  }

  /**
   * 获取最大 tokens
   */
  protected getMaxTokens(request: ChatRequest): number | undefined {
    return request.maxTokens ?? this.config.defaultMaxTokens;
  }

  /**
   * 生成唯一 ID
   */
  protected generateId(): string {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

