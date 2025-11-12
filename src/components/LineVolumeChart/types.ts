import { LineChartData, VolumeChartData } from '../../types/chart';

/**
 * LineVolumeChart 组件属性
 */
export interface LineVolumeChartProps {
  /** 折线图数据 */
  lineData: LineChartData[];
  /** 成交量柱状图数据 */
  volumeData: VolumeChartData[];
  /** 图表高度（像素），默认 400 */
  height?: number;
}
