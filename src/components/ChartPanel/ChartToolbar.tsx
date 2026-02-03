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
import { chartToolbarStyles } from './ChartToolbarStyles';

interface ChartToolbarProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  activeIndicators: string[];
  onToggleIndicator: (indicator: string) => void;
  showIndicatorMenu: boolean;
  onToggleIndicatorMenu: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onScreenshot?: () => void;
}

export function ChartToolbar({
  timeRange,
  onTimeRangeChange,
  activeIndicators,
  onToggleIndicator,
  showIndicatorMenu,
  onToggleIndicatorMenu,
  onZoomIn,
  onZoomOut,
  onScreenshot,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2" style={chartToolbarStyles.container}>
      <div className="flex items-center gap-3">
        <TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />

        <div className="h-4 w-px" style={chartToolbarStyles.divider} />

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
          onClick={onZoomIn}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors"
          style={!onZoomIn ? chartToolbarStyles.buttonDisabled : chartToolbarStyles.button}
          onMouseEnter={(e) => {
            if (onZoomIn) Object.assign(e.currentTarget.style, chartToolbarStyles.buttonHover);
          }}
          onMouseLeave={(e) => {
            if (onZoomIn) Object.assign(e.currentTarget.style, chartToolbarStyles.button);
          }}
          title="放大"
          disabled={!onZoomIn}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onZoomOut}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors"
          style={!onZoomOut ? chartToolbarStyles.buttonDisabled : chartToolbarStyles.button}
          onMouseEnter={(e) => {
            if (onZoomOut) Object.assign(e.currentTarget.style, chartToolbarStyles.buttonHover);
          }}
          onMouseLeave={(e) => {
            if (onZoomOut) Object.assign(e.currentTarget.style, chartToolbarStyles.button);
          }}
          title="缩小"
          disabled={!onZoomOut}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px" style={chartToolbarStyles.divider} />

        <button
          onClick={onScreenshot}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors"
          style={!onScreenshot ? chartToolbarStyles.buttonDisabled : chartToolbarStyles.button}
          onMouseEnter={(e) => {
            if (onScreenshot) Object.assign(e.currentTarget.style, chartToolbarStyles.buttonHover);
          }}
          onMouseLeave={(e) => {
            if (onScreenshot) Object.assign(e.currentTarget.style, chartToolbarStyles.button);
          }}
          title="截图"
          disabled={!onScreenshot}
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        <button
          className="w-7 h-7 flex items-center justify-center rounded transition-colors"
          style={chartToolbarStyles.button}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, chartToolbarStyles.buttonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, chartToolbarStyles.button)}
          title="设置"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
