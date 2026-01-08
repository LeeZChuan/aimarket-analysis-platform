/**
 * AI 配置 Store
 * 
 * 管理 AI 分析相关的配置状态
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aiService, getSceneOptions, getProviderOptions } from '../services/aiService';
import { templateRegistry } from '../prompt';
import type { SceneConfig } from '../prompt';

/**
 * 供应商和模型信息
 */
interface ProviderOption {
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
}

/**
 * AI 配置状态
 */
interface AIConfigState {
  /** 已初始化 */
  initialized: boolean;
  
  /** 当前选中的场景 ID */
  selectedSceneId: string;
  
  /** 当前选中的供应商 ID */
  selectedProviderId: string;
  
  /** 当前选中的模型 ID */
  selectedModelId: string;
  
  /** 是否使用 Mock 模式 */
  useMock: boolean;
  
  /** 可用场景列表 */
  scenes: SceneConfig[];
  
  /** 可用供应商列表 */
  providers: ProviderOption[];

  // Actions
  initialize: () => Promise<void>;
  setSelectedScene: (sceneId: string) => void;
  setSelectedProvider: (providerId: string) => void;
  setSelectedModel: (modelId: string) => void;
  setUseMock: (useMock: boolean) => void;
  
  /** 同时设置供应商和模型 */
  setProviderAndModel: (providerId: string, modelId: string) => void;
  
  /** 获取当前选中的场景 */
  getCurrentScene: () => SceneConfig | undefined;
  
  /** 获取当前选中供应商的模型列表 */
  getCurrentProviderModels: () => Array<{ id: string; name: string; description: string }>;
  
  /** 获取显示名称 */
  getDisplayName: () => string;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      initialized: false,
      selectedSceneId: 'general',
      selectedProviderId: 'openai',
      selectedModelId: 'gpt-4',
      useMock: false,
      scenes: [],
      providers: [],

      initialize: async () => {
        const state = get();
        if (state.initialized) return;

        // 获取可用选项（注意：为异步 Promise）
        const [scenes, providers] = await Promise.all([
          getSceneOptions(),
          getProviderOptions(),
        ]);

        // 注册后端下发的场景映射（sceneId -> systemTemplateId/sceneTemplateId）
        // 注意：模板本身由 initializeTemplates() 在应用启动时注册
        try {
          templateRegistry.registerScenes(scenes);
        } catch (e) {
          console.warn('[PromptEngine] Register scenes failed:', e);
        }

        // 若当前选择不存在，则回退到第一个可用项
        const nextSceneId =
          scenes.find((s) => s.id === state.selectedSceneId)?.id || scenes[0]?.id || 'general';

        const providerExists = providers.find((p) => p.provider.id === state.selectedProviderId);
        const nextProviderId = providerExists?.provider.id || providers[0]?.provider.id || 'openai';
        const nextModelId =
          providers
            .find((p) => p.provider.id === nextProviderId)
            ?.models.find((m) => m.id === state.selectedModelId)?.id ||
          providers.find((p) => p.provider.id === nextProviderId)?.models[0]?.id ||
          state.selectedModelId ||
          'gpt-4';

        set({
          initialized: true,
          scenes,
          providers,
          selectedSceneId: nextSceneId,
          selectedProviderId: nextProviderId,
          selectedModelId: nextModelId,
          useMock: false,
        });

        // 同步到 aiService
        aiService.setDefaultSelection({
          sceneId: nextSceneId,
          providerId: nextProviderId,
          modelId: nextModelId,
        });
      },

      setSelectedScene: (sceneId) => {
        set({ selectedSceneId: sceneId });
        aiService.setDefaultSelection({ sceneId });
      },

      setSelectedProvider: (providerId) => {
        const state = get();
        const providerOption = state.providers.find(p => p.provider.id === providerId);
        
        // 自动选择该供应商的第一个模型
        const firstModel = providerOption?.models[0];
        const modelId = firstModel?.id || state.selectedModelId;

        set({
          selectedProviderId: providerId,
          selectedModelId: modelId,
        });
        
        aiService.setDefaultSelection({ providerId, modelId });
      },

      setSelectedModel: (modelId) => {
        set({ selectedModelId: modelId });
        aiService.setDefaultSelection({ modelId });
      },

      setUseMock: (useMock) => {
        set({ useMock });
      },

      setProviderAndModel: (providerId, modelId) => {
        set({
          selectedProviderId: providerId,
          selectedModelId: modelId,
        });
        aiService.setDefaultSelection({ providerId, modelId });
      },

      getCurrentScene: () => {
        const state = get();
        return state.scenes.find(s => s.id === state.selectedSceneId);
      },

      getCurrentProviderModels: () => {
        const state = get();
        const provider = state.providers.find(p => p.provider.id === state.selectedProviderId);
        return provider?.models || [];
      },

      getDisplayName: () => {
        const state = get();
        const provider = state.providers.find(p => p.provider.id === state.selectedProviderId);
        const model = provider?.models.find(m => m.id === state.selectedModelId);
        
        if (state.useMock) {
          return 'Mock';
        }
        
        return model?.name || `${provider?.provider.name || state.selectedProviderId}`;
      },
    }),
    {
      name: 'ai-config-storage',
      partialize: (state) => ({
        selectedSceneId: state.selectedSceneId,
        selectedProviderId: state.selectedProviderId,
        selectedModelId: state.selectedModelId,
        useMock: state.useMock,
      }),
    }
  )
);

