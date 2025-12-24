/**
 * Mock Provider
 * 用于开发和测试，不需要真实的 API 调用
 */

import { BaseProvider } from './base';
import type { ModelInfo, ChatRequest, ChatResponse, StreamChunk } from '../types';

/**
 * Mock 响应模板
 */
const MOCK_RESPONSES: Record<string, string> = {
  greeting: '你好！我是 AI 投资助手，很高兴为你服务。我可以帮你分析股票走势、提供投资建议。',
  technical: `📊 **技术分析报告**

**趋势分析**
当前处于上升通道中，短期均线在长期均线之上，形成多头排列。

**关键价位**
- 支撑位：$170.00
- 阻力位：$185.00

**技术指标**
- RSI：63（健康区间）
- MACD：金叉形态，看涨信号

**操作建议**
✅ 建议持有，关注阻力位突破情况

*免责声明：以上分析仅供参考，不构成投资建议*`,
  fundamental: `📈 **基本面分析**

**公司概况**
行业龙头企业，市场地位稳固。

**财务数据**
- 营收增长：+15.8%
- 净利润率：22.5%
- ROE：28.3%

**估值水平**
当前 P/E 约 26 倍，处于历史中位数水平，估值合理。

**投资建议**
具有中长期投资价值，建议分批建仓。`,
  sentiment: `💡 **市场情绪分析**

**资金流向**
主力资金持续流入，北向资金净买入。

**市场热度**
- 关注度：高
- 讨论热度：上升
- 媒体报道：积极

**操作策略**
适度参与，控制仓位在 30%-50%。`,
  default: '感谢你的提问。根据当前市场情况，建议保持关注，理性投资。如有具体问题，请详细描述。',
};

/**
 * 根据用户消息选择响应
 */
function selectResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
    return MOCK_RESPONSES.greeting;
  }
  if (lowerMessage.includes('技术') || lowerMessage.includes('走势') || lowerMessage.includes('k线')) {
    return MOCK_RESPONSES.technical;
  }
  if (lowerMessage.includes('基本面') || lowerMessage.includes('财务') || lowerMessage.includes('估值')) {
    return MOCK_RESPONSES.fundamental;
  }
  if (lowerMessage.includes('情绪') || lowerMessage.includes('资金') || lowerMessage.includes('市场')) {
    return MOCK_RESPONSES.sentiment;
  }

  return MOCK_RESPONSES.default;
}

/**
 * Mock Provider 实现
 */
export class MockProvider extends BaseProvider {
  readonly id = 'mock';
  readonly name = 'Mock';
  readonly description = '开发测试用的模拟响应';

  readonly models: ModelInfo[] = [
    {
      id: 'mock-instant',
      name: 'Mock Instant',
      description: '即时响应，用于测试',
      maxContextLength: 128000,
      supportsVision: true,
      supportsFunctions: false,
    },
    {
      id: 'mock-delay',
      name: 'Mock Delay',
      description: '模拟延迟响应',
      maxContextLength: 128000,
      supportsVision: true,
      supportsFunctions: false,
    },
  ];

  /** 模拟延迟时间（毫秒） */
  private delay: number;

  constructor(delay = 1000) {
    super();
    this.delay = delay;
  }

  isAvailable(): boolean {
    return true; // Mock 总是可用
  }

  async chat(model: string, request: ChatRequest): Promise<ChatResponse> {
    this.validateModel(model);

    // 模拟网络延迟
    if (model === 'mock-delay') {
      await this.simulateDelay();
    }

    // 获取用户最后一条消息
    const lastUserMessage = request.messages
      .filter(m => m.role === 'user')
      .pop();

    const userContent = typeof lastUserMessage?.content === 'string'
      ? lastUserMessage.content
      : '(图片消息)';

    // 选择响应
    const response = selectResponse(userContent);

    return {
      id: this.generateId(),
      content: response,
      model,
      usage: {
        promptTokens: Math.floor(Math.random() * 100) + 50,
        completionTokens: Math.floor(Math.random() * 200) + 100,
        totalTokens: Math.floor(Math.random() * 300) + 150,
      },
      finishReason: 'stop',
    };
  }

  async *streamChat(model: string, request: ChatRequest): AsyncGenerator<StreamChunk> {
    this.validateModel(model);

    // 获取完整响应
    const fullResponse = await this.chat(model, request);
    const content = fullResponse.content;

    // 模拟流式输出
    const chunkSize = 10; // 每次输出的字符数
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.substring(i, Math.min(i + chunkSize, content.length));
      const done = i + chunkSize >= content.length;

      yield {
        content: chunk,
        done,
        finishData: done
          ? {
              id: fullResponse.id,
              model: fullResponse.model,
              usage: fullResponse.usage,
              finishReason: fullResponse.finishReason,
            }
          : undefined,
      };

      // 模拟流式延迟
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve =>
      setTimeout(resolve, this.delay + Math.random() * 500)
    );
  }
}

