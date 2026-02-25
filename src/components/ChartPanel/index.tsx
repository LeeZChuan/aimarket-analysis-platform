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
 * - 右键菜单：绘制覆盖物后右键可唤起可扩展操作菜单（导出CSV/JSON等）
 *
 * 使用位置：
 * - /views/StockDetailView/index.tsx - 股票详情页（中间主图表区域）
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { X as XIcon, FileDown, FileJson, BarChart3 } from 'lucide-react';
import { init, dispose, registerOverlay } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
import { useStore } from '../../store/useStore';
import { useChartStore, MAX_SELECTION_COUNT } from '../../store/useChartStore';
import { useThemeStore } from '../../store/useThemeStore';
import { stockService } from '../../services/stockService';
import { notifyWarning, notifySuccess, notifyError } from '../../utils/notify';
import { captureScreenshot } from '../../utils/screenshot';
import { exportKLineCsv, exportKLineJson } from '../../utils/klineExport';
import { DrawingToolbar, DrawingTool } from './DrawingToolbar';
import { TimeRange } from './TimeRangeSelector';
import { StockInfoBar } from './StockInfoBar';
import { ChartToolbar } from './ChartToolbar';
import { ChartContextMenu } from './ChartContextMenu';
import type { ContextMenuAction, ContextMenuActionContext } from './ChartContextMenu';
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

const SHAPE_OVERLAY_NAMES = ['rect', 'circle', 'ellipse', 'triangle', 'horizontalRegionSelection'];

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

function sliceKLineByRange(
  dataList: KLineData[],
  startTimestamp: number,
  endTimestamp: number
): KLineDataItem[] | null {
  let startIndex = -1;
  let endIndex = -1;
  for (let i = 0; i < dataList.length; i++) {
    const ts = dataList[i].timestamp;
    if (ts >= startTimestamp && ts <= endTimestamp) {
      if (startIndex === -1) startIndex = i;
      endIndex = i;
    }
  }
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null;
  return dataList.slice(startIndex, endIndex + 1).map((d) => ({
    timestamp: d.timestamp,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume ?? 0,
  }));
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}


