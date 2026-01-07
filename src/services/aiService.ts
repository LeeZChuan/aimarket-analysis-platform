/**
 * AI 分析服务
 * 
 * 提供统一的 AI 分析接口，通过后端API调用各种AI模型
 */

import { http } from './request';
import { AIAnalysisRequest, AIAnalysisResponse, AIMessageType, AIMessage } from '../types/ai';

// ==================== 类型定义 ====================

/**
 * 增强的分析请求
 */
export interface EnhancedAnalysisRequest extends AIAnalysisRequest {
  /** 场景 ID */
  sceneId?: string;
  /** 供应商 ID */
  providerId?: string;
}

/**
 * AI 服务配置
 */
export interface AIServiceConfig {
  /** 默认场景 */
  defaultSceneId: string;
  /** 默认供应商 */
  defaultProviderId: string;
  /** 默认模型 */
  defaultModelId: string;
}

/**
 * AI供应商信息
 */
export interface AIProvider {
  id: string;
  name: string;
  description: string;
}

/**
 * AI模型信息
 */
export interface AIModel {
  id: string;
  name: string;
  description: string;
}

/**
 * AI供应商及其模型
 */
export interface ProviderWithModels {
  provider: AIProvider;
  models: AIModel[];
}

/**
 * 后端返回的 providers 结构（扁平：provider信息与models在同一层）
 */
interface BackendProvider {
  id: string;
  name: string;
  description: string;
  models: AIModel[];
}

/**
 * AI分析场景
 */
export interface SceneConfig {
  id: string;
  name: string;
  description: string;
}

/**
 * 选中的模型
 */
export interface SelectedModel {
  providerId: string;
  modelId: string;
}

// ==================== AI 服务类 ====================

/**
 * AI 分析服务类
 */
class AIService {
  private config: AIServiceConfig = {
    defaultSceneId: 'general',
    defaultProviderId: 'openai',
    defaultModelId: 'gpt-4',
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
   * 发送分析请求
   */
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    return this.analyzeEnhanced(request as EnhancedAnalysisRequest);
  }

  /**
   * 使用增强请求进行分析
   */
  async analyzeEnhanced(request: EnhancedAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await http.post<AIAnalysisResponse>('/ai/analyze', {
        message: request.message,
        stockSymbol: request.stockSymbol,
        stockPrice: request.stockPrice,
        modelId: request.modelId || this.config.defaultModelId,
        images: request.images,
        expectedType: request.expectedType,
        sceneId: request.sceneId || this.config.defaultSceneId,
        providerId: request.providerId || this.config.defaultProviderId,
      });

      return response.data;
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

  // ==================== 配置查询方法 ====================

  /**
   * 获取所有可用场景
   */
  async getScenes(): Promise<SceneConfig[]> {
    try {
      const response = await http.get<{ scenes: SceneConfig[] }>('/ai/scenes');
      return response.data?.scenes || [];
    } catch {
      return [];
    }
  }

  /**
   * 获取所有可用供应商和模型
   */
  async getProviders(): Promise<ProviderWithModels[]> {
    try {
      const response = await http.get<{ providers: BackendProvider[] }>('/ai/providers');
      const list = response.data?.providers || [];
      // 归一化为前端期望结构：{ provider:{...}, models:[...] }
      const normalized: ProviderWithModels[] = list.map((p) => ({
        provider: { id: p.id, name: p.name, description: p.description },
        models: Array.isArray(p.models) ? p.models : [],
      }));
      return normalized;
    } catch {
      return [];
    }
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
 * 便捷方法：发送分析请求
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

/**
 * 初始化AI服务（向后兼容）
 */
export function initializeAIService(): void {
  console.log('[AIService] Initialized with API backend');
}
