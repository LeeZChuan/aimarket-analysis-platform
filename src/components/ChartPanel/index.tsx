/**
 * 图表面板主组件（专业K线图表）
 *
 * 功能：
 * - 专业级K线图表展示（支持蜡烛图、MA、MACD、RSI等技术指标）
 * - 时间周期切换（1D/5D/1W/1M/3M/1Y）
 * - 绘图工具栏（趋势线、水平线、矩形、圆形、椭圆形、三角形、文本标注等）
 * - 技术指标添加/移除（MA/EMA/BOLL/SAR/MACD/KDJ/RSI/VOL等）
 * - 图表缩放和拖拽交互
 * - 鼠标悬停显示详细数据
 * - 可折叠的头部和侧边栏
 *
 * 使用位置：
 * - /views/StockDetailView/index.tsx - 股票详情页（中间主图表区域）
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { init, dispose, registerOverlay } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
import { useStore } from '../../store/useStore';
import { useChartStore, MAX_SELECTION_COUNT } from '../../store/useChartStore';
import { useThemeStore } from '../../store/useThemeStore';
import { stockService } from '../../services/stockService';
import { notifyWarning, notifySuccess, notifyError } from '../../utils/notify';
import { captureScreenshot } from '../../utils/screenshot';
import { DrawingToolbar, DrawingTool } from './DrawingToolbar';
import { TimeRange } from './TimeRangeSelector';
import { StockInfoBar } from './StockInfoBar';
import { ChartToolbar } from './ChartToolbar';
import { convertKLineData } from './chartDataUtils';
import { horizontalRegionSelection } from './overlays/horizontalRegionSelection';
import { rectOverlay } from './overlays/rectOverlay';
import { circleOverlay } from './overlays/circleOverlay';
import { ellipseOverlay } from './overlays/ellipseOverlay';
import { triangleOverlay } from './overlays/triangleOverlay';
import { textSegmentOverlay } from './overlays/textSegmentOverlay';
import { TextInputModal } from './TextInputModal';
import type { KLineDataItem } from '../../store/useChartStore';

const getCSSVar = (varName: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
};


const toChartKLineData = (
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>
): KLineData[] => {
  return Array.from(data.values()).sort((a, b) => a.timestamp - b.timestamp);
};


export function ChartPanel() {
  const { selectedStock } = useStore();
  const theme = useThemeStore((state) => state.theme);
  const {
    triggerRegionSelection,
    setTriggerRegionSelection,
    isInSelectionMode,
    setIsInSelectionMode,
    currentSelectionRange,
    setCurrentSelectionRange,
    setConfirmedSelectionData,
  } = useChartStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const indicatorIdsRef = useRef<Map<string, string>>(new Map());

  const [indicators, setIndicators] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [hoveredData, setHoveredData] = useState<KLineData | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [dailyData, setDailyData] = useState<KLineData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showTextInputModal, setShowTextInputModal] = useState(false);
  const [textInputInitialValue, setTextInputInitialValue] = useState('');
  const pendingTextOverlayIdRef = useRef<string | null>(null);
  const isEditingTextRef = useRef(false);

  useEffect(() => {
    registerOverlay(horizontalRegionSelection);
    registerOverlay(rectOverlay);
    registerOverlay(circleOverlay);
    registerOverlay(ellipseOverlay);
    registerOverlay(triangleOverlay);
    registerOverlay(textSegmentOverlay);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) return;

    const chart = init(chartContainerRef.current, {
      styles: {
        grid: {
          horizontal: { color: getCSSVar('--chart-grid') },
          vertical: { color: getCSSVar('--chart-grid') },
        },
        candle: {
          type: 'candle_solid',
          bar: {
            upColor: getCSSVar('--chart-candle-up'),
            downColor: getCSSVar('--chart-candle-down'),
            upBorderColor: getCSSVar('--chart-candle-up'),
            downBorderColor: getCSSVar('--chart-candle-down'),
            upWickColor: getCSSVar('--chart-candle-up'),
            downWickColor: getCSSVar('--chart-candle-down'),
          },
        },
        indicator: {
          lastValueMark: { show: false },
          tooltip: {
            showRule: 'always',
            showType: 'rect',
            text: { size: 12, color: getCSSVar('--text-secondary') },
          },
        },
      },
    });

    if (!chart) return;

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

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current && chartContainerRef.current) {
        dispose(chartContainerRef.current);
        chartRef.current = null;
        indicatorIdsRef.current.clear();
        setIndicators([]);
      }
    };
  }, []);

  // 后端优先加载日K数据，失败/无数据则回退到 mock（保证图表可用）
  useEffect(() => {
    let cancelled = false;

    const loadDailyKLine = async () => {
      if (!selectedStock?.symbol) {
        // 未选中股票：清空数据，交给 UI 显示“请选择股票”
        if (!cancelled) {
          setDailyData([]);
          setIsLoadingData(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          // 切换股票时，先清空旧数据，避免短暂显示上一只股票的K线
          setIsLoadingData(true);
          setDailyData([]);
        }
        // TODO: 这里起止时间计划走当前后台存的时间2000-01-03至近的数据
        const start = '2000-01-03';
        const end = '2025-12-31';

        const apiData = await stockService.getKLineData(
          selectedStock.symbol,
          'day',
          start,
          end
        );

        if (cancelled) return;

        const normalized = toChartKLineData(apiData);
        if (normalized.length > 0) {
          setDailyData(normalized);
        } else {
          setDailyData([]);
          notifyWarning('暂无K线数据');
        }
      } catch (e) {
        if (!cancelled) setDailyData([]);
        notifyWarning('获取K线数据失败');
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };

    loadDailyKLine();

    return () => {
      cancelled = true;
    };
  }, [selectedStock?.symbol]);

  // 根据时间周期把日线转换为目标周期，并喂给图表
  useEffect(() => {
    if (!chartRef.current) return;
    if (!dailyData || dailyData.length === 0) {
      // 清空旧数据，避免切换到“无数据股票”时还展示上一个股票
      chartRef.current.applyNewData([]);
      return;
    }
    chartRef.current.applyNewData(convertKLineData(dailyData, timeRange));
  }, [dailyData, timeRange]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setStyles({
        grid: {
          horizontal: { color: getCSSVar('--chart-grid') },
          vertical: { color: getCSSVar('--chart-grid') },
        },
        candle: {
          bar: {
            upColor: getCSSVar('--chart-candle-up'),
            downColor: getCSSVar('--chart-candle-down'),
            upBorderColor: getCSSVar('--chart-candle-up'),
            downBorderColor: getCSSVar('--chart-candle-down'),
            upWickColor: getCSSVar('--chart-candle-up'),
            downWickColor: getCSSVar('--chart-candle-down'),
          },
        },
        indicator: {
          tooltip: {
            text: { color: getCSSVar('--text-secondary') },
          },
        },
      });
    }
  }, [theme]);

  const handleTimeRangeChange = (range: TimeRange) => {
    if (timeRange === range) return;
    setTimeRange(range);
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

  // 监听区域选择触发
  useEffect(() => {
    if (triggerRegionSelection && chartRef.current) {
      // 进入框选模式
      setIsInSelectionMode(true);
      
      // 禁用十字光标
      chartRef.current.setStyles({
        crosshair: {
          show: false
        }
      });
      
      chartRef.current.createOverlay({ name: 'horizontalRegionSelection' });
      setActiveTool('horizontalRegionSelection' as DrawingTool);
      setTriggerRegionSelection(false);
    }
  }, [triggerRegionSelection, setTriggerRegionSelection, setIsInSelectionMode]);

  // 实时追踪框选范围
  useEffect(() => {
    if (!isInSelectionMode || !chartRef.current) return;

    const updateSelectionRange = () => {
      if (!chartRef.current) return;
      
      const overlays = chartRef.current.getOverlayById();
      if (!overlays || overlays.length === 0) return;

      const regionOverlay = overlays.find((o: any) => o.name === 'horizontalRegionSelection');
      if (!regionOverlay) return;

      const points = (regionOverlay as any).points;
      if (!points || points.length < 2) return;

      const dataList = chartRef.current.getDataList();
      if (!dataList || dataList.length === 0) return;

      const leftTimestamp = points[0].value;
      const rightTimestamp = points[1].value;

      // 找到对应的数据索引
      let startIndex = -1;
      let endIndex = -1;
      
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].timestamp >= leftTimestamp && startIndex === -1) {
          startIndex = i;
        }
        if (dataList[i].timestamp <= rightTimestamp) {
          endIndex = i;
        }
      }

      if (startIndex !== -1 && endIndex !== -1) {
        const range = {
          startTime: new Date(dataList[startIndex].timestamp).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          endTime: new Date(dataList[endIndex].timestamp).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          startTimestamp: dataList[startIndex].timestamp,
          endTimestamp: dataList[endIndex].timestamp,
          dataCount: endIndex - startIndex + 1,
        };
        setCurrentSelectionRange(range);
      }
    };

    // 初始更新
    updateSelectionRange();

    // 定时更新（监听拖拽变化）
    const intervalId = setInterval(updateSelectionRange, 100);

    return () => {
      clearInterval(intervalId);
      setCurrentSelectionRange(null);
    };
  }, [isInSelectionMode, setCurrentSelectionRange]);

  // 处理取消框选
  const handleCancelSelection = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.setStyles({ crosshair: { show: true } });
      chartRef.current.removeOverlay();
    }
    setIsInSelectionMode(false);
    setActiveTool('none');
  }, [setIsInSelectionMode]);

  const handleConfirmSelection = useCallback(() => {
    if (!chartRef.current) return;

    const range = useChartStore.getState().currentSelectionRange;
    if (!range) return;

    const dataList = chartRef.current.getDataList();
    if (!dataList || dataList.length === 0) return;

    const { startTimestamp, endTimestamp } = range;
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < dataList.length; i++) {
      const ts = dataList[i].timestamp;
      if (ts >= startTimestamp && ts <= endTimestamp) {
        if (startIndex === -1) startIndex = i;
        endIndex = i;
      }
    }

    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      const dataCount = endIndex - startIndex + 1;
      if (dataCount > MAX_SELECTION_COUNT) {
        notifyWarning(`最多选择 ${MAX_SELECTION_COUNT} 条数据，当前已选 ${dataCount} 条`);
        return;
      }

      const sliced = dataList.slice(startIndex, endIndex + 1);
      const klineData: KLineDataItem[] = sliced.map((d) => ({
        timestamp: d.timestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume ?? 0,
      }));

      setConfirmedSelectionData({
        stockSymbol: selectedStock?.symbol || '',
        stockName: selectedStock?.name || '',
        timeframe: timeRange,
        startTime: range.startTime,
        endTime: range.endTime,
        dataCount: klineData.length,
        klineData,
      });

      notifySuccess(`已选择 ${klineData.length} 条K线数据`);
    }

    chartRef.current.setStyles({ crosshair: { show: true } });
    chartRef.current.removeOverlay();
    setIsInSelectionMode(false);
    setActiveTool('none');
  }, [selectedStock, timeRange, setIsInSelectionMode, setConfirmedSelectionData]);

  // (confirm/cancel buttons are now in the HTML info bar, no CustomEvent listeners needed)

  useEffect(() => {
    const handleTextSegmentDrawEnd = (event: Event) => {
      const { id } = (event as CustomEvent).detail;
      if (id) {
        pendingTextOverlayIdRef.current = id;
        isEditingTextRef.current = false;
        setTextInputInitialValue('');
        setShowTextInputModal(true);
      }
    };

    const handleTextSegmentEdit = (event: Event) => {
      const { id, currentText } = (event as CustomEvent).detail;
      if (id) {
        pendingTextOverlayIdRef.current = id;
        isEditingTextRef.current = true;
        setTextInputInitialValue(currentText || '');
        setShowTextInputModal(true);
      }
    };

    window.addEventListener('textSegmentDrawEnd', handleTextSegmentDrawEnd);
    window.addEventListener('textSegmentEdit', handleTextSegmentEdit);
    return () => {
      window.removeEventListener('textSegmentDrawEnd', handleTextSegmentDrawEnd);
      window.removeEventListener('textSegmentEdit', handleTextSegmentEdit);
    };
  }, []);

  const handleTextInputConfirm = useCallback((text: string) => {
    const overlayId = pendingTextOverlayIdRef.current;
    if (chartRef.current && overlayId) {
      chartRef.current.overrideOverlay({
        id: overlayId,
        extendData: { text },
      });
    }
    pendingTextOverlayIdRef.current = null;
    isEditingTextRef.current = false;
    setShowTextInputModal(false);
  }, []);

  const handleTextInputCancel = useCallback(() => {
    const overlayId = pendingTextOverlayIdRef.current;
    if (chartRef.current && overlayId && !isEditingTextRef.current) {
      chartRef.current.removeOverlay(overlayId);
    }
    pendingTextOverlayIdRef.current = null;
    isEditingTextRef.current = false;
    setShowTextInputModal(false);
  }, []);

  const clearAllOverlays = () => {
    if (!chartRef.current) return;
    chartRef.current.removeOverlay();
    setActiveTool('none');
  };

  // 放大图表（显示更少的K线，每根K线更宽）
  const handleZoomIn = () => {
    
    if (!chartRef.current) return;
    try {
      // 先确保缩放功能是启用的
      // chartRef.current.setZoomEnabled(true);
      console.log('chartRef.current.zoomAtCoordinate');
      // 在图表中心缩放
      chartRef.current.zoomAtCoordinate(-10);
    } catch (error) {
      console.error('Zoom in error:', error);
    }
  };

  // 缩小图表（显示更多的K线，每根K线更窄）
  const handleZoomOut = () => {
    if (!chartRef.current) return;
    try {
      // 先确保缩放功能是启用的
      // chartRef.current.setZoomEnabled(true);
      // 在图表中心缩放
      chartRef.current.zoomAtCoordinate(10);
    } catch (error) {
      console.error('Zoom out error:', error);
    }
  };

  const handleScreenshot = async () => {
    try {
      await captureScreenshot();
      notifySuccess('截图已保存');
    } catch (error) {
      console.error('Screenshot error:', error);
      notifyError('截图失败');
    }
  };

  return (
    <>
      <div className="h-full w-full flex" style={{ background: 'var(--bg-primary)' }}>
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

          {/* 框选模式提示条 */}
          {isInSelectionMode && (
            <div className="px-4 py-2 flex items-center justify-between" style={{ background: 'var(--bg-active)', borderBottom: '1px solid var(--accent-primary)' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    框选模式
                  </span>
                </div>

                {/* 时间周期 */}
                <div className="flex items-center gap-1.5 pl-3" style={{ borderLeft: '1px solid var(--border-hover)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>周期:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: 'var(--accent-primary)', background: 'var(--bg-hover)' }}>
                    {timeRange}
                  </span>
                </div>

                {currentSelectionRange && (
                  <div className="flex items-center gap-3 pl-3" style={{ borderLeft: '1px solid var(--border-hover)' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>起:</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-primary)', background: 'var(--bg-hover)' }}>
                        {currentSelectionRange.startTime}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-disabled)' }}>→</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>止:</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-primary)', background: 'var(--bg-hover)' }}>
                        {currentSelectionRange.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-3" style={{ borderLeft: '1px solid var(--border-hover)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>数量:</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{
                          color: currentSelectionRange.dataCount > MAX_SELECTION_COUNT ? '#FF4976' : 'var(--accent-primary)',
                          background: currentSelectionRange.dataCount > MAX_SELECTION_COUNT ? 'rgba(255,73,118,0.1)' : 'var(--bg-hover)',
                        }}
                      >
                        {currentSelectionRange.dataCount}{currentSelectionRange.dataCount > MAX_SELECTION_COUNT ? ` / 上限${MAX_SELECTION_COUNT}` : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs mr-1" style={{ color: 'var(--text-muted)' }}>拖动手柄调整范围</span>
                <button
                  onClick={handleConfirmSelection}
                  className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: '#00D09C' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  确认
                </button>
                <button
                  onClick={handleCancelSelection}
                  className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: '#FF4976' }}
                >
                  <XIcon className="w-3.5 h-3.5" />
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 relative">
            <div ref={chartContainerRef} className="absolute inset-0" />

            {isLoadingData && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: 'rgba(0,0,0,0.10)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md shadow-sm"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full animate-spin"
                    style={{
                      border: '2px solid var(--border-primary)',
                      borderTopColor: 'var(--accent-primary)',
                    }}
                  />
                  <span className="text-xs">加载K线中...</span>
                </div>
              </div>
            )}

            {!isLoadingData && !selectedStock?.symbol && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-sm" style={{ color: 'var(--text-disabled)' }}>
                  请选择股票
                </div>
              </div>
            )}

            {!isLoadingData && selectedStock?.symbol && dailyData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-sm" style={{ color: 'var(--text-disabled)' }}>
                  暂无数据
                </div>
              </div>
            )}
          </div>

          <ChartToolbar
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            activeIndicators={indicators}
            onToggleIndicator={toggleIndicator}
            showIndicatorMenu={showIndicatorMenu}
            onToggleIndicatorMenu={() => setShowIndicatorMenu(!showIndicatorMenu)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onScreenshot={handleScreenshot}
          />
        </div>
      </div>

      {showTextInputModal && (
        <TextInputModal
          initialText={textInputInitialValue}
          onConfirm={handleTextInputConfirm}
          onCancel={handleTextInputCancel}
        />
      )}
    </>
  );
}