export function ChartPanel() {
  const { selectedStock } = useStore();
  const theme = useThemeStore((state) => state.theme);
  const {
    triggerRegionSelection,
    setTriggerRegionSelection,
    setConfirmedSelectionData,
  } = useChartStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
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

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [contextMenuCtx, setContextMenuCtx] = useState<ContextMenuActionContext | null>(null);
  const pendingContextRef = useRef<ContextMenuActionContext | null>(null);
  const activeOverlayIdsRef = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    let cancelled = false;

    const loadDailyKLine = async () => {
      if (!selectedStock?.symbol) {
        if (!cancelled) {
          setDailyData([]);
          setIsLoadingData(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setIsLoadingData(true);
          setDailyData([]);
        }
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

  useEffect(() => {
    if (!chartRef.current) return;
    if (!dailyData || dailyData.length === 0) {
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
      const id = chartRef.current.createOverlay({ name: tool });
      if (id && typeof id === 'string') {
        activeOverlayIdsRef.current.add(id);
      }
      setActiveTool(tool);
    }
  };

  useEffect(() => {
    if (triggerRegionSelection && chartRef.current) {
      const selId = chartRef.current.createOverlay({ name: 'horizontalRegionSelection' });
      if (selId && typeof selId === 'string') {
        activeOverlayIdsRef.current.add(selId);
      }
      setActiveTool('horizontalRegionSelection' as DrawingTool);
      setTriggerRegionSelection(false);
    }
  }, [triggerRegionSelection, setTriggerRegionSelection]);

  const handleClearOverlaysAndClose = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.removeOverlay();
      activeOverlayIdsRef.current.clear();
    }
    setActiveTool('none');
    setContextMenuVisible(false);
  }, []);

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

  const clearAllOverlays = handleClearOverlaysAndClose;

  const handleZoomIn = () => {
    if (!chartRef.current) return;
    try {
      chartRef.current.zoomAtCoordinate(-10);
    } catch (error) {
      console.error('Zoom in error:', error);
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    try {
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

  const resolveContextFromOverlays = useCallback((): ContextMenuActionContext | null => {
    if (!chartRef.current) return null;
    const dataList = chartRef.current.getDataList();
    if (!dataList || dataList.length === 0) return null;

    const trackedIds = activeOverlayIdsRef.current;
    const overlayList: Array<{ name: string; points: Array<{ timestamp?: number; value?: number }> }> = [];
    for (const id of trackedIds) {
      const ov = chartRef.current.getOverlayById(id);
      if (ov) overlayList.push(ov as any);
    }

    let minTs = Infinity;
    let maxTs = -Infinity;
    let hasShapes = false;

    for (const ov of overlayList) {
      if (!SHAPE_OVERLAY_NAMES.includes(ov.name)) continue;
      const pts = ov.points;
      if (!pts) continue;
      hasShapes = true;
      for (const pt of pts) {
        const ts = pt.timestamp ?? pt.value;
        if (ts != null && ts > 1e8) {
          minTs = Math.min(minTs, ts);
          maxTs = Math.max(maxTs, ts);
        }
      }
    }

    if (!hasShapes || !isFinite(minTs) || !isFinite(maxTs)) return null;

    const klineData = sliceKLineByRange(dataList, minTs, maxTs);
    if (!klineData || klineData.length === 0) return null;

    return {
      symbol: selectedStock?.symbol || '',
      stockName: selectedStock?.name || '',
      timeframe: timeRange,
      startTime: formatTs(minTs),
      endTime: formatTs(maxTs),
      klineData,
    };
  }, [selectedStock, timeRange]);

  // 双层拦截：mousedown(button=2) 缓存上下文 + contextmenu 显示菜单
  useEffect(() => {
    const wrapper = chartWrapperRef.current;
    if (!wrapper) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 2 || !chartRef.current) return;
      const ctx = resolveContextFromOverlays();
      pendingContextRef.current = ctx;
      if (ctx) {
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const ctx = pendingContextRef.current ?? resolveContextFromOverlays();
      pendingContextRef.current = null;
      if (!ctx) return;

      e.preventDefault();
      e.stopPropagation();

      setContextMenuCtx(ctx);
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setContextMenuVisible(true);
    };

    wrapper.addEventListener('mousedown', handleMouseDown, true);
    wrapper.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown, true);
      wrapper.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [resolveContextFromOverlays]);

  const closeContextMenu = useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  const contextMenuActions: ContextMenuAction[] = useMemo(
    () => [
      {
        id: 'export-csv',
        label: '导出 CSV',
        icon: <FileDown className="w-3.5 h-3.5" />,
        run: (ctx) => {
          exportKLineCsv(ctx.klineData, {
            symbol: ctx.symbol,
            timeframe: ctx.timeframe,
            startTime: ctx.startTime,
            endTime: ctx.endTime,
          });
          notifySuccess(`已导出 ${ctx.klineData.length} 条数据 (CSV)`);
        },
      },
      {
        id: 'export-json',
        label: '导出 JSON',
        icon: <FileJson className="w-3.5 h-3.5" />,
        dividerAfter: true,
        run: (ctx) => {
          exportKLineJson(ctx.klineData, {
            symbol: ctx.symbol,
            timeframe: ctx.timeframe,
            startTime: ctx.startTime,
            endTime: ctx.endTime,
          });
          notifySuccess(`已导出 ${ctx.klineData.length} 条数据 (JSON)`);
        },
      },
      {
        id: 'send-to-ai',
        label: '发送至 AI 分析',
        icon: <BarChart3 className="w-3.5 h-3.5" />,
        run: (ctx) => {
          if (ctx.klineData.length > MAX_SELECTION_COUNT) {
            notifyWarning(`最多选择 ${MAX_SELECTION_COUNT} 条数据，当前已选 ${ctx.klineData.length} 条`);
            return;
          }
          setConfirmedSelectionData({
            stockSymbol: ctx.symbol,
            stockName: ctx.stockName,
            timeframe: ctx.timeframe,
            startTime: ctx.startTime,
            endTime: ctx.endTime,
            dataCount: ctx.klineData.length,
            klineData: ctx.klineData,
          });
          notifySuccess(`已选择 ${ctx.klineData.length} 条K线数据，可在 AI 对话中使用`);
          handleClearOverlaysAndClose();
        },
      },
      {
        id: 'cancel-overlay',
        label: '取消选区',
        icon: <XIcon className="w-3.5 h-3.5" />,
        run: () => {
          handleClearOverlaysAndClose();
        },
      },
    ],
    [setConfirmedSelectionData, handleClearOverlaysAndClose]
  );

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

          <div ref={chartWrapperRef} className="flex-1 min-h-0 relative">
            <div ref={chartContainerRef} className="absolute inset-0" />
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />

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

      <ChartContextMenu
        visible={contextMenuVisible}
        position={contextMenuPos}
        context={contextMenuCtx}
        actions={contextMenuActions}
        onClose={closeContextMenu}
      />
    </>
  );
}
