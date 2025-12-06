/**
 * 股票面积折线图组件
 *
 * 功能：
 * - 简洁的面积折线图展示
 * - 渐变填充背景（蓝色主题）
 * - 适合展示单一价格走势
 * - 自动处理时间戳转K线数据格式
 *
 * 使用位置：
 * - /views/TradingView/index.tsx - 股票列表中的迷你图表
 * - 适合作为股票卡片中的缩略图
 */

import { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';

interface LineData {
  timestamp: number;
  value: number;
}

interface StockLineChartProps {
  data: LineData[];
  height?: number;
}

export function StockLineChart({ data, height = 600 }: StockLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
          type: 'area',
          area: {
            lineSize: 2,
            lineColor: '#3A9FFF',
            value: 'close',
            backgroundColor: [
              {
                offset: 0,
                color: 'rgba(58, 159, 255, 0.01)',
              },
              {
                offset: 1,
                color: 'rgba(58, 159, 255, 0.2)',
              },
            ],
          },
        },
      },
    });

    chartRef.current = chart;

    const klineData: KLineData[] = data.map((item) => ({
      timestamp: item.timestamp,
      open: item.value,
      high: item.value,
      low: item.value,
      close: item.value,
      volume: 0,
    }));

    chart.applyNewData(klineData);

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
      if (chartContainerRef.current) {
        dispose(chartContainerRef.current);
      }
    };
  }, [data, height]);

  return <div ref={chartContainerRef} className="w-full" />;
}
