/**
 * 时间范围类型
 * - 1D: 1天
 * - 5D: 5天
 * - 1M: 1个月
 * - 3M: 3个月
 * - 6M: 6个月
 * - 1Y: 1年
 * - ALL: 全部
 */
export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

/**
 * K线蜡烛图数据
 */
export interface CandleData {
  /** 时间戳（毫秒） */
  timestamp: number;
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 收盘价 */
  close: number;
}

/**
 * 技术指标类型
 */
export type IndicatorType = 'MA' | 'MACD' | 'RSI' | 'KDJ' | 'BOLL';

/**
 * MACD 指标数据
 */
export interface MACDData {
  /** MACD线 (DIF) */
  macd: Array<{ timestamp: number; value: number }>;
  /** 信号线 (DEA) */
  signal: Array<{ timestamp: number; value: number }>;
  /** 柱状图 (MACD柱) */
  histogram: Array<{ timestamp: number; value: number; color: string }>;
}
