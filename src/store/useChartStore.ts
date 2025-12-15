/**
 * 图表状态管理
 * 用于在不同组件之间共享图表控制状态
 */

import { create } from 'zustand';

interface ChartStore {
  // 触发区域选择工具
  triggerRegionSelection: boolean;
  setTriggerRegionSelection: (trigger: boolean) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  triggerRegionSelection: false,
  setTriggerRegionSelection: (trigger) => set({ triggerRegionSelection: trigger }),
}));

