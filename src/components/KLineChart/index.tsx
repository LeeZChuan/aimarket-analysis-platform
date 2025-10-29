import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { KLineChartData } from '../../types/chart';

interface KLineChartProps {
  data: KLineChartData;
  height?: number;
}

export function KLineChart({ data, height = 500 }: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ma5SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma10SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chartRef.current) {
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
        height: height,
        timeScale: {
          borderColor: '#2A2A2A',
          timeVisible: true,
        },
        rightPriceScale: {
          borderColor: '#2A2A2A',
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
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceScaleId: 'right',
      });

      candlestickSeriesRef.current = candlestickSeries;

      const ma5Series = chart.addSeries(LineSeries, {
        color: '#FF6B6B',
        lineWidth: 1,
        priceScaleId: 'right',
        lastValueVisible: false,
        priceLineVisible: false,
      });

      ma5SeriesRef.current = ma5Series;

      const ma10Series = chart.addSeries(LineSeries, {
        color: '#4ECDC4',
        lineWidth: 1,
        priceScaleId: 'right',
        lastValueVisible: false,
        priceLineVisible: false,
      });

      ma10SeriesRef.current = ma10Series;

      const ma20Series = chart.addSeries(LineSeries, {
        color: '#FFE66D',
        lineWidth: 1,
        priceScaleId: 'right',
        lastValueVisible: false,
        priceLineVisible: false,
      });

      ma20SeriesRef.current = ma20Series;

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      volumeSeriesRef.current = volumeSeries;

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      resizeObserverRef.current = new ResizeObserver(handleResize);
      if (chartContainerRef.current) {
        resizeObserverRef.current.observe(chartContainerRef.current);
      }
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
        ma5SeriesRef.current = null;
        ma10SeriesRef.current = null;
        ma20SeriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, [height]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    if (data.candlestick.length > 0) {
      candlestickSeriesRef.current.setData(data.candlestick);
    }

    if (data.volume.length > 0) {
      volumeSeriesRef.current.setData(data.volume);
    }

    if (ma5SeriesRef.current && data.ma5 && data.ma5.length > 0) {
      ma5SeriesRef.current.setData(data.ma5);
    }

    if (ma10SeriesRef.current && data.ma10 && data.ma10.length > 0) {
      ma10SeriesRef.current.setData(data.ma10);
    }

    if (ma20SeriesRef.current && data.ma20 && data.ma20.length > 0) {
      ma20SeriesRef.current.setData(data.ma20);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full" />;
}
