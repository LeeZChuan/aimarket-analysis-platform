/**
 * 图表数据生成和转换工具函数
 *
 * 功能：
 * - 生成模拟K线数据（基于伪随机算法）
 * - 不同时间周期的数据转换（日线->周线->月线等）
 * - K线数据聚合计算
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表数据处理
 */

import type { KLineData } from 'klinecharts';
import { TimeRange } from './TimeRangeSelector';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

/**
 * 生成伪随机数
 */
function generatePseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 生成模拟K线数据
 * @param days 生成天数
 * @param stock 股票信息
 * @returns K线数据数组
 */
export function generateMockData(days: number, stock?: Stock): KLineData[] {
  const data: KLineData[] = [];
  const basePrice = stock?.price || 150;
  const seed = (stock?.symbol || 'default').charCodeAt(0) * 3000;
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
}

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
