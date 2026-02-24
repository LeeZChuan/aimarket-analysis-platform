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
import { Check, X as XIcon, FileDown, FileJson } from 'lucide-react';
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

const SHAPE_OVERLAY_NAMES = ['rect', 'circle', 'ellipse', 'triangle'];

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
    isInSelectionMode,
    setIsInSelectionMode,
    currentSelectionRange,
    setCurrentSelectionRange,
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

  // 监听区域选择触发
  useEffect(() => {
    if (triggerRegionSelection && chartRef.current) {
      setIsInSelectionMode(true);

      chartRef.current.setStyles({
        crosshair: {
          show: false
        }
      });

      const selId = chartRef.current.createOverlay({ name: 'horizontalRegionSelection' });
      if (selId && typeof selId === 'string') {
        activeOverlayIdsRef.current.add(selId);
      }
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
          startTime: formatTs(dataList[startIndex].timestamp),
          endTime: formatTs(dataList[endIndex].timestamp),
          startTimestamp: dataList[startIndex].timestamp,
          endTimestamp: dataList[endIndex].timestamp,
          dataCount: endIndex - startIndex + 1,
        };
        setCurrentSelectionRange(range);
      }
    };

    updateSelectionRange();
    const intervalId = setInterval(updateSelectionRange, 100);

    return () => {
      clearInterval(intervalId);
      setCurrentSelectionRange(null);
    };
  }, [isInSelectionMode, setCurrentSelectionRange]);

  const handleCancelSelection = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.setStyles({ crosshair: { show: true } });
      chartRef.current.removeOverlay();
      activeOverlayIdsRef.current.clear();
    }
    setIsInSelectionMode(false);
    setActiveTool('none');
    setContextMenuVisible(false);
  }, [setIsInSelectionMode]);

  const handleConfirmSelection = useCallback(() => {
    if (!chartRef.current) return;

    const range = useChartStore.getState().currentSelectionRange;
    if (!range) return;

    const dataList = chartRef.current.getDataList();
    if (!dataList || dataList.length === 0) return;

    const klineData = sliceKLineByRange(dataList, range.startTimestamp, range.endTimestamp);
    if (klineData && klineData.length > 0) {
      if (klineData.length > MAX_SELECTION_COUNT) {
        notifyWarning(`最多选择 ${MAX_SELECTION_COUNT} 条数据，当前已选 ${klineData.length} 条`);
        return;
      }

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
    activeOverlayIdsRef.current.clear();
    setIsInSelectionMode(false);
    setActiveTool('none');
    setContextMenuVisible(false);
  }, [selectedStock, timeRange, setIsInSelectionMode, setConfirmedSelectionData]);

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
    activeOverlayIdsRef.current.clear();
    setActiveTool('none');
    setContextMenuVisible(false);
  };

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

  // 从覆盖物的点位提取时间范围，构建右键菜单上下文
  const resolveContextFromOverlays = useCallback((): ContextMenuActionContext | null => {
    console.log('[ContextMenu] resolveContextFromOverlays called');
    if (!chartRef.current) { console.log('[ContextMenu] chartRef.current is null'); return null; }
    const dataList = chartRef.current.getDataList();
    if (!dataList || dataList.length === 0) { console.log('[ContextMenu] dataList empty'); return null; }
    console.log('[ContextMenu] dataList length:', dataList.length);

    // 如果在框选模式中，优先用框选范围
    const selRange = useChartStore.getState().currentSelectionRange;
    console.log('[ContextMenu] selRange:', selRange);
    if (selRange) {
      const klineData = sliceKLineByRange(dataList, selRange.startTimestamp, selRange.endTimestamp);
      if (klineData && klineData.length > 0) {
        console.log('[ContextMenu] using selRange, klineData count:', klineData.length);
        return {
          symbol: selectedStock?.symbol || '',
          stockName: selectedStock?.name || '',
          timeframe: timeRange,
          startTime: selRange.startTime,
          endTime: selRange.endTime,
          klineData,
        };
      }
    }

    // 从已跟踪的覆盖物 ID 逐个获取
    const trackedIds = activeOverlayIdsRef.current;
    console.log('[ContextMenu] tracked overlay IDs:', [...trackedIds]);
    const overlayList: Array<{ name: string; points: Array<{ timestamp?: number; value?: number }> }> = [];
    for (const id of trackedIds) {
      const ov = chartRef.current.getOverlayById(id);
      if (ov) overlayList.push(ov as any);
    }
    console.log('[ContextMenu] resolved overlays count:', overlayList.length, 'names:', overlayList.map(o => o.name));

    let minTs = Infinity;
    let maxTs = -Infinity;
    let hasShapes = false;

    for (const ov of overlayList) {
      if (!SHAPE_OVERLAY_NAMES.includes(ov.name)) {
        console.log('[ContextMenu] skipping overlay:', ov.name);
        continue;
      }
      const pts = ov.points;
      console.log('[ContextMenu] overlay', ov.name, 'points:', JSON.stringify(pts));
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

    console.log('[ContextMenu] hasShapes:', hasShapes, 'minTs:', minTs, 'maxTs:', maxTs);
    if (!hasShapes || !isFinite(minTs) || !isFinite(maxTs)) { console.log('[ContextMenu] no valid shape range'); return null; }

    const klineData = sliceKLineByRange(dataList, minTs, maxTs);
    console.log('[ContextMenu] sliced klineData count:', klineData?.length ?? 0);
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
      console.log('[ContextMenu] mousedown fired, button:', e.button);
      if (e.button !== 2 || !chartRef.current) return;
      console.log('[ContextMenu] right-click mousedown, resolving context...');
      const ctx = resolveContextFromOverlays();
      console.log('[ContextMenu] mousedown resolved ctx:', ctx ? 'HAS CONTEXT' : 'NULL');
      pendingContextRef.current = ctx;
      if (ctx) {
        e.stopPropagation();
        console.log('[ContextMenu] mousedown stopPropagation (blocked klinecharts)');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      console.log('[ContextMenu] contextmenu fired, pendingCtx:', pendingContextRef.current ? 'HAS' : 'NULL');
      const ctx = pendingContextRef.current ?? resolveContextFromOverlays();
      pendingContextRef.current = null;
      if (!ctx) { console.log('[ContextMenu] contextmenu: no context, skipping'); return; }

      e.preventDefault();
      e.stopPropagation();

      console.log('[ContextMenu] SHOWING MENU at', e.clientX, e.clientY, 'klines:', ctx.klineData.length);
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
    ],
    []
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
