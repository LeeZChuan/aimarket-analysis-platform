/**
 * DeepSeek Provider
 * 通过后端代理调用 DeepSeek API
 */

import { BaseProvider } from './base';
import type {
  ModelInfo,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  ChatMessage,
  ProviderConfig,
} from '../types';

/**
 * DeepSeek Provider 配置
 */
export interface DeepSeekProviderConfig extends ProviderConfig {
  /** 后端代理 API 端点 */
  proxyEndpoint?: string;
}

/**
 * DeepSeek Provider 实现
 */
export class DeepSeekProvider extends BaseProvider {
  readonly id = 'deepseek';
  readonly name = 'DeepSeek';
  readonly description = '高性价比，优秀的中文理解能力';

  readonly models: ModelInfo[] = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      description: '通用对话模型，性能优异',
      maxContextLength: 64000,
      supportsVision: false,
      supportsFunctions: true,
      inputPrice: 0.14,
      outputPrice: 0.28,
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      description: '推理增强模型，适合复杂分析',
      maxContextLength: 64000,
      supportsVision: false,
      supportsFunctions: true,
      inputPrice: 0.55,
      outputPrice: 2.19,
    },
  ];

  private proxyEndpoint: string;

  constructor(config: DeepSeekProviderConfig = {}) {
    super(config);
    this.proxyEndpoint = config.proxyEndpoint || '/api/llm';
  }

  isAvailable(): boolean {
    return true;
  }

  async chat(model: string, request: ChatRequest): Promise<ChatResponse> {
    this.validateModel(model);

    const messages = this.prepareMessages(request);
    const temperature = this.getTemperature(request);
    const maxTokens = this.getMaxTokens(request);

    try {
      const response = await fetch(`${this.proxyEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.id,
          model,
          messages: this.formatMessages(messages),
          temperature,
          maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        id: data.id || this.generateId(),
        content: data.content,
        model: data.model || model,
        usage: data.usage,
        finishReason: data.finishReason,
      };
    } catch (error) {
      throw new Error(
        `DeepSeek 请求失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  async *streamChat(model: string, request: ChatRequest): AsyncGenerator<StreamChunk> {
    this.validateModel(model);

    const messages = this.prepareMessages(request);
    const temperature = this.getTemperature(request);
    const maxTokens = this.getMaxTokens(request);

    try {
      const response = await fetch(`${this.proxyEndpoint}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.id,
          model,
          messages: this.formatMessages(messages),
          temperature,
          maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.event === 'chunk') {
                yield {
                  content: parsed.data.content,
                  done: false,
                };
              } else if (parsed.event === 'done') {
                yield {
                  content: '',
                  done: true,
                  finishData: {
                    id: parsed.data.id,
                    model: parsed.data.model,
                    usage: parsed.data.usage,
                    finishReason: parsed.data.finishReason,
                  },
                };
              } else if (parsed.event === 'error') {
                throw new Error(parsed.data.message);
              }
            } catch (e) {
              console.warn('SSE 解析错误:', e);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(
        `DeepSeek 流式请求失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 格式化消息为 API 格式
   * DeepSeek 使用 OpenAI 兼容格式
   */
  private formatMessages(messages: ChatMessage[]): unknown[] {
    return messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string'
        ? msg.content
        : msg.content
            .filter(item => item.type === 'text')
            .map(item => (item as { type: 'text'; text: string }).text)
            .join('\n'),
    }));
  }
}

