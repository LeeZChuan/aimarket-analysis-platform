/**
 * 提示词工程模块入口
 * 
 * 提供可维护、可扩展的提示词模板系统
 * 使用 Nunjucks（Jinja2 兼容）作为模板引擎
 */

// 导出类型
export type {
  PromptTemplate,
  PromptTemplateMetadata,
  PromptContext,
  StockContext,
  UserContext,
  RenderedPrompt,
  SceneConfig,
  TemplateRegisterOptions,
} from './types';

// 导出引擎
export { promptEngine, PromptEngine } from './engine';

// 导出注册中心
export { templateRegistry, TemplateRegistry } from './registry';

// 导出预置模板
export {
  initializeTemplates,
  systemTemplates,
  sceneTemplates,
  allTemplates,
} from './templates';

