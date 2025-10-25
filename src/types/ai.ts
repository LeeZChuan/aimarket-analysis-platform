/**
 * AI分析相关的类型定义
 */

/**
 * AI消息内容类型枚举
 */
export enum AIMessageType {
  /** 纯文本（支持打字机效果） */
  TEXT = 'text',
  /** Markdown格式文本 */
  MARKDOWN = 'markdown',
  /** 图片 */
  IMAGE = 'image',
  /** 图表数据 */
  CHART = 'chart',
  /** 代码块 */
  CODE = 'code',
  /** 混合内容（包含多种类型） */
  MIXED = 'mixed',
}

/**
 * AI消息内容块
 */
export interface AIMessageBlock {
  /** 内容类型 */
  type: AIMessageType;
  /** 内容数据 */
  content: string | any;
  /** 元数据（可选） */
  metadata?: {
    /** 语言（用于代码块） */
    language?: string;
    /** 图片URL */
    imageUrl?: string;
    /** 图表配置 */
    chartConfig?: any;
    /** 其他自定义数据 */
    [key: string]: any;
  };
}

/**
 * AI消息结构（支持多种内容类型）
 */
export interface AIMessage {
  /** 消息ID */
  id: string;
  /** 消息类型（单一类型或混合类型） */
  type: AIMessageType;
  /** 消息内容（单一类型时为字符串，混合类型时为数组） */
  content: string | AIMessageBlock[];
  /** 是否启用打字机效果（仅对text类型有效） */
  enableTypewriter?: boolean;
  /** 创建时间戳 */
  timestamp: number;
}

/**
 * AI分析请求参数
 */
export interface AIAnalysisRequest {
  /** 用户输入的问题或分析请求 */
  message: string;
  /** 当前选中的股票代码 */
  stockSymbol?: string;
  /** 当前股票价格 */
  stockPrice?: number;
  /** 选择的AI模型ID */
  modelId: string;
  /** 上传的图片base64数组（可选） */
  images?: string[];
  /** 期望的响应类型 */
  expectedType?: AIMessageType;
}

/**
 * AI分析响应数据
 */
export interface AIAnalysisResponse {
  /** AI消息（新协议） */
  message: AIMessage;
  /** 响应状态 */
  status: 'success' | 'error';
  /** 使用的模型ID */
  modelId: string;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * AI消息渲染器注册接口
 * 用于扩展自定义消息类型的渲染逻辑
 */
export interface AIMessageRenderer {
  /** 支持的消息类型 */
  type: AIMessageType;
  /** 渲染函数 */
  render: (block: AIMessageBlock) => React.ReactNode;
  /** 优先级（数字越大优先级越高） */
  priority?: number;
}

/**
 * AI消息处理器注册接口
 * 用于扩展自定义消息类型的处理逻辑
 */
export interface AIMessageProcessor {
  /** 支持的消息类型 */
  type: AIMessageType;
  /** 处理函数 */
  process: (content: any, metadata?: any) => AIMessageBlock;
  /** 优先级（数字越大优先级越高） */
  priority?: number;
}

/**
 * 技术分析数据结构
 */
export interface TechnicalAnalysis {
  /** 趋势分析 */
  trend: {
    direction: 'up' | 'down' | 'sideways';
    description: string;
  };
  /** 支撑位 */
  support: number;
  /** 阻力位 */
  resistance: number;
  /** RSI指标值 */
  rsi: number;
  /** 成交量分析 */
  volume: {
    trend: 'increasing' | 'decreasing' | 'stable';
    description: string;
  };
}

/**
 * 交易建议结构
 */
export interface TradingAdvice {
  /** 建议类型 */
  action: 'buy' | 'sell' | 'hold';
  /** 建议价格区间 */
  priceRange?: {
    min: number;
    max: number;
  };
  /** 建议说明 */
  reasoning: string;
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high';
}
