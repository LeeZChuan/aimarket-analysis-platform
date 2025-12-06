/**
 * 图表面板主组件（专业K线图表）
 *
 * 功能：
 * - 专业级K线图表展示（支持蜡烛图、MA、MACD、RSI等技术指标）
 * - 时间周期切换（1D/5D/1W/1M/3M/1Y）
 * - 绘图工具栏（趋势线、水平线、矩形、圆形、文本标注等）
 * - 技术指标添加/移除（MA/EMA/BOLL/SAR/MACD/KDJ/RSI/VOL等）
 * - 图表缩放和拖拽交互
 * - 鼠标悬停显示详细数据
 * - 可折叠的头部和侧边栏
 *
 * 使用位置：
 * - /views/StockDetailView/index.tsx - 股票详情页（中间主图表区域）
 */

import { useEffect, useRef, useState } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
import { useStore } from '../../store/useStore';
import { DrawingToolbar, DrawingTool } from './DrawingToolbar';
import { TimeRange } from './TimeRangeSelector';
import { StockInfoBar } from './StockInfoBar';
import { ChartToolbar } from './ChartToolbar';
import { generateMockData, convertKLineData } from './chartDataUtils';

export function ChartPanel() {
  const { selectedStock } = useStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const indicatorIdsRef = useRef<Map<string, string>>(new Map());

  const [indicators, setIndicators] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [hoveredData, setHoveredData] = useState<KLineData | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
      const chart = init(chartContainerRef.current, {
        styles: {
          grid: {
            horizontal: { color: '#1A1A1A' },
            vertical: { color: '#1A1A1A' },
          },
          candle: {
            type: 'candle_solid',
            bar: {
              upColor: '#00D09C',
              downColor: '#FF4976',
              upBorderColor: '#00D09C',
              downBorderColor: '#FF4976',
              upWickColor: '#00D09C',
              downWickColor: '#FF4976',
            },
          },
          indicator: {
            lastValueMark: { show: false },
            tooltip: {
              showRule: 'always',
              showType: 'rect',
              text: { size: 12, color: '#D9D9D9' },
            },
          },
        },
      });

      if (chart) {
        chartRef.current = chart;

        if (!indicatorIdsRef.current.has('VOL')) {
          const volId = chart.createIndicator('VOL', true);
          if (volId) {
            indicatorIdsRef.current.set('VOL', volId);
            setIndicators(['VOL']);
          }
        }

        chart.subscribeAction('crosshair', (data) => {
          if (data && data.kLineData) {
            setHoveredData(data.kLineData as KLineData);
          } else {
            setHoveredData(null);
          }
        });

        const resizeObserver = new ResizeObserver(() => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.resize();
          }
        });

        if (chartContainerRef.current) {
          resizeObserver.observe(chartContainerRef.current);
        }

        const dailyData = generateMockData(1250, selectedStock);
        const convertedData = convertKLineData(dailyData, timeRange);
        chart.applyNewData(convertedData);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }

    return () => {
      if (chartRef.current && chartContainerRef.current) {
        dispose(chartContainerRef.current);
        chartRef.current = null;
        indicatorIdsRef.current.clear();
        setIndicators([]);
      }
    };
  }, [selectedStock, timeRange]);

  const handleTimeRangeChange = (range: TimeRange) => {
    if (timeRange === range) return;
    setTimeRange(range);

    if (chartRef.current) {
      const dailyData = generateMockData(1250, selectedStock);
      const convertedData = convertKLineData(dailyData, range);
      chartRef.current.applyNewData(convertedData);
    }
  };

  const toggleIndicator = (indicator: string) => {
    if (!chartRef.current) return;

    const mainIndicators = ['MA', 'EMA', 'BOLL', 'SAR'];
    const isMainIndicator = mainIndicators.includes(indicator);

    if (indicators.includes(indicator)) {
      if (isMainIndicator) {
        chartRef.current.removeIndicator('candle_pane', indicator);
      } else {
        const allPanes = chartRef.current.getPanes();
        allPanes.forEach(pane => {
          if (pane.id !== 'candle_pane') {
            chartRef.current!.removeIndicator(pane.id, indicator);
          }
        });
      }
      indicatorIdsRef.current.delete(indicator);
      setIndicators((prev) => prev.filter((i) => i !== indicator));
    } else {
      let indicatorId: string | null = null;
      if (isMainIndicator) {
        indicatorId = chartRef.current.createIndicator(indicator, false, { id: 'candle_pane' });
      } else {
        indicatorId = chartRef.current.createIndicator(indicator, true);
      }

      if (indicatorId) {
        indicatorIdsRef.current.set(indicator, indicatorId);
        setIndicators((prev) => [...prev, indicator]);
      }
    }
  };

  const handleDrawingTool = (tool: DrawingTool) => {
    if (!chartRef.current) return;

    if (tool === 'none') {
      chartRef.current.createOverlay({ name: '' });
      setActiveTool('none');
    } else {
      chartRef.current.createOverlay({ name: tool });
      setActiveTool(tool);
    }
  };

  const clearAllOverlays = () => {
    if (!chartRef.current) return;
    chartRef.current.removeOverlay();
    setActiveTool('none');
  };

  return (
    <div className="h-full w-full bg-[#0D0D0D] flex">
      <DrawingToolbar
        activeTool={activeTool}
        onToolChange={handleDrawingTool}
        onClearAll={clearAllOverlays}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StockInfoBar
          stock={selectedStock}
          timeRange={timeRange}
          hoveredData={hoveredData}
        />

        <div ref={chartContainerRef} className="flex-1 min-h-0" />

        <ChartToolbar
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          activeIndicators={indicators}
          onToggleIndicator={toggleIndicator}
          showIndicatorMenu={showIndicatorMenu}
          onToggleIndicatorMenu={() => setShowIndicatorMenu(!showIndicatorMenu)}
        />
      </div>
    </div>
  );
}
