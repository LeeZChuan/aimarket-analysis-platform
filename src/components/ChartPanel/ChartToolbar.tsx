/**
 * 图表工具栏组件 (底部控制栏)
 *
 * 功能：
 * - 时间周期选择器（放置在底部）
 * - 技术指标选择器
 * - 更多工具按钮（设置、截图等）
 * - 紧凑布局，节省空间
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表底部工具栏
 */

import { TimeRangeSelector, TimeRange } from './TimeRangeSelector';
import { IndicatorMenu } from './IndicatorMenu';
import { Settings, Camera, ZoomIn, ZoomOut } from 'lucide-react';

interface ChartToolbarProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  activeIndicators: string[];
  onToggleIndicator: (indicator: string) => void;
  showIndicatorMenu: boolean;
  onToggleIndicatorMenu: () => void;
}

export function ChartToolbar({
  timeRange,
  onTimeRangeChange,
  activeIndicators,
  onToggleIndicator,
  showIndicatorMenu,
  onToggleIndicatorMenu,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#0D0D0D] border-t border-[#2A2A2A] transition-all duration-200">
      <div className="flex items-center gap-3">
        <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />

        <div className="h-4 w-px bg-[#2A2A2A]" />

        <IndicatorMenu
          activeIndicators={activeIndicators}
          onToggleIndicator={onToggleIndicator}
          isOpen={showIndicatorMenu}
          onToggle={onToggleIndicatorMenu}
          position="bottom"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          title="放大"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-[#2A2A2A]" />

        <button
          className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          title="截图"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <button
          className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          title="设置"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
