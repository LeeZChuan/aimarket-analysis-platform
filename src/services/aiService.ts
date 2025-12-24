/**
 * AI 分析服务
 * 
 * 整合提示词引擎和 LLM 供应商层，提供统一的 AI 分析接口
 */

import { AIAnalysisRequest, AIAnalysisResponse, AIMessageType } from '../types/ai';
import { generateMockResponse } from '../mock/aiAnalysis';
import {
  templateRegistry,
  initializeTemplates,
  type PromptContext,
  type SceneConfig,
} from '../prompt';
import {
  providerRegistry,
  initializeProviders,
  type ChatRequest,
  type SelectedModel,
} from '../llm';

// ==================== 初始化 ====================

let initialized = false;

/**
 * 初始化 AI 服务
 * 注册所有模板和 Provider
 */
export function initializeAIService(): void {
  if (initialized) return;

  initializeTemplates();
  initializeProviders();
  initialized = true;

  console.log('[AIService] Initialized');
}

// ==================== 类型定义 ====================

/**
 * 增强的分析请求
 */
export interface EnhancedAnalysisRequest extends AIAnalysisRequest {
  /** 场景 ID */
  sceneId?: string;
  /** 供应商 ID */
  providerId?: string;
  /** 是否使用 Mock（开发模式） */
  useMock?: boolean;
}

/**
 * AI 服务配置
 */
export interface AIServiceConfig {
  /** 默认使用 Mock */
  defaultUseMock: boolean;
  /** 默认场景 */
  defaultSceneId: string;
  /** 默认供应商 */
  defaultProviderId: string;
  /** 默认模型 */
  defaultModelId: string;
}

// ==================== AI 服务类 ====================

/**
 * AI 分析服务类
 */
class AIService {
  private config: AIServiceConfig = {
    defaultUseMock: true, // 开发阶段默认使用 Mock
    defaultSceneId: 'general',
    defaultProviderId: 'mock',
    defaultModelId: 'mock-instant',
  };

  /**
   * 更新配置
   */
  configure(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * 发送分析请求（兼容旧接口）
   */
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // 确保初始化
    initializeAIService();

    // 如果使用 Mock 或旧模式
    if (this.config.defaultUseMock || !request.modelId || request.modelId === 'auto') {
      return this.analyzeMock(request);
    }

    // 使用新的 LLM 系统
    return this.analyzeWithLLM(request as EnhancedAnalysisRequest);
  }

  /**
   * 使用增强请求进行分析
   */
  async analyzeEnhanced(request: EnhancedAnalysisRequest): Promise<AIAnalysisResponse> {
    initializeAIService();

    if (request.useMock ?? this.config.defaultUseMock) {
      return this.analyzeMock(request);
    }

    return this.analyzeWithLLM(request);
  }

  /**
   * Mock 分析（开发用）
   */
  private async analyzeMock(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // 模拟网络延迟
    await this.delay(800 + Math.random() * 400);

    try {
      const response = generateMockResponse(
        request.message,
        request.stockSymbol || 'AAPL',
        request.stockPrice || 178.72,
        request.modelId || 'mock',
        request.expectedType
      );

      return response;
    } catch (error) {
      return this.createErrorResponse(request.modelId || 'mock', error);
    }
  }

