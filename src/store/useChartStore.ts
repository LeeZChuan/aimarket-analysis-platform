/**
 * 图表状态管理
 * 用于在不同组件之间共享图表控制状态
 */

import { create } from 'zustand';

export const MAX_SELECTION_COUNT = 200;

export interface RegionSelectionData {
  startTime: string;
  endTime: string;
  dataCount: number;
  startIndex: number;
  endIndex: number;
  timeframe: string;
}

export interface CurrentSelectionRange {
  startTime: string;
  endTime: string;
  startTimestamp: number;
  endTimestamp: number;
  dataCount: number;
}

export interface KLineDataItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ConfirmedSelectionData {
  stockSymbol: string;
  stockName: string;
  timeframe: string;
  startTime: string;
  endTime: string;
  dataCount: number;
  klineData: KLineDataItem[];
}

interface ChartStore {
  triggerRegionSelection: boolean;
  setTriggerRegionSelection: (trigger: boolean) => void;

  isInSelectionMode: boolean;
  setIsInSelectionMode: (inMode: boolean) => void;

  selectionData: RegionSelectionData | null;
  setSelectionData: (data: RegionSelectionData | null) => void;

  currentSelectionRange: CurrentSelectionRange | null;
  setCurrentSelectionRange: (range: CurrentSelectionRange | null) => void;

  confirmedSelectionData: ConfirmedSelectionData | null;
  setConfirmedSelectionData: (data: ConfirmedSelectionData | null) => void;
  clearConfirmedSelectionData: () => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  triggerRegionSelection: false,
  setTriggerRegionSelection: (trigger) => set({ triggerRegionSelection: trigger }),

  isInSelectionMode: false,
  setIsInSelectionMode: (inMode) => set({ isInSelectionMode: inMode }),

  selectionData: null,
  setSelectionData: (data) => set({ selectionData: data }),

  currentSelectionRange: null,
  setCurrentSelectionRange: (range) => set({ currentSelectionRange: range }),

  confirmedSelectionData: null,
  setConfirmedSelectionData: (data) => set({ confirmedSelectionData: data }),
  clearConfirmedSelectionData: () => set({ confirmedSelectionData: null }),
}));

