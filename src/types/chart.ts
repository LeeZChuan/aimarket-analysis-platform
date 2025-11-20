export interface LineChartData {
  timestamp: number;
  value: number;
}

export interface VolumeChartData {
  timestamp: number;
  value: number;
  color?: string;
}

export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  turnover?: number;
}

export interface CandlestickData extends KLineData {}

export interface MALineData {
  timestamp: number;
  value: number;
}

export interface KLineChartData {
  candlestick: KLineData[];
  volume?: VolumeChartData[];
  ma5?: MALineData[];
  ma10?: MALineData[];
  ma20?: MALineData[];
  ma60?: MALineData[];
  ma120?: MALineData[];
}

export type ChartTabType = 'stock' | 'industry' | 'market';

export interface ChartTab {
  key: ChartTabType;
  label: string;
}
