import { Time } from 'lightweight-charts';

export interface LineChartData {
  time: Time;
  value: number;
}

export interface VolumeChartData {
  time: Time;
  value: number;
  color?: string;
}

export interface CandlestickData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MALineData {
  time: Time;
  value: number;
}

export interface KLineChartData {
  candlestick: CandlestickData[];
  volume: VolumeChartData[];
  ma5?: MALineData[];
  ma10?: MALineData[];
  ma20?: MALineData[];
}

export type ChartTabType = 'stock' | 'industry' | 'market';

export interface ChartTab {
  key: ChartTabType;
  label: string;
}
