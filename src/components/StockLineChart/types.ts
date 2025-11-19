/**
 * 折线图数据点
 */
export interface LineData {
  /** 时间戳（毫秒） */
  timestamp: number;
  /** 数值 */
  value: number;
}

/**
 * StockLineChart 组件属性
 */
export interface StockLineChartProps {
  /** 折线图数据 */
  data: LineData[];
  /** 图表高度（像素），默认 600 */
  height?: number;
}
