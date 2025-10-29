import { VirtualScrollConfig } from './types';

export class VirtualScrollManager {
  private config: VirtualScrollConfig;
  private callbacks: Set<() => void>;

  constructor(config: VirtualScrollConfig) {
    this.config = config;
    this.callbacks = new Set();
  }

  updateConfig(config: Partial<VirtualScrollConfig>) {
    this.config = { ...this.config, ...config };
    console.log('[VirtualScrollManager] updateConfig:', {
      scrollTop: this.config.scrollTop,
      totalRows: this.config.totalRows,
      rowHeight: this.config.rowHeight,
      visibleRows: this.config.visibleRows
    });
    this.notify();
  }

  getConfig(): VirtualScrollConfig {
    return this.config;
  }

  getVisibleRange(): { start: number; end: number; offsetY: number } {
    const { scrollTop, rowHeight, visibleRows, totalRows } = this.config;

    console.log('[VirtualScrollManager] getVisibleRange called with:', {
      scrollTop,
      rowHeight,
      visibleRows,
      totalRows
    });

    const bufferRows = Math.ceil(visibleRows * 0.5);
    const startIndex = Math.floor(scrollTop / rowHeight);
    const start = Math.max(0, startIndex - bufferRows);
    const end = Math.min(totalRows, startIndex + visibleRows + bufferRows);
    const offsetY = start * rowHeight;

    console.log('[VirtualScrollManager] calculated:', {
      bufferRows,
      startIndex,
      start,
      end,
      offsetY
    });

    return { start, end, offsetY };
  }

  getTotalHeight(): number {
    return this.config.totalRows * this.config.rowHeight;
  }

  subscribe(callback: () => void) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notify() {
    this.callbacks.forEach(callback => callback());
  }
}
