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

import { useRef } from 'react';
import { TimeRangeSelector, TimeRange } from './TimeRangeSelector';
import { IndicatorMenu } from './IndicatorMenu';
import { Settings, Camera, ZoomIn, ZoomOut } from 'lucide-react';
import { chartToolbarStyles } from './ChartToolbarStyles';
import { ChartSettingsPanel, ChartSettings } from './ChartSettingsPanel';

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
  showSettings: boolean;
  onToggleSettings: () => void;
  chartSettings: ChartSettings;
  onChartSettingsChange: (settings: ChartSettings) => void;
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
  showSettings,
  onToggleSettings,
  chartSettings,
  onChartSettingsChange,
}: ChartToolbarProps) {
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center justify-between px-4 py-2 relative" style={chartToolbarStyles.container}>
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

      <div className="flex items-center gap-2 relative">
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

        <div className="relative">
          <button
            ref={settingsBtnRef}
            onClick={onToggleSettings}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={showSettings ? chartToolbarStyles.buttonHover : chartToolbarStyles.button}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, chartToolbarStyles.buttonHover)}
            onMouseLeave={(e) => {
              if (!showSettings) Object.assign(e.currentTarget.style, chartToolbarStyles.button);
            }}
            title="设置"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {showSettings && (
            <ChartSettingsPanel
              settings={chartSettings}
              onChange={onChartSettingsChange}
              onClose={onToggleSettings}
              anchorRef={settingsBtnRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
