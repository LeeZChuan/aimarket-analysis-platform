import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, Time } from 'lightweight-charts';

interface LineData {
  time: Time;
  value: number;
}

interface StockLineChartProps {
  data: LineData[];
  height?: number;
}

export function StockLineChart({ data, height = 600 }: StockLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    const lineSeries = chart.addLineSeries({
      color: '#3A9FFF',
      lineWidth: 2,
    });

    lineSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, height]);

  return <div ref={chartContainerRef} className="w-full" />;
}
