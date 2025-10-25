import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries, ISeriesApi, Time, IChartApi, LineData, HistogramData } from 'lightweight-charts';
import { useStore } from '../store/useStore';
import { Calendar, TrendingUp } from 'lucide-react';

type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function ChartPanel() {
  const { selectedStock, dateRange, setDateRange } = useStore();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const subChartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const subChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const macdLineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdHistogramRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const [indicators, setIndicators] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredChange, setHoveredChange] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !subChartContainerRef.current) return;

    // 创建主图（K线图）
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0D0D0D' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#1A1A1A' },
        horzLines: { color: '#1A1A1A' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#2A2A2A',
        timeVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      rightPriceScale: {
        borderColor: '#2A2A2A',
        autoScale: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#3A9FFF',
          style: 0,
          labelBackgroundColor: '#3A9FFF',
        },
        horzLine: {
          width: 1,
          color: '#3A9FFF',
          style: 0,
          labelBackgroundColor: '#3A9FFF',
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00D09C',
      downColor: '#FF4976',
      borderUpColor: '#00D09C',
      borderDownColor: '#FF4976',
      wickUpColor: '#00D09C',
      wickDownColor: '#FF4976',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // 创建副图（MACD指标）
    const subChart = createChart(subChartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0D0D0D' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#1A1A1A' },
        horzLines: { color: '#1A1A1A' },
      },
      width: subChartContainerRef.current.clientWidth,
      height: subChartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#2A2A2A',
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      rightPriceScale: {
        borderColor: '#2A2A2A',
        autoScale: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#3A9FFF',
          style: 0,
          labelBackgroundColor: '#3A9FFF',
        },
        horzLine: {
          width: 1,
          color: '#3A9FFF',
          style: 0,
          labelBackgroundColor: '#3A9FFF',
        },
      },
    });

    subChartRef.current = subChart;

    // MACD柱状图
    const macdHistogram = subChart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'price',
        precision: 4,
        minMove: 0.0001,
      },
    });
    macdHistogramRef.current = macdHistogram;

    // MACD DIF线
    const macdLine = subChart.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 2,
      title: 'DIF',
    });
    macdLineRef.current = macdLine;

    // MACD DEA信号线
    const macdSignal = subChart.addSeries(LineSeries, {
      color: '#FF6D00',
      lineWidth: 2,
      title: 'DEA',
    });
    macdSignalRef.current = macdSignal;

    // 同步十字线
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.get(candlestickSeries)) {
        setHoveredPrice(null);
        setHoveredChange(null);
        setHoveredDate(null);
        subChart.clearCrosshairPosition();
        return;
      }

      const data = param.seriesData.get(candlestickSeries) as any;
      if (data) {
        const currentPrice = data.close;
        const basePrice = selectedStock?.price || 178.72;
        const change = ((currentPrice - basePrice) / basePrice) * 100;

        setHoveredPrice(currentPrice);
        setHoveredChange(change);
        setHoveredDate(param.time as string);

        // 同步副图十字线位置
        subChart.setCrosshairPosition(0, param.time as any, macdHistogram);
      }
    });

    subChart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        chart.clearCrosshairPosition();
        return;
      }

      // 同步主图十字线位置
      chart.setCrosshairPosition(0, param.time as any, candlestickSeries);
    });

    const generateMockData = (days: number) => {
      const data = [];
      let basePrice = selectedStock?.price || 150;
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const volatility = basePrice * 0.02;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        data.push({
          time: date.toISOString().split('T')[0] as Time,
          open,
          high,
          low,
          close,
        });

        basePrice = close;
      }

      return data;
    };

    const days = getTimeRangeDays(timeRange);
    const mockData = generateMockData(days);
    candlestickSeries.setData(mockData);
    setChartData(mockData);

    // 计算并设置MACD数据
    const macdData = calculateMACDValues(mockData);
    if (macdData.histogram.length > 0) {
      macdHistogram.setData(macdData.histogram);
      macdLine.setData(macdData.macd);
      macdSignal.setData(macdData.signal);
    }

    // 数据加载完成后再设置时间轴同步
    let isMainChartSyncing = false;
    let isSubChartSyncing = false;

    chart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
      if (!timeRange || isSubChartSyncing) return;
      try {
        isMainChartSyncing = true;
        subChart.timeScale().setVisibleRange(timeRange as any);
      } catch (e) {
        // 忽略同步错误
      } finally {
        isMainChartSyncing = false;
      }
    });

    subChart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
      if (!timeRange || isMainChartSyncing) return;
      try {
        isSubChartSyncing = true;
        chart.timeScale().setVisibleRange(timeRange as any);
      } catch (e) {
        // 忽略同步错误
      } finally {
        isSubChartSyncing = false;
      }
    });

    if (mockData.length > 0 && !dateRange.start) {
      const startDate = mockData[0].time as string;
      const endDate = mockData[mockData.length - 1].time as string;
      setDateRange({ start: startDate, end: endDate });
      setCustomStartDate(startDate);
      setCustomEndDate(endDate);
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
      if (subChartContainerRef.current && subChartRef.current) {
        subChartRef.current.applyOptions({
          width: subChartContainerRef.current.clientWidth,
          height: subChartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      subChart.remove();
      indicatorSeriesRef.current.clear();
    };
  }, [selectedStock, timeRange]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    const chart = chartRef.current;
    const currentIndicators = indicatorSeriesRef.current;

    indicators.forEach((indicator) => {
      if (!currentIndicators.has(indicator)) {
        const lineSeries = chart.addSeries(LineSeries, {
          color: getIndicatorColor(indicator),
          lineWidth: 2,
          title: indicator,
        });
        currentIndicators.set(indicator, lineSeries);

        const indicatorData = calculateIndicator(indicator, chartData);
        lineSeries.setData(indicatorData);
      }
    });

    Array.from(currentIndicators.keys()).forEach((indicator) => {
      if (!indicators.includes(indicator)) {
        const series = currentIndicators.get(indicator);
        if (series) {
          chart.removeSeries(series);
          currentIndicators.delete(indicator);
        }
      }
    });
  }, [indicators, chartData]);

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

  const handleTimeRangeChange = (range: TimeRange) => {
    if (timeRange === range) {
      return;
    }

    setTimeRange(range);
    setShowDatePicker(false);

    if (candlestickSeriesRef.current) {
      const days = getTimeRangeDays(range);
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const mockData = generateMockDataForDateRange(startDate, endDate);
      candlestickSeriesRef.current.setData(mockData);
      setChartData(mockData);

      // 更新MACD数据
      if (macdLineRef.current && macdSignalRef.current && macdHistogramRef.current) {
        const macdData = calculateMACDValues(mockData);
        if (macdData.histogram.length > 0) {
          macdHistogramRef.current.setData(macdData.histogram);
          macdLineRef.current.setData(macdData.macd);
          macdSignalRef.current.setData(macdData.signal);
        }
      }

      const startDateStr = mockData[0].time as string;
      const endDateStr = mockData[mockData.length - 1].time as string;
      setDateRange({ start: startDateStr, end: endDateStr });
      setCustomStartDate(startDateStr);
      setCustomEndDate(endDateStr);

      indicatorSeriesRef.current.forEach((series) => {
        if (chartRef.current) {
          chartRef.current.removeSeries(series);
        }
      });
      indicatorSeriesRef.current.clear();
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

    if (candlestickSeriesRef.current) {
      const mockData = generateMockDataForDateRange(start, end);
      candlestickSeriesRef.current.setData(mockData);
      setChartData(mockData);

      // 更新MACD数据
      if (macdLineRef.current && macdSignalRef.current && macdHistogramRef.current) {
        const macdData = calculateMACDValues(mockData);
        if (macdData.histogram.length > 0) {
          macdHistogramRef.current.setData(macdData.histogram);
          macdLineRef.current.setData(macdData.macd);
          macdSignalRef.current.setData(macdData.signal);
        }
      }

      indicatorSeriesRef.current.forEach((series) => {
        if (chartRef.current) {
          chartRef.current.removeSeries(series);
        }
      });
      indicatorSeriesRef.current.clear();
    }

    setShowDatePicker(false);
  };

  const generateMockDataForDateRange = (startDate: Date, endDate: Date) => {
    const data = [];
    let basePrice = selectedStock?.price || 150;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * basePrice * volatility;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);

        data.push({
          time: currentDate.toISOString().split('T')[0] as Time,
          open,
          high,
          low,
          close,
        });

        basePrice = close;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
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
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const toggleIndicator = (indicator: string) => {
    setIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  const getIndicatorColor = (indicator: string): string => {
    const colors: Record<string, string> = {
      'MA': '#FFB800',
      'MACD': '#00D09C',
      'RSI': '#FF4976',
      'KDJ': '#3A9FFF',
      'BOLL': '#A855F7',
    };
    return colors[indicator] || '#FFFFFF';
  };

  const calculateIndicator = (indicator: string, data: CandleData[]): LineData[] => {
    switch (indicator) {
      case 'MA':
        return calculateMA(data, 20);
      case 'MACD':
        return calculateMACD(data);
      case 'RSI':
        return calculateRSI(data, 14);
      case 'KDJ':
        return calculateKDJ(data);
      case 'BOLL':
        return calculateBOLL(data, 20);
      default:
        return [];
    }
  };

  const calculateMA = (data: CandleData[], period: number): LineData[] => {
    const result: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      result.push({
        time: data[i].time,
        value: sum / period,
      });
    }
    return result;
  };

  const calculateMACD = (data: CandleData[]): LineData[] => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const result: LineData[] = [];

    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      result.push({
        time: data[i + 26 - 1].time,
        value: ema12[i] - ema26[i],
      });
    }
    return result;
  };

  const calculateEMA = (data: CandleData[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    ema[0] = data[0].close;

    for (let i = 1; i < data.length; i++) {
      ema[i] = data[i].close * k + ema[i - 1] * (1 - k);
    }
    return ema.slice(period - 1);
  };

  const calculateRSI = (data: CandleData[], period: number): LineData[] => {
    const result: LineData[] = [];

    for (let i = period; i < data.length; i++) {
      let gains = 0;
      let losses = 0;

      for (let j = i - period; j < i; j++) {
        const change = data[j + 1].close - data[j].close;
        if (change > 0) gains += change;
        else losses -= change;
      }

      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      result.push({
        time: data[i].time,
        value: rsi,
      });
    }
    return result;
  };

  const calculateKDJ = (data: CandleData[]): LineData[] => {
    const period = 9;
    const result: LineData[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const low = Math.min(...slice.map(d => d.low));
      const high = Math.max(...slice.map(d => d.high));
      const close = data[i].close;

      const rsv = high === low ? 50 : ((close - low) / (high - low)) * 100;

      result.push({
        time: data[i].time,
        value: rsv,
      });
    }
    return result;
  };

  const calculateBOLL = (data: CandleData[], period: number): LineData[] => {
    const ma = calculateMA(data, period);
    const result: LineData[] = [];

    for (let i = 0; i < ma.length; i++) {
      const dataIndex = i + period - 1;
      result.push({
        time: ma[i].time,
        value: ma[i].value,
      });
    }
    return result;
  };

  const calculateMACDValues = (data: CandleData[]): {
    macd: LineData[];
    signal: LineData[];
    histogram: HistogramData[];
  } => {
    if (data.length < 34) {
      return { macd: [], signal: [], histogram: [] };
    }

    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);

    if (ema12.length === 0 || ema26.length === 0) {
      return { macd: [], signal: [], histogram: [] };
    }

    const macdLine: number[] = [];
    const minLength = Math.min(ema12.length, ema26.length);

    for (let i = 0; i < minLength; i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }

    if (macdLine.length < 9) {
      return { macd: [], signal: [], histogram: [] };
    }

    const signalLine = calculateEMAFromArray(macdLine, 9);

    const macd: LineData[] = [];
    const signal: LineData[] = [];
    const histogram: HistogramData[] = [];

    const ema26StartIndex = 26 - 1;
    const signalStartIndex = 9 - 1;

    for (let i = 0; i < signalLine.length; i++) {
      const dataIndex = ema26StartIndex + signalStartIndex + i;

      if (dataIndex >= data.length) break;

      const time = data[dataIndex].time;
      const macdValue = macdLine[signalStartIndex + i];
      const signalValue = signalLine[i];
      const histValue = macdValue - signalValue;

      macd.push({ time, value: macdValue });
      signal.push({ time, value: signalValue });
      histogram.push({
        time,
        value: histValue,
        color: histValue >= 0 ? '#26a69a' : '#ef5350',
      });
    }

    return { macd, signal, histogram };
  };

  const calculateEMAFromArray = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    ema[0] = data[0];

    for (let i = 1; i < data.length; i++) {
      ema[i] = data[i] * k + ema[i - 1] * (1 - k);
    }
    return ema.slice(period - 1);
  };

  return (
    <div className="flex-1 bg-[#0D0D0D] flex flex-col">
      <div className="border-b border-[#2A2A2A] px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
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
        </div>

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
                      >
                        应用
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-gray-300 text-[11px] font-medium rounded transition-colors"
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
                >
                  {period}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[#2A2A2A] mx-1" />

            <div className="flex gap-0.5">
              {['MA', 'MACD', 'RSI', 'KDJ', 'BOLL'].map((indicator) => (
                <button
                  key={indicator}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                    indicators.includes(indicator)
                      ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                      : 'bg-[#1A1A1A] text-gray-500 hover:text-gray-300 border border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}
                  onClick={() => toggleIndicator(indicator)}
                >
                  {indicator}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div ref={chartContainerRef} className="flex-[2]" />
        <div className="h-px bg-[#2A2A2A]" />
        <div ref={subChartContainerRef} className="flex-1" />
      </div>
    </div>
  );
}
