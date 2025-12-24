/**
 * 提示词工程模块类型定义
 */

/**
 * 提示词模板元数据
 */
export interface PromptTemplateMetadata {
  /** 模板唯一标识 */
  id: string;
  /** 模板显示名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板分类 */
  category: 'system' | 'scene';
  /** 模板标签 */
  tags?: string[];
  /** 模板版本 */
  version?: string;
}

/**
 * 提示词模板定义
 */
export interface PromptTemplate {
  /** 模板元数据 */
  metadata: PromptTemplateMetadata;
  /** 模板内容（Nunjucks/Jinja2 语法） */
  template: string;
}

/**
 * 提示词渲染上下文 - 股票相关
 */
export interface StockContext {
  /** 股票代码 */
  symbol: string;
  /** 股票名称 */
  name?: string;
  /** 当前价格 */
  price?: number;
  /** 涨跌幅 */
  change?: number;
  /** 涨跌额 */
  changeAmount?: number;
  /** 成交量 */
  volume?: number;
  /** 市值 */
  marketCap?: number;
  /** 市盈率 */
  pe?: number;
  /** 其他自定义数据 */
  [key: string]: unknown;
}

/**
 * 提示词渲染上下文 - 用户相关
 */
export interface UserContext {
  /** 用户消息 */
  message: string;
  /** 用户上传的图片 */
  images?: string[];
  /** 对话历史摘要 */
  historySummary?: string;
  /** 用户偏好设置 */
  preferences?: {
    language?: string;
    riskTolerance?: 'low' | 'medium' | 'high';
    investmentStyle?: string;
  };
}

/**
 * 提示词渲染上下文 - 完整
 */
export interface PromptContext {
  /** 股票上下文 */
  stock?: StockContext;
  /** 用户上下文 */
  user: UserContext;
  /** 当前时间 */
  timestamp?: number;
  /** 当前日期字符串 */
  date?: string;
  /** 其他自定义数据 */
  [key: string]: unknown;
}

/**
 * 渲染后的提示词结果
 */
export interface RenderedPrompt {
  /** 系统提示词 */
  systemPrompt?: string;
  /** 用户提示词（处理后的用户消息） */
  userPrompt: string;
}

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

/**
 * 模板注册选项
 */
export interface TemplateRegisterOptions {
  /** 是否覆盖已存在的模板 */
  override?: boolean;
}

