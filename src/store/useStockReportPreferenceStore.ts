import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReportHorizon } from '../types/stockReport';

interface StockReportPreferenceState {
  horizon: ReportHorizon | null;
  setHorizon: (horizon: ReportHorizon) => void;
  resetHorizon: () => void;
}

export const useStockReportPreferenceStore = create<StockReportPreferenceState>()(
  persist(
    (set) => ({
      horizon: null,
      setHorizon: (horizon) => set({ horizon }),
      resetHorizon: () => set({ horizon: null }),
    }),
    {
      name: 'stock-report-preference-storage',
      partialize: (state) => ({
        horizon: state.horizon,
      }),
    },
  ),
);
