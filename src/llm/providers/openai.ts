/**
 * OpenAI Provider
 * 通过后端代理调用 OpenAI API
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
 * OpenAI Provider 配置
 */
export interface OpenAIProviderConfig extends ProviderConfig {
  /** 后端代理 API 端点 */
  proxyEndpoint?: string;
}

/**
 * OpenAI Provider 实现
 */
export class OpenAIProvider extends BaseProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly description = 'GPT 系列模型，通用智能分析';

  readonly models: ModelInfo[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: '最新旗舰多模态模型',
      maxContextLength: 128000,
      supportsVision: true,
      supportsFunctions: true,
      inputPrice: 2.5,
      outputPrice: 10,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: '轻量快速，性价比高',
      maxContextLength: 128000,
      supportsVision: true,
      supportsFunctions: true,
      inputPrice: 0.15,
      outputPrice: 0.6,
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: '高性能版本',
      maxContextLength: 128000,
      supportsVision: true,
      supportsFunctions: true,
      inputPrice: 10,
      outputPrice: 30,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: '经济实惠的选择',
      maxContextLength: 16385,
      supportsVision: false,
      supportsFunctions: true,
      inputPrice: 0.5,
      outputPrice: 1.5,
    },
  ];

  private proxyEndpoint: string;

  constructor(config: OpenAIProviderConfig = {}) {
    super(config);
    this.proxyEndpoint = config.proxyEndpoint || '/api/llm';
  }

  isAvailable(): boolean {
    // 实际可用性由后端代理决定
    // 前端假设可用，错误在调用时处理
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
        `OpenAI 请求失败: ${error instanceof Error ? error.message : '未知错误'}`
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
              // 忽略解析错误，继续处理
              console.warn('SSE 解析错误:', e);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(
        `OpenAI 流式请求失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 格式化消息为 API 格式
   */
  private formatMessages(messages: ChatMessage[]): unknown[] {
    return messages.map(msg => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role,
          content: msg.content,
        };
      }

      // 多模态消息
      return {
        role: msg.role,
        content: msg.content.map(item => {
          if (item.type === 'text') {
            return { type: 'text', text: item.text };
          }
          return {
            type: 'image_url',
            image_url: item.image_url,
          };
        }),
      };
    });
  }
}

