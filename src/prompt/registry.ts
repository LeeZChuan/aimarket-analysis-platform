/**
 * 提示词模板注册中心
 * 
 * 提供模板的注册、查询、管理功能
 */

import type {
  PromptTemplate,
  PromptTemplateMetadata,
  SceneConfig,
  TemplateRegisterOptions,
  PromptContext,
  RenderedPrompt,
} from './types';
import { promptEngine } from './engine';

/**
 * 模板注册中心
 */
class TemplateRegistry {
  /** 模板存储 */
  private templates: Map<string, PromptTemplate> = new Map();
  
  /** 场景配置存储 */
  private scenes: Map<string, SceneConfig> = new Map();

  /**
   * 注册模板
   * 
   * @param template - 模板定义
   * @param options - 注册选项
   */
  register(template: PromptTemplate, options: TemplateRegisterOptions = {}): void {
    const { id } = template.metadata;
    
    if (this.templates.has(id) && !options.override) {
      throw new Error(`模板 "${id}" 已存在，如需覆盖请设置 override: true`);
    }

    // 验证模板语法
    const validation = promptEngine.validate(template.template);
    if (!validation.valid) {
      throw new Error(`模板 "${id}" 语法错误: ${validation.error}`);
    }

    this.templates.set(id, template);
  }

  /**
   * 批量注册模板
   * 
   * @param templates - 模板数组
   * @param options - 注册选项
   */
  registerAll(templates: PromptTemplate[], options: TemplateRegisterOptions = {}): void {
    templates.forEach(template => this.register(template, options));
  }

  /**
   * 获取模板
   * 
   * @param id - 模板 ID
   * @returns 模板定义
   */
  get(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 检查模板是否存在
   * 
   * @param id - 模板 ID
   * @returns 是否存在
   */
  has(id: string): boolean {
    return this.templates.has(id);
  }

  /**
   * 删除模板
   * 
   * @param id - 模板 ID
   * @returns 是否删除成功
   */
  remove(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * 获取所有模板元数据
   * 
   * @param category - 可选，按分类筛选
   * @returns 模板元数据数组
   */
  list(category?: 'system' | 'scene'): PromptTemplateMetadata[] {
    const results: PromptTemplateMetadata[] = [];
    
    this.templates.forEach(template => {
      if (!category || template.metadata.category === category) {
        results.push(template.metadata);
      }
    });

    return results;
  }

  /**
   * 按标签搜索模板
   * 
   * @param tags - 标签数组
   * @returns 匹配的模板元数据
   */
  searchByTags(tags: string[]): PromptTemplateMetadata[] {
    const results: PromptTemplateMetadata[] = [];
    
    this.templates.forEach(template => {
      const templateTags = template.metadata.tags || [];
      if (tags.some(tag => templateTags.includes(tag))) {
        results.push(template.metadata);
      }
    });

    return results;
  }

  /**
   * 注册场景配置
   * 
   * @param scene - 场景配置
   */
  registerScene(scene: SceneConfig): void {
    // 验证引用的模板存在
    if (!this.templates.has(scene.systemTemplateId)) {
      throw new Error(`场景 "${scene.id}" 引用的系统模板 "${scene.systemTemplateId}" 不存在`);
    }
    if (!this.templates.has(scene.sceneTemplateId)) {
      throw new Error(`场景 "${scene.id}" 引用的场景模板 "${scene.sceneTemplateId}" 不存在`);
    }

    this.scenes.set(scene.id, scene);
  }

  /**
   * 批量注册场景
   * 
   * @param scenes - 场景配置数组
   */
  registerScenes(scenes: SceneConfig[]): void {
    scenes.forEach(scene => this.registerScene(scene));
  }

  /**
   * 获取场景配置
   * 
   * @param id - 场景 ID
   * @returns 场景配置
   */
  getScene(id: string): SceneConfig | undefined {
    return this.scenes.get(id);
  }

  /**
   * 获取所有场景
   * 
   * @returns 场景配置数组
   */
  listScenes(): SceneConfig[] {
    return Array.from(this.scenes.values());
  }

  /**
   * 使用场景渲染提示词
   * 
   * @param sceneId - 场景 ID
   * @param context - 渲染上下文
   * @returns 渲染后的提示词
   */
  renderByScene(sceneId: string, context: PromptContext): RenderedPrompt {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`场景 "${sceneId}" 不存在`);
    }

    const systemTemplate = this.templates.get(scene.systemTemplateId);
    const sceneTemplate = this.templates.get(scene.sceneTemplateId);

    if (!sceneTemplate) {
      throw new Error(`场景模板 "${scene.sceneTemplateId}" 不存在`);
    }

    return promptEngine.renderPrompt(
      systemTemplate?.template,
      sceneTemplate.template,
      context
    );
  }

  /**
   * 直接使用模板 ID 渲染
   * 
   * @param templateId - 模板 ID
   * @param context - 渲染上下文
   * @returns 渲染后的字符串
   */
  render(templateId: string, context: PromptContext): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`模板 "${templateId}" 不存在`);
    }

    return promptEngine.render(template.template, context);
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.templates.clear();
    this.scenes.clear();
  }

  /**
   * 获取注册统计
   */
  stats(): { templates: number; scenes: number } {
    return {
      templates: this.templates.size,
      scenes: this.scenes.size,
    };
  }
}

// 导出单例
export const templateRegistry = new TemplateRegistry();

// 导出类用于测试或自定义实例
export { TemplateRegistry };