  /**
   * 使用 LLM 进行分析
   */
  private async analyzeWithLLM(request: EnhancedAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      // 1. 获取场景和渲染提示词
      const sceneId = request.sceneId || this.config.defaultSceneId;
      const providerId = request.providerId || this.config.defaultProviderId;
      const modelId = request.modelId || this.config.defaultModelId;

      // 2. 构建渲染上下文
      const context: PromptContext = {
        stock: request.stockSymbol
          ? {
              symbol: request.stockSymbol,
              price: request.stockPrice,
            }
          : undefined,
        user: {
          message: request.message,
          images: request.images,
        },
      };

      // 3. 渲染提示词
      let systemPrompt: string | undefined;
      let userPrompt: string;

      const scene = templateRegistry.getScene(sceneId);
      if (scene) {
        const rendered = templateRegistry.renderByScene(sceneId, context);
        systemPrompt = rendered.systemPrompt;
        userPrompt = rendered.userPrompt;
      } else {
        // 回退到直接使用用户消息
        userPrompt = request.message;
      }

      // 4. 构建 LLM 请求
      const chatRequest: ChatRequest = {
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        systemPrompt,
        temperature: 0.7,
      };

      // 5. 调用 LLM
      const response = await providerRegistry.chat(providerId, modelId, chatRequest);

      // 6. 转换为 AIAnalysisResponse
      return {
        message: {
          id: response.id,
          type: AIMessageType.MARKDOWN,
          content: response.content,
          timestamp: Date.now(),
        },
        status: 'success',
        modelId: `${providerId}/${response.model}`,
      };
    } catch (error) {
      return this.createErrorResponse(
        request.modelId || 'unknown',
        error
      );
    }
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(modelId: string, error: unknown): AIAnalysisResponse {
    return {
      message: {
        id: `msg_${Date.now()}_error`,
        type: AIMessageType.TEXT,
        content: '分析请求失败，请稍后重试',
        timestamp: Date.now(),
      },
      status: 'error',
      modelId,
      error: error instanceof Error ? error.message : '分析请求失败',
    };
  }

  /**
   * 批量分析
   */
  async batchAnalyze(requests: AIAnalysisRequest[]): Promise<AIAnalysisResponse[]> {
    return Promise.all(requests.map(req => this.analyze(req)));
  }

  /**
   * 模拟延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== 配置查询方法 ====================

  /**
   * 获取所有可用场景
   */
  getScenes(): SceneConfig[] {
    initializeAIService();
    return templateRegistry.listScenes();
  }

  /**
   * 获取所有可用供应商和模型
   */
  getProviders(): Array<{
    provider: { id: string; name: string; description: string };
    models: Array<{ id: string; name: string; description: string }>;
  }> {
    initializeAIService();
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

  /**
   * 获取默认选择
   */
  getDefaultSelection(): {
    sceneId: string;
    providerId: string;
    modelId: string;
  } {
    return {
      sceneId: this.config.defaultSceneId,
      providerId: this.config.defaultProviderId,
      modelId: this.config.defaultModelId,
    };
  }

  /**
   * 设置默认选择
   */
  setDefaultSelection(selection: Partial<SelectedModel> & { sceneId?: string }): void {
    if (selection.sceneId) {
      this.config.defaultSceneId = selection.sceneId;
    }
    if (selection.providerId) {
      this.config.defaultProviderId = selection.providerId;
    }
    if (selection.modelId) {
      this.config.defaultModelId = selection.modelId;
    }
  }
}

// ==================== 导出 ====================

/**
 * AI 服务单例
 */
export const aiService = new AIService();

/**
 * 便捷方法：发送分析请求（向后兼容）
 */
export const sendAnalysisRequest = async (
  message: string,
  options: {
    stockSymbol?: string;
    stockPrice?: number;
    modelId?: string;
    images?: string[];
    sceneId?: string;
    providerId?: string;
    useMock?: boolean;
  } = {}
): Promise<AIAnalysisResponse> => {
  const request: EnhancedAnalysisRequest = {
    message,
    stockSymbol: options.stockSymbol,
    stockPrice: options.stockPrice,
    modelId: options.modelId || 'auto',
    images: options.images,
    sceneId: options.sceneId,
    providerId: options.providerId,
    useMock: options.useMock,
  };

  return aiService.analyzeEnhanced(request);
};

/**
 * 获取场景列表（供 UI 使用）
 */
export const getSceneOptions = () => aiService.getScenes();

/**
 * 获取供应商列表（供 UI 使用）
 */
export const getProviderOptions = () => aiService.getProviders();
