import { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
import { KLineChartData } from '../../types/chart';

interface KLineChartProps {
  data: KLineChartData;
  height?: number;
}

export function KLineChart({ data, height = 500 }: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

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
              upColor: '#26a69a',
              downColor: '#ef5350',
              upBorderColor: '#26a69a',
              downBorderColor: '#ef5350',
              upWickColor: '#26a69a',
              downWickColor: '#ef5350',
            },
          },
          technicalIndicator: {
            line: [
              { color: '#FF6B6B' },
              { color: '#4ECDC4' },
              { color: '#FFE66D' },
            ],
          },
        },
      });

      if (chart) {
        chartRef.current = chart;

        chart.createIndicator('MA', false, { id: 'candle_pane' });
        chart.createIndicator('VOL', true, { height: 80 });

        const resizeObserver = new ResizeObserver(() => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.resize();
          }
        });

        if (chartContainerRef.current) {
          resizeObserver.observe(chartContainerRef.current);
        }

        return () => {
          resizeObserver.disconnect();
        };
      }
    }

    return () => {
      if (chartRef.current) {
        dispose(chartContainerRef.current!);
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (data.candlestick && data.candlestick.length > 0) {
      const klineData: KLineData[] = data.candlestick.map((item) => ({
        timestamp: item.timestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume || 0,
      }));

      chartRef.current.applyNewData(klineData);
    }
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}
