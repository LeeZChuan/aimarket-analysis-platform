import { useEffect, useRef, useState } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
import { useStore } from '../../store/useStore';
import {
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  Minus,
  TrendingDown,
  Circle,
  Square,
  Triangle,
  ArrowRight,
  Pencil,
  Type,
  Eraser,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

type DrawingTool =
  | 'none'
  | 'horizontalRayLine'
  | 'horizontalSegment'
  | 'horizontalStraightLine'
  | 'verticalRayLine'
  | 'verticalSegment'
  | 'verticalStraightLine'
  | 'rayLine'
  | 'segment'
  | 'straightLine'
  | 'priceLine'
  | 'priceChannelLine'
  | 'parallelStraightLine'
  | 'fibonacciLine'
  | 'rect'
  | 'circle'
  | 'arc'
  | 'triangle'
  | 'text';

interface IndicatorOption {
  name: string;
  label: string;
  description: string;
}

interface TooltipState {
  show: boolean;
  text: string;
  x: number;
  y: number;
}

export function ChartPanel() {
  const { selectedStock, dateRange, setDateRange } = useStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredChange, setHoveredChange] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, text: '', x: 0, y: 0 });
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const indicatorMenuRef = useRef<HTMLDivElement>(null);

  const mainIndicators: IndicatorOption[] = [
    { name: 'MA', label: 'MA', description: '移动平均线' },
    { name: 'EMA', label: 'EMA', description: '指数移动平均' },
    { name: 'BOLL', label: 'BOLL', description: '布林带' },
    { name: 'SAR', label: 'SAR', description: '抛物线转向' },
  ];

  const subIndicators: IndicatorOption[] = [
    { name: 'VOL', label: 'VOL', description: '成交量' },
    { name: 'MACD', label: 'MACD', description: '指数平滑异同移动平均线' },
    { name: 'RSI', label: 'RSI', description: '相对强弱指标' },
    { name: 'KDJ', label: 'KDJ', description: '随机指标' },
    { name: 'CCI', label: 'CCI', description: '顺势指标' },
    { name: 'DMI', label: 'DMI', description: '动向指标' },
  ];

  const drawingTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'horizontalStraightLine', icon: Minus, label: '水平线' },
    { tool: 'verticalStraightLine', icon: Minus, label: '垂直线' },
    { tool: 'straightLine', icon: Minus, label: '直线' },
    { tool: 'rayLine', icon: ArrowRight, label: '射线' },
    { tool: 'segment', icon: Minus, label: '线段' },
    { tool: 'priceLine', icon: TrendingUp, label: '价格线' },
    { tool: 'priceChannelLine', icon: TrendingDown, label: '价格通道' },
    { tool: 'parallelStraightLine', icon: Minus, label: '平行线' },
    { tool: 'fibonacciLine', icon: Activity, label: '斐波那契' },
    { tool: 'rect', icon: Square, label: '矩形' },
    { tool: 'circle', icon: Circle, label: '圆形' },
    { tool: 'triangle', icon: Triangle, label: '三角形' },
    { tool: 'text', icon: Type, label: '文本' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
      const chart = init(chartContainerRef.current, {
        styles: {
          grid: {
            horizontal: {
              color: '#1A1A1A',
            },
            vertical: {
              color: '#1A1A1A',
            },
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
            lastValueMark: {
              show: false,
            },
            tooltip: {
              showRule: 'always',
              showType: 'rect',
              text: {
                size: 12,
                color: '#D9D9D9',
              },
            },
          },
        },
      });

      if (chart) {
        chartRef.current = chart;

        chart.createIndicator('MA', false, { id: 'candle_pane' });
        chart.createIndicator('VOL');
        chart.createIndicator('MACD');

        chart.subscribeAction('crosshair', (data) => {
          if (data && data.kLineData) {
            const kline = data.kLineData as KLineData;
            const basePrice = selectedStock?.price || 178.72;
            const change = ((kline.close - basePrice) / basePrice) * 100;

            setHoveredPrice(kline.close);
            setHoveredChange(change);
            setHoveredDate(new Date(kline.timestamp).toISOString().split('T')[0]);
          } else {
            setHoveredPrice(null);
            setHoveredChange(null);
            setHoveredDate(null);
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

        const days = getTimeRangeDays(timeRange);
        const mockData = generateMockData(days);
        chart.applyNewData(mockData);

        if (mockData.length > 0 && !dateRange.start) {
          const startDate = new Date(mockData[0].timestamp).toISOString().split('T')[0];
          const endDate = new Date(mockData[mockData.length - 1].timestamp).toISOString().split('T')[0];
          setDateRange({ start: startDate, end: endDate });
          setCustomStartDate(startDate);
          setCustomEndDate(endDate);
        }

        return () => {
          resizeObserver.disconnect();
        };
      }
    }

    return () => {
      if (chartRef.current && chartContainerRef.current) {
        dispose(chartContainerRef.current);
        chartRef.current = null;
      }
    };
  }, [selectedStock]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;

    indicators.forEach((indicator) => {
      if (['MA', 'EMA', 'BOLL', 'SAR'].includes(indicator)) {
        chart.createIndicator(indicator, false, { id: 'candle_pane' });
      } else {
        chart.createIndicator(indicator);
      }
    });
  }, [indicators]);

  const getTimeRangeDays = (range: TimeRange): number => {
    switch (range) {
      case '1D': return 1;
      case '5D': return 5;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      case 'ALL': return 730;
      default: return 180;
    }
  };

  const generateMockData = (days: number): KLineData[] => {
    const data: KLineData[] = [];
    let basePrice = selectedStock?.price || 150;
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const volatility = basePrice * 0.02;
      const open = basePrice + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility;
      const low = Math.min(open, close) - Math.random() * volatility;
      const volume = Math.floor(1000000 + Math.random() * 5000000);

      data.push({
        timestamp: date.getTime(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });

      basePrice = close;
    }

    return data;
  };

  const generateMockDataForDateRange = (startDate: Date, endDate: Date): KLineData[] => {
    const data: KLineData[] = [];
    let basePrice = selectedStock?.price || 150;
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * basePrice * volatility;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.floor(1000000 + Math.random() * 5000000);

        data.push({
          timestamp: currentDate.getTime(),
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume,
        });

        basePrice = close;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    if (timeRange === range) return;

    setTimeRange(range);
    setShowDatePicker(false);

    if (chartRef.current) {
      const days = getTimeRangeDays(range);
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const mockData = generateMockDataForDateRange(startDate, endDate);
      chartRef.current.applyNewData(mockData);

      if (mockData.length > 0) {
        const startDateStr = new Date(mockData[0].timestamp).toISOString().split('T')[0];
        const endDateStr = new Date(mockData[mockData.length - 1].timestamp).toISOString().split('T')[0];
        setDateRange({ start: startDateStr, end: endDateStr });
        setCustomStartDate(startDateStr);
        setCustomEndDate(endDateStr);
      }
    }
  };

  const handleCustomDateApply = () => {
    if (!customStartDate || !customEndDate) return;

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      alert('结束日期必须大于开始日期');
      return;
    }

    setDateRange({ start: customStartDate, end: customEndDate });
    setTimeRange('ALL');

    if (chartRef.current) {
      const mockData = generateMockDataForDateRange(start, end);
      chartRef.current.applyNewData(mockData);
    }

    setShowDatePicker(false);
  };

  useEffect(() => {
    if (showDatePicker && dateRange.start && dateRange.end) {
      setCustomStartDate(dateRange.start);
      setCustomEndDate(dateRange.end);
    }
  }, [showDatePicker, dateRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (indicatorMenuRef.current && !indicatorMenuRef.current.contains(event.target as Node)) {
        setShowIndicatorMenu(false);
      }
    };

    if (showDatePicker || showIndicatorMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showIndicatorMenu]);

  const toggleIndicator = (indicator: string) => {
    if (!chartRef.current) return;

    if (indicators.includes(indicator)) {
      chartRef.current.removeIndicator('candle_pane', indicator);
      setIndicators((prev) => prev.filter((i) => i !== indicator));
    } else {
      const isMainIndicator = mainIndicators.some(i => i.name === indicator);
      if (isMainIndicator) {
        chartRef.current.createIndicator(indicator, false, { id: 'candle_pane' });
      } else {
        chartRef.current.createIndicator(indicator);
      }
      setIndicators((prev) => [...prev, indicator]);
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

  const showTooltip = (text: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      text,
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  return (
    <div className="h-full w-full bg-[#0D0D0D] flex">
      {tooltip.show && (
        <div
          className="fixed z-[9999] bg-[#1A1A1A] border border-[#3A9FFF] text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="w-12 bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col items-center py-3 gap-1">
        <button
          onClick={() => handleDrawingTool('none')}
          onMouseEnter={(e) => showTooltip('选择工具', e)}
          onMouseLeave={hideTooltip}
          className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
            activeTool === 'none'
              ? 'bg-[#3A9FFF] text-white'
              : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="h-px w-8 bg-[#2A2A2A] my-1" />

        {drawingTools.slice(0, 9).map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => handleDrawingTool(tool)}
            onMouseEnter={(e) => showTooltip(label, e)}
            onMouseLeave={hideTooltip}
            className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
              activeTool === tool
                ? 'bg-[#3A9FFF] text-white'
                : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="h-px w-8 bg-[#2A2A2A] my-1" />

        {drawingTools.slice(9).map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => handleDrawingTool(tool)}
            onMouseEnter={(e) => showTooltip(label, e)}
            onMouseLeave={hideTooltip}
            className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
              activeTool === tool
                ? 'bg-[#3A9FFF] text-white'
                : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="h-px w-8 bg-[#2A2A2A] my-1" />

        <button
          onClick={clearAllOverlays}
          onMouseEnter={(e) => showTooltip('清除所有绘图', e)}
          onMouseLeave={hideTooltip}
          className="w-9 h-9 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-[#2A2A2A]">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-bold text-white">
                    {selectedStock?.symbol || 'AAPL'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {selectedStock?.name || 'Apple Inc.'}
                  </p>
                </div>
                <div className="h-5 w-px bg-[#2A2A2A]" />
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-mono font-bold text-white">
                    ${(hoveredPrice !== null ? hoveredPrice : (selectedStock?.price || 178.72)).toFixed(2)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      (hoveredChange !== null ? hoveredChange : (selectedStock?.change || 2.34)) >= 0
                        ? 'text-[#00D09C]'
                        : 'text-[#FF4976]'
                    }`}
                  >
                    {(hoveredChange !== null ? hoveredChange : (selectedStock?.change || 2.34)) >= 0 ? '+' : ''}
                    {(hoveredChange !== null ? hoveredChange : (selectedStock?.change || 2.34)).toFixed(2)}%
                  </span>
                  {hoveredDate && (
                    <span className="text-xs text-gray-500 ml-1">
                      {hoveredDate}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                className="text-gray-500 hover:text-white transition-colors"
                title={isHeaderExpanded ? '收起' : '展开'}
              >
                {isHeaderExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isHeaderExpanded && (
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between">
                <div></div>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={datePickerRef}>
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="px-2 py-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[10px] text-gray-400 hover:text-white hover:border-[#3A9FFF] transition-colors flex items-center gap-1"
                      title={`${dateRange.start} ~ ${dateRange.end}`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span className="hidden xl:inline">{dateRange.start.slice(5)} ~ {dateRange.end.slice(5)}</span>
                    </button>

                    {showDatePicker && (
                      <div className="absolute top-full left-0 mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl p-3 z-50 min-w-[280px]">
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">开始日期</label>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="w-full px-2 py-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded text-[11px] text-white focus:border-[#3A9FFF] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">结束日期</label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="w-full px-2 py-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded text-[11px] text-white focus:border-[#3A9FFF] focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleCustomDateApply}
                              className="flex-1 px-3 py-1.5 bg-[#3A9FFF] hover:bg-[#3A9FFF]/80 text-white text-[11px] font-medium rounded transition-colors"
                              title="应用自定义日期范围"
                            >
                              应用
                            </button>
                            <button
                              onClick={() => setShowDatePicker(false)}
                              className="flex-1 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-gray-300 text-[11px] font-medium rounded transition-colors"
                              title="取消自定义日期"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-0.5">
                    {(['1D', '5D', '1M', '3M', '6M', '1Y'] as TimeRange[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => handleTimeRangeChange(period)}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                          timeRange === period
                            ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]/50 border border-transparent'
                        }`}
                        title={`查看${period === '1D' ? '1天' : period === '5D' ? '5天' : period === '1M' ? '1个月' : period === '3M' ? '3个月' : period === '6M' ? '6个月' : '1年'}的数据`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  <div className="h-4 w-px bg-[#2A2A2A] mx-1" />

                  <div className="relative" ref={indicatorMenuRef}>
                    <button
                      onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
                      className="px-2 py-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[10px] text-gray-400 hover:text-white hover:border-[#3A9FFF] transition-colors flex items-center gap-1"
                      title="技术指标"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>指标</span>
                    </button>

                    {showIndicatorMenu && (
                      <div className="absolute top-full right-0 mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl p-3 z-50 min-w-[240px]">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-[10px] text-gray-500 mb-2 font-medium">主图指标</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                              {mainIndicators.map((indicator) => (
                                <button
                                  key={indicator.name}
                                  onClick={() => toggleIndicator(indicator.name)}
                                  className={`px-2 py-1.5 text-[10px] font-medium rounded transition-all text-left ${
                                    indicators.includes(indicator.name)
                                      ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                                      : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#2A2A2A] hover:border-[#3A3A3A]'
                                  }`}
                                  title={indicator.description}
                                >
                                  <div className="font-semibold">{indicator.label}</div>
                                  <div className="text-[9px] opacity-70">{indicator.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="h-px bg-[#2A2A2A]" />

                          <div>
                            <h3 className="text-[10px] text-gray-500 mb-2 font-medium">副图指标</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                              {subIndicators.map((indicator) => (
                                <button
                                  key={indicator.name}
                                  onClick={() => toggleIndicator(indicator.name)}
                                  className={`px-2 py-1.5 text-[10px] font-medium rounded transition-all text-left ${
                                    indicators.includes(indicator.name)
                                      ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                                      : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#2A2A2A] hover:border-[#3A3A3A]'
                                  }`}
                                  title={indicator.description}
                                >
                                  <div className="font-semibold">{indicator.label}</div>
                                  <div className="text-[9px] opacity-70">{indicator.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={chartContainerRef} className="flex-1 min-h-0" />
      </div>
    </div>
  );
}
