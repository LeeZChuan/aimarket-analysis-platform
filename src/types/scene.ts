/**
 * 场景配置类型定义
 * 
 * 注意：场景配置从后端 API 获取，此处仅定义类型
 */

/**
 * 场景配置
 */
export interface SceneConfig {
  /** 场景 ID */
  id: string;
  /** 场景名称 */
  name: string;
  /** 场景描述 */
  description: string;
  /** 场景图标 */
  icon?: string;
  /** 使用的系统模板 ID */
  systemTemplateId: string;
  /** 使用的场景模板 ID */
  sceneTemplateId: string;
  /** 推荐的模型（可选） */
  recommendedModel?: {
    provider: string;
    model: string;
  };
}
