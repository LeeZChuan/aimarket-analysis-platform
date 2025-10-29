import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { LineChartData, VolumeChartData } from '../../types/chart';

interface LineVolumeChartProps {
  lineData: LineChartData[];
  volumeData: VolumeChartData[];
  height?: number;
}

export function LineVolumeChart({
  lineData,
  volumeData,
  height = 400,
}: LineVolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
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

      const lineSeries = chart.addSeries(LineSeries, {
        color: '#3A9FFF',
        lineWidth: 2,
        priceScaleId: 'right',
      });

      lineSeriesRef.current = lineSeries;

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
        lineSeriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, [height]);

  useEffect(() => {
    if (lineSeriesRef.current && lineData.length > 0) {
      lineSeriesRef.current.setData(lineData);
    }
  }, [lineData]);

  useEffect(() => {
    if (volumeSeriesRef.current && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData);
    }
  }, [volumeData]);

  return <div ref={chartContainerRef} className="w-full" />;
}
