/**
 * 图表状态管理
 * 用于在不同组件之间共享图表控制状态
 */

import { create } from 'zustand';

export interface RegionSelectionData {
  startTime: string;
  endTime: string;
  dataCount: number;
  startIndex: number;
  endIndex: number;
  timeframe: string;  // 时间周期，如 '1D', '1W', '1M' 等
}

export interface CurrentSelectionRange {
  startTime: string;
  endTime: string;
  startTimestamp: number;
  endTimestamp: number;
}

interface ChartStore {
  // 触发区域选择工具
  triggerRegionSelection: boolean;
  setTriggerRegionSelection: (trigger: boolean) => void;
  
  // 框选模式状态（用于控制十字光标等）
  isInSelectionMode: boolean;
  setIsInSelectionMode: (inMode: boolean) => void;
  
  // 框选结果数据
  selectionData: RegionSelectionData | null;
  setSelectionData: (data: RegionSelectionData | null) => void;
  
  // 当前框选范围（实时更新）
  currentSelectionRange: CurrentSelectionRange | null;
  setCurrentSelectionRange: (range: CurrentSelectionRange | null) => void;
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
}));

