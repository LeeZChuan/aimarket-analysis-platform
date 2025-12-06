/**
 * 折线图+成交量组合图表组件
 *
 * 功能：
 * - 上方区域展示面积折线图（价格走势）
 * - 下方区域展示成交量柱状图
 * - 渐变填充效果（蓝色主题）
 * - 双图表联动显示
 *
 * 使用位置：
 * - 目前未在主要页面使用（可作为独立组件使用）
 * - 适合日内分时图或简化版行情展示
 */

import { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, KLineData } from 'klinecharts';
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

      if (chart) {
        chartRef.current = chart;

        chart.createIndicator('VOL');

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
      if (chartRef.current && chartContainerRef.current) {
        dispose(chartContainerRef.current);
        chartRef.current = null;
      }
    };
  }, [height]);

  useEffect(() => {
    if (!chartRef.current || lineData.length === 0) return;

    const klineData: KLineData[] = lineData.map((item, index) => {
      const volume = volumeData[index]?.value || 0;
      return {
        timestamp: item.timestamp,
        open: item.value,
        high: item.value,
        low: item.value,
        close: item.value,
        volume,
      };
    });

    chartRef.current.applyNewData(klineData);
  }, [lineData, volumeData]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}
