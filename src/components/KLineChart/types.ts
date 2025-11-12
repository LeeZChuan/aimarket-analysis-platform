import { KLineChartData } from '../../types/chart';

/**
 * KLineChart 组件属性
 */
export interface KLineChartProps {
  /** K线图数据（包含蜡烛图、均线、成交量等） */
  data: KLineChartData;
  /** 图表高度（像素），默认 500 */
  height?: number;
}
