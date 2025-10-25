/**
 * AI分析服务
 * 处理AI分析相关的API调用和业务逻辑
 */

import { AIAnalysisRequest, AIAnalysisResponse } from '../types/ai';
import { generateMockResponse } from '../mock/aiAnalysis';

/**
 * AI分析服务类
 */
class AIService {
  /**
   * 发送分析请求
   * @param request - 分析请求参数
   * @returns Promise<AIAnalysisResponse> - 分析结果
   */
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // 模拟网络延迟
    await this.delay(1000 + Math.random() * 1000);

    try {
      const response = generateMockResponse(
        request.message,
        request.stockSymbol || 'AAPL',
        request.stockPrice || 178.72,
        request.modelId,
        request.expectedType
      );

      return response;
    } catch (error) {
      return {
        message: {
          id: `msg_${Date.now()}_error`,
          type: 'text' as any,
          content: '分析请求失败，请稍后重试',
          timestamp: Date.now(),
        },
        status: 'error',
        modelId: request.modelId,
        error: error instanceof Error ? error.message : '分析请求失败',
      };
    }
  }

  /**
   * 批量分析请求（未来可扩展）
   * @param requests - 多个分析请求
   * @returns Promise<AIAnalysisResponse[]> - 多个分析结果
   */
  async batchAnalyze(requests: AIAnalysisRequest[]): Promise<AIAnalysisResponse[]> {
    return Promise.all(requests.map(req => this.analyze(req)));
  }

  /**
   * 模拟网络延迟
   * @param ms - 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 导出AI服务单例
 */
export const aiService = new AIService();

/**
 * 便捷方法：发送分析请求
 */
export const sendAnalysisRequest = async (
  message: string,
  options: {
    stockSymbol?: string;
    stockPrice?: number;
    modelId?: string;
    images?: string[];
  } = {}
): Promise<AIAnalysisResponse> => {
  const request: AIAnalysisRequest = {
    message,
    stockSymbol: options.stockSymbol,
    stockPrice: options.stockPrice,
    modelId: options.modelId || 'auto',
    images: options.images,
  };

  return aiService.analyze(request);
};
