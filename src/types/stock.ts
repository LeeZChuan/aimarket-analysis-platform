/**
 * 股票和基金相关的类型定义
 */

/**
 * 股票/基金基础信息
 */
export interface Stock {
  /** 股票代码 */
  symbol: string;
  /** 股票名称 */
  name: string;
  /** 当前价格 */
  price: number;
  /** 涨跌幅（百分比） */
  change: number;
  /** 市值（可选） */
  marketCap?: number;
  /** 成交量（可选） */
  volume?: number;
  /** 行业分类（可选） */
  sector?: string;
  /** 所属地区（可选） */
  region?: 'asia' | 'europe' | 'north-america' | 'south-america' | 'africa' | 'oceania' | 'antarctica';
}

/**
 * 基金信息（继承自Stock，添加基金特有属性）
 */
export interface Fund extends Stock {
  /** 基金类型 */
  fundType: 'ETF' | 'Index' | 'Mutual' | 'Bond';
  /** 费用率（可选） */
  expenseRatio?: number;
  /** AUM - 资产管理规模（可选） */
  aum?: number;
}

/**
 * 股票列表响应
 */
export interface StockListResponse {
  /** 股票列表 */
  stocks: Stock[];
  /** 总数 */
  total: number;
  /** 响应时间戳 */
  timestamp: number;
}

/**
 * 基金列表响应
 */
export interface FundListResponse {
  /** 基金列表 */
  funds: Fund[];
  /** 总数 */
  total: number;
  /** 响应时间戳 */
  timestamp: number;
}

/**
 * 自选股列表响应
 */
export interface WatchlistResponse {
  /** 自选股列表 */
  watchlist: Stock[];
  /** 总数 */
  total: number;
  /** 响应时间戳 */
  timestamp: number;
}

/**
 * 股票搜索请求参数
 */
export interface StockSearchRequest {
  /** 搜索关键词 */
  keyword: string;
  /** 搜索类型 */
  type?: 'stock' | 'fund' | 'all';
  /** 分页：页码 */
  page?: number;
  /** 分页：每页数量 */
  limit?: number;
}

/**
 * 股票详情
 */
export interface StockDetail extends Stock {
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 昨收价 */
  previousClose: number;
  /** 52周最高 */
  week52High: number;
  /** 52周最低 */
  week52Low: number;
  /** 市盈率 */
  pe?: number;
  /** 股息率 */
  dividendYield?: number;
}
