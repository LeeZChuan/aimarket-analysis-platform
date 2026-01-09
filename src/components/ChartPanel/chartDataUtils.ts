/**
 * 图表数据生成和转换工具函数
 *
 * 功能：
 * - 不同时间周期的数据转换（日线->周线->月线等）
 * - K线数据聚合计算
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表数据处理
 */

import type { KLineData } from 'klinecharts';
import { TimeRange } from './TimeRangeSelector';

/**
 * 聚合K线数据
 */
function aggregateKLineData(chunk: KLineData[]): KLineData {
  return {
    timestamp: chunk[0].timestamp,
    open: chunk[0].open,
    high: Math.max(...chunk.map(d => d.high)),
    low: Math.min(...chunk.map(d => d.low)),
    close: chunk[chunk.length - 1].close,
    volume: chunk.reduce((sum, d) => sum + d.volume, 0),
  };
}

/**
 * 转换K线数据到不同时间周期
 * @param dailyData 日线数据
 * @param period 目标周期
 * @returns 转换后的K线数据
 */
export function convertKLineData(dailyData: KLineData[], period: TimeRange): KLineData[] {
  if (period === '1D') {
    return dailyData;
  }

  const result: KLineData[] = [];

  if (period === '5D') {
    for (let i = 0; i < dailyData.length; i += 5) {
      const chunk = dailyData.slice(i, i + 5);
      if (chunk.length === 0) continue;
      result.push(aggregateKLineData(chunk));
    }
    return result;
  }

  if (period === '1W') {
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
          result.push(aggregateKLineData(currentWeek));
        }
        currentWeek = [item];
        currentWeekStart = weekStartTime;
      } else {
        currentWeek.push(item);
      }

      if (index === dailyData.length - 1 && currentWeek.length > 0) {
        result.push(aggregateKLineData(currentWeek));
      }
    });
    return result;
  }

  if (period === '1M') {
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
          result.push(aggregateKLineData(currentMonth));
        }
        currentMonth = [item];
        currentMonthKey = monthKey;
      } else {
        currentMonth.push(item);
      }

      if (index === dailyData.length - 1 && currentMonth.length > 0) {
        result.push(aggregateKLineData(currentMonth));
      }
    });
    return result;
  }

  if (period === '3M') {
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
          result.push(aggregateKLineData(currentQuarter));
        }
        currentQuarter = [item];
        currentQuarterKey = quarterKey;
      } else {
        currentQuarter.push(item);
      }

      if (index === dailyData.length - 1 && currentQuarter.length > 0) {
        result.push(aggregateKLineData(currentQuarter));
      }
    });
    return result;
  }

  if (period === '1Y') {
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
          result.push(aggregateKLineData(currentYear));
        }
        currentYear = [item];
        currentYearKey = year;
      } else {
        currentYear.push(item);
      }

      if (index === dailyData.length - 1 && currentYear.length > 0) {
        result.push(aggregateKLineData(currentYear));
      }
    });
    return result;
  }

  return result;
}
