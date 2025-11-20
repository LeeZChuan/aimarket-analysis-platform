import { useEffect, useRef, useState } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
import { useStore } from '../../store/useStore';
import {
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
  ChevronLeft,
  ChevronRight,
  Hash,
  MessageSquare,
  Tag,
} from 'lucide-react';

type TimeRange = '1D' | '5D' | '1W' | '1M' | '3M' | '1Y';

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
  | 'simpleAnnotation'
  | 'simpleTag'
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
  const { selectedStock } = useStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const indicatorIdsRef = useRef<Map<string, string>>(new Map());
  const [indicators, setIndicators] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredChange, setHoveredChange] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, text: '', x: 0, y: 0 });
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showHorizontalLineMenu, setShowHorizontalLineMenu] = useState(false);
  const [showVerticalLineMenu, setShowVerticalLineMenu] = useState(false);
  const [showGeneralLineMenu, setShowGeneralLineMenu] = useState(false);
  const [showPriceLineMenu, setShowPriceLineMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showAnnotationMenu, setShowAnnotationMenu] = useState(false);
  const [selectedHorizontalLine, setSelectedHorizontalLine] = useState<DrawingTool>('horizontalStraightLine');
  const [selectedVerticalLine, setSelectedVerticalLine] = useState<DrawingTool>('verticalStraightLine');
  const [selectedGeneralLine, setSelectedGeneralLine] = useState<DrawingTool>('straightLine');
  const [selectedPriceLine, setSelectedPriceLine] = useState<DrawingTool>('priceLine');
  const [selectedShape, setSelectedShape] = useState<DrawingTool>('rect');
  const [selectedAnnotation, setSelectedAnnotation] = useState<DrawingTool>('simpleAnnotation');
  const indicatorMenuRef = useRef<HTMLDivElement>(null);
  const horizontalLineMenuRef = useRef<HTMLDivElement>(null);
  const verticalLineMenuRef = useRef<HTMLDivElement>(null);
  const generalLineMenuRef = useRef<HTMLDivElement>(null);
  const priceLineMenuRef = useRef<HTMLDivElement>(null);
  const shapeMenuRef = useRef<HTMLDivElement>(null);
  const annotationMenuRef = useRef<HTMLDivElement>(null);

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

  const horizontalLineTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'horizontalStraightLine', icon: Minus, label: '水平直线' },
    { tool: 'horizontalRayLine', icon: ArrowRight, label: '水平射线' },
    { tool: 'horizontalSegment', icon: Minus, label: '水平线段' },
  ];

  const verticalLineTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'verticalStraightLine', icon: Minus, label: '垂直直线' },
    { tool: 'verticalRayLine', icon: ArrowRight, label: '垂直射线' },
    { tool: 'verticalSegment', icon: Minus, label: '垂直线段' },
  ];

  const generalLineTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'straightLine', icon: Minus, label: '直线' },
    { tool: 'rayLine', icon: ArrowRight, label: '射线' },
    { tool: 'segment', icon: Minus, label: '线段' },
  ];

  const priceLineTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'priceLine', icon: TrendingUp, label: '价格线' },
    { tool: 'priceChannelLine', icon: TrendingDown, label: '价格通道' },
    { tool: 'parallelStraightLine', icon: Minus, label: '平行线' },
  ];

  const shapeTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'rect', icon: Square, label: '矩形' },
    { tool: 'circle', icon: Circle, label: '圆形' },
    { tool: 'triangle', icon: Triangle, label: '三角形' },
  ];

  const annotationTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'simpleAnnotation', icon: MessageSquare, label: '注释' },
    { tool: 'simpleTag', icon: Tag, label: '标签' },
  ];

  const otherTools: { tool: DrawingTool; icon: any; label: string }[] = [
    { tool: 'fibonacciLine', icon: Activity, label: '斐波那契' },
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

        if (!indicatorIdsRef.current.has('VOL')) {
          const volId = chart.createIndicator('VOL', true);
          console.log('🎬 Initial VOL indicator created with ID:', volId);
          if (volId) {
            indicatorIdsRef.current.set('VOL', volId);
            setIndicators(['VOL']);
          }
        }

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

        const dailyData = generateMockData(1250);
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
  }, [selectedStock]);

  useEffect(() => {
    if (chartRef.current) {
      const resizeChart = () => {
        chartRef.current?.resize();
      };

      requestAnimationFrame(() => {
        resizeChart();
        setTimeout(resizeChart, 50);
        setTimeout(resizeChart, 150);
        setTimeout(resizeChart, 300);
      });
    }
  }, [isSidebarExpanded]);

  const generatePseudoRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateMockData = (days: number): KLineData[] => {
    const data: KLineData[] = [];
    let basePrice = selectedStock?.price || 150;
    const seed = (selectedStock?.id || 'default').charCodeAt(0) * 3000;
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    let lastClose = basePrice;
    let trendDirection = 1;
    let trendStrength = 0;
    let trendDuration = 0;
    let dayIndex = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const random1 = generatePseudoRandom(seed + dayIndex * 5);
      const random2 = generatePseudoRandom(seed + dayIndex * 5 + 1);
      const random3 = generatePseudoRandom(seed + dayIndex * 5 + 2);
      const random4 = generatePseudoRandom(seed + dayIndex * 5 + 3);
      const random5 = generatePseudoRandom(seed + dayIndex * 5 + 4);

      if (trendDuration === 0 || trendDuration > 30 + random5 * 40) {
        trendDirection = random1 > 0.5 ? 1 : -1;
        trendStrength = 0.3 + random2 * 0.7;
        trendDuration = 0;
      }
      trendDuration++;

      const trendChange = trendDirection * trendStrength * 0.003;
      const randomChange = (random1 - 0.5) * 0.04;
      const dailyChange = trendChange + randomChange;

      const open = lastClose * (1 + dailyChange * 0.2);
      const close = lastClose * (1 + dailyChange);

      const highOffset = Math.abs(random2 - 0.5) * 0.025;
      const lowOffset = Math.abs(random3 - 0.5) * 0.025;

      const high = Math.max(open, close) * (1 + highOffset);
      const low = Math.min(open, close) * (1 - lowOffset);

      const baseVolume = 2000000;
      const volatilityFactor = Math.abs(dailyChange) * 20;
      const volume = baseVolume * (0.3 + random4 * 0.7 + volatilityFactor);

      data.push({
        timestamp: date.getTime(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(volume),
      });

      lastClose = close;
      dayIndex++;
    }

    return data;
  };

  const convertKLineData = (dailyData: KLineData[], period: TimeRange): KLineData[] => {
    if (period === '1D') {
      return dailyData;
    }

    const result: KLineData[] = [];

    if (period === '5D') {
      for (let i = 0; i < dailyData.length; i += 5) {
        const chunk = dailyData.slice(i, i + 5);
        if (chunk.length === 0) continue;

        result.push({
          timestamp: chunk[0].timestamp,
          open: chunk[0].open,
          high: Math.max(...chunk.map(d => d.high)),
          low: Math.min(...chunk.map(d => d.low)),
          close: chunk[chunk.length - 1].close,
          volume: chunk.reduce((sum, d) => sum + d.volume, 0),
        });
      }
    } else if (period === '1W') {
      let currentWeek: KLineData[] = [];
      let currentWeekStart: number | null = null;

      dailyData.forEach((item, index) => {
        const itemDate = new Date(item.timestamp);
        const weekStart = new Date(itemDate);
        weekStart.setDate(itemDate.getDate() - itemDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekStartTime = weekStart.getTime();

        if (currentWeekStart === null) {
          currentWeekStart = weekStartTime;
        }

        if (weekStartTime !== currentWeekStart) {
          if (currentWeek.length > 0) {
            result.push({
              timestamp: currentWeek[0].timestamp,
              open: currentWeek[0].open,
              high: Math.max(...currentWeek.map(d => d.high)),
              low: Math.min(...currentWeek.map(d => d.low)),
              close: currentWeek[currentWeek.length - 1].close,
              volume: currentWeek.reduce((sum, d) => sum + d.volume, 0),
            });
          }
          currentWeek = [item];
          currentWeekStart = weekStartTime;
        } else {
          currentWeek.push(item);
        }

        if (index === dailyData.length - 1 && currentWeek.length > 0) {
          result.push({
            timestamp: currentWeek[0].timestamp,
            open: currentWeek[0].open,
            high: Math.max(...currentWeek.map(d => d.high)),
            low: Math.min(...currentWeek.map(d => d.low)),
            close: currentWeek[currentWeek.length - 1].close,
            volume: currentWeek.reduce((sum, d) => sum + d.volume, 0),
          });
        }
      });
    } else if (period === '1M') {
      let currentMonth: KLineData[] = [];
      let currentMonthKey: string | null = null;

      dailyData.forEach((item, index) => {
        const itemDate = new Date(item.timestamp);
        const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;

        if (currentMonthKey === null) {
          currentMonthKey = monthKey;
        }

        if (monthKey !== currentMonthKey) {
          if (currentMonth.length > 0) {
            result.push({
              timestamp: currentMonth[0].timestamp,
              open: currentMonth[0].open,
              high: Math.max(...currentMonth.map(d => d.high)),
              low: Math.min(...currentMonth.map(d => d.low)),
              close: currentMonth[currentMonth.length - 1].close,
              volume: currentMonth.reduce((sum, d) => sum + d.volume, 0),
            });
          }
          currentMonth = [item];
          currentMonthKey = monthKey;
        } else {
          currentMonth.push(item);
        }

        if (index === dailyData.length - 1 && currentMonth.length > 0) {
          result.push({
            timestamp: currentMonth[0].timestamp,
            open: currentMonth[0].open,
            high: Math.max(...currentMonth.map(d => d.high)),
            low: Math.min(...currentMonth.map(d => d.low)),
            close: currentMonth[currentMonth.length - 1].close,
            volume: currentMonth.reduce((sum, d) => sum + d.volume, 0),
          });
        }
      });
    } else if (period === '3M') {
      let currentQuarter: KLineData[] = [];
      let currentQuarterKey: string | null = null;

      dailyData.forEach((item, index) => {
        const itemDate = new Date(item.timestamp);
        const quarter = Math.floor(itemDate.getMonth() / 3);
        const quarterKey = `${itemDate.getFullYear()}-Q${quarter}`;

        if (currentQuarterKey === null) {
          currentQuarterKey = quarterKey;
        }

        if (quarterKey !== currentQuarterKey) {
          if (currentQuarter.length > 0) {
            result.push({
              timestamp: currentQuarter[0].timestamp,
              open: currentQuarter[0].open,
              high: Math.max(...currentQuarter.map(d => d.high)),
              low: Math.min(...currentQuarter.map(d => d.low)),
              close: currentQuarter[currentQuarter.length - 1].close,
              volume: currentQuarter.reduce((sum, d) => sum + d.volume, 0),
            });
          }
          currentQuarter = [item];
          currentQuarterKey = quarterKey;
        } else {
          currentQuarter.push(item);
        }

        if (index === dailyData.length - 1 && currentQuarter.length > 0) {
          result.push({
            timestamp: currentQuarter[0].timestamp,
            open: currentQuarter[0].open,
            high: Math.max(...currentQuarter.map(d => d.high)),
            low: Math.min(...currentQuarter.map(d => d.low)),
            close: currentQuarter[currentQuarter.length - 1].close,
            volume: currentQuarter.reduce((sum, d) => sum + d.volume, 0),
          });
        }
      });
    } else if (period === '1Y') {
      let currentYear: KLineData[] = [];
      let currentYearKey: number | null = null;

      dailyData.forEach((item, index) => {
        const itemDate = new Date(item.timestamp);
        const year = itemDate.getFullYear();

        if (currentYearKey === null) {
          currentYearKey = year;
        }

        if (year !== currentYearKey) {
          if (currentYear.length > 0) {
            result.push({
              timestamp: currentYear[0].timestamp,
              open: currentYear[0].open,
              high: Math.max(...currentYear.map(d => d.high)),
              low: Math.min(...currentYear.map(d => d.low)),
              close: currentYear[currentYear.length - 1].close,
              volume: currentYear.reduce((sum, d) => sum + d.volume, 0),
            });
          }
          currentYear = [item];
          currentYearKey = year;
        } else {
          currentYear.push(item);
        }

        if (index === dailyData.length - 1 && currentYear.length > 0) {
          result.push({
            timestamp: currentYear[0].timestamp,
            open: currentYear[0].open,
            high: Math.max(...currentYear.map(d => d.high)),
            low: Math.min(...currentYear.map(d => d.low)),
            close: currentYear[currentYear.length - 1].close,
            volume: currentYear.reduce((sum, d) => sum + d.volume, 0),
          });
        }
      });
    }

    return result;
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    if (timeRange === range) return;

    setTimeRange(range);

    if (chartRef.current) {
      const dailyData = generateMockData(1250);
      const convertedData = convertKLineData(dailyData, range);
      chartRef.current.applyNewData(convertedData);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (indicatorMenuRef.current && !indicatorMenuRef.current.contains(event.target as Node)) {
        setShowIndicatorMenu(false);
      }
      if (horizontalLineMenuRef.current && !horizontalLineMenuRef.current.contains(event.target as Node)) {
        setShowHorizontalLineMenu(false);
      }
      if (verticalLineMenuRef.current && !verticalLineMenuRef.current.contains(event.target as Node)) {
        setShowVerticalLineMenu(false);
      }
      if (generalLineMenuRef.current && !generalLineMenuRef.current.contains(event.target as Node)) {
        setShowGeneralLineMenu(false);
      }
      if (priceLineMenuRef.current && !priceLineMenuRef.current.contains(event.target as Node)) {
        setShowPriceLineMenu(false);
      }
      if (shapeMenuRef.current && !shapeMenuRef.current.contains(event.target as Node)) {
        setShowShapeMenu(false);
      }
      if (annotationMenuRef.current && !annotationMenuRef.current.contains(event.target as Node)) {
        setShowAnnotationMenu(false);
      }
    };

    if (showIndicatorMenu || showHorizontalLineMenu || showVerticalLineMenu ||
        showGeneralLineMenu || showPriceLineMenu || showShapeMenu || showAnnotationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIndicatorMenu, showHorizontalLineMenu, showVerticalLineMenu,
      showGeneralLineMenu, showPriceLineMenu, showShapeMenu, showAnnotationMenu]);

  const toggleIndicator = (indicator: string) => {
    if (!chartRef.current) return;

    const isMainIndicator = mainIndicators.some(i => i.name === indicator);

    if (indicators.includes(indicator)) {
      console.log('🔍 Removing indicator:', indicator);
      console.log('📊 Current indicators:', Array.from(indicatorIdsRef.current.entries()));

      if (isMainIndicator) {
        chartRef.current.removeIndicator('candle_pane', indicator);
        console.log('✅ Removed from main pane:', indicator);
      } else {
        const allPanes = chartRef.current.getPanes();
        allPanes.forEach(pane => {
          if (pane.id !== 'candle_pane') {
            chartRef.current!.removeIndicator(pane.id, indicator);
            console.log('✅ Removed from pane:', pane.id, indicator);
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
      console.log('➕ Created indicator:', indicator, 'with ID:', indicatorId);

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

  const handleToolSelect = (
    tool: DrawingTool,
    setter: React.Dispatch<React.SetStateAction<DrawingTool>>,
    menuSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(tool);
    handleDrawingTool(tool);
    menuSetter(false);
  };

  const clearAllOverlays = () => {
    if (!chartRef.current) return;
    chartRef.current.removeOverlay();
    setActiveTool('none');
  };

  const renderToolButton = (
    tools: { tool: DrawingTool; icon: any; label: string }[],
    selectedTool: DrawingTool,
    showMenu: boolean,
    setShowMenu: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedTool: React.Dispatch<React.SetStateAction<DrawingTool>>,
    menuRef: React.RefObject<HTMLDivElement>,
    tooltipText: string
  ) => {
    const currentTool = tools.find(t => t.tool === selectedTool);
    const Icon = currentTool?.icon || Minus;
    const isActive = tools.some(t => t.tool === activeTool);

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          onMouseEnter={(e) => showTooltip(currentTool?.label || tooltipText, e)}
          onMouseLeave={hideTooltip}
          className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
            isActive ? 'bg-[#3A9FFF] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <div className="flex items-center gap-0.5">
            <Icon className="w-3.5 h-3.5" />
            <ChevronRight className="w-2 h-2" />
          </div>
        </button>

        {showMenu && (
          <div className="absolute left-full top-0 ml-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl py-1 z-50 min-w-[120px]">
            {tools.map(({ tool, icon: ToolIcon, label }) => (
              <button
                key={tool}
                onClick={() => handleToolSelect(tool, setSelectedTool, setShowMenu)}
                className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
                  selectedTool === tool
                    ? 'bg-[#3A9FFF]/20 text-[#3A9FFF]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <ToolIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
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

      <div className="relative flex">
        <div
          className={`bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col items-center py-3 gap-1 transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? 'w-12 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <button
            onClick={() => setIsSidebarExpanded(false)}
            onMouseEnter={(e) => showTooltip('收起工具栏', e)}
            onMouseLeave={hideTooltip}
            className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A9FFF] hover:bg-[#2A2A2A] transition-all flex items-center justify-center group"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-[#3A9FFF] transition-colors" />
          </button>

          {isSidebarExpanded && (
          <>
            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            {renderToolButton(
              horizontalLineTools,
              selectedHorizontalLine,
              showHorizontalLineMenu,
              setShowHorizontalLineMenu,
              setSelectedHorizontalLine,
              horizontalLineMenuRef,
              '水平线工具'
            )}

            {renderToolButton(
              verticalLineTools,
              selectedVerticalLine,
              showVerticalLineMenu,
              setShowVerticalLineMenu,
              setSelectedVerticalLine,
              verticalLineMenuRef,
              '垂直线工具'
            )}

            {renderToolButton(
              generalLineTools,
              selectedGeneralLine,
              showGeneralLineMenu,
              setShowGeneralLineMenu,
              setSelectedGeneralLine,
              generalLineMenuRef,
              '线条工具'
            )}

            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            {renderToolButton(
              priceLineTools,
              selectedPriceLine,
              showPriceLineMenu,
              setShowPriceLineMenu,
              setSelectedPriceLine,
              priceLineMenuRef,
              '价格线工具'
            )}

            {otherTools.map(({ tool, icon: Icon, label }) => (
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

            {renderToolButton(
              shapeTools,
              selectedShape,
              showShapeMenu,
              setShowShapeMenu,
              setSelectedShape,
              shapeMenuRef,
              '形状工具'
            )}

            {renderToolButton(
              annotationTools,
              selectedAnnotation,
              showAnnotationMenu,
              setShowAnnotationMenu,
              setSelectedAnnotation,
              annotationMenuRef,
              '标注工具'
            )}

            <div className="h-px w-8 bg-[#2A2A2A] my-1" />

            <button
              onClick={clearAllOverlays}
              onMouseEnter={(e) => showTooltip('清除所有绘图', e)}
              onMouseLeave={hideTooltip}
              className="w-9 h-9 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-[#1A1A1A] transition-colors"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </>
          )}
        </div>

        {!isSidebarExpanded && (
          <button
            onClick={() => setIsSidebarExpanded(true)}
            onMouseEnter={(e) => showTooltip('展开工具栏', e)}
            onMouseLeave={hideTooltip}
            className="absolute left-0 top-3 w-5 h-10 bg-[#1A1A1A] border border-[#2A2A2A] border-l-0 rounded-r-full hover:border-[#3A9FFF] hover:bg-[#2A2A2A] transition-all flex items-center justify-center group z-10"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3A9FFF] transition-colors" />
          </button>
        )}
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
                  <div className="flex gap-0.5">
                    {(['1D', '5D', '1W', '1M', '3M', '1Y'] as TimeRange[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => handleTimeRangeChange(period)}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                          timeRange === period
                            ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]/50 border border-transparent'
                        }`}
                        title={`查看${period === '1D' ? '日线' : period === '5D' ? '5日线' : period === '1W' ? '周线' : period === '1M' ? '月线' : period === '3M' ? '季线' : '年线'}`}
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
