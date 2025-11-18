import {
  LineChartData,
  VolumeChartData,
  KLineData,
  CandlestickData,
  KLineChartData,
  MALineData,
  ChartTabType,
} from '../types/chart';

function generatePseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateLineChartData(
  stockId: string,
  basePrice: number,
  days: number = 100
): LineChartData[] {
  const data: LineChartData[] = [];
  const seed = stockId.charCodeAt(0) * 1000;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    date.setHours(0, 0, 0, 0);

    const randomValue = generatePseudoRandom(seed + i);
    const volatility = basePrice * 0.15;
    const value = basePrice + (randomValue - 0.5) * volatility;

    data.push({
      timestamp: date.getTime(),
      value: Math.max(value, basePrice * 0.5),
    });
  }

  return data;
}

export function generateVolumeData(
  stockId: string,
  days: number = 100,
  baseVolume: number = 1000000
): VolumeChartData[] {
  const data: VolumeChartData[] = [];
  const seed = stockId.charCodeAt(0) * 2000;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    date.setHours(0, 0, 0, 0);

    const randomValue = generatePseudoRandom(seed + i);
    const volume = baseVolume * (0.5 + randomValue);

    data.push({
      timestamp: date.getTime(),
      value: Math.floor(volume),
      color: randomValue > 0.5 ? '#26a69a' : '#ef5350',
    });
  }

  return data;
}

function calculateMA(data: KLineData[], period: number): MALineData[] {
  const result: MALineData[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }

    result.push({
      timestamp: data[i].timestamp,
      value: sum / period,
    });
  }

  return result;
}

export function generateKLineData(
  stockId: string,
  basePrice: number,
  days: number = 100
): KLineChartData {
  const candlestick: KLineData[] = [];
  const volume: VolumeChartData[] = [];
  const seed = stockId.charCodeAt(0) * 3000;

  let lastClose = basePrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    date.setHours(0, 0, 0, 0);
    const timestamp = date.getTime();

    const random1 = generatePseudoRandom(seed + i * 3);
    const random2 = generatePseudoRandom(seed + i * 3 + 1);
    const random3 = generatePseudoRandom(seed + i * 3 + 2);
    const random4 = generatePseudoRandom(seed + i * 3 + 3);

    const changePercent = (random1 - 0.5) * 0.08;
    const open = lastClose * (1 + changePercent * 0.3);
    const close = lastClose * (1 + changePercent);

    const highOffset = Math.abs(random2 - 0.5) * 0.03;
    const lowOffset = Math.abs(random3 - 0.5) * 0.03;

    const high = Math.max(open, close) * (1 + highOffset);
    const low = Math.min(open, close) * (1 - lowOffset);

    const baseVolume = 1000000;
    const volumeValue = baseVolume * (0.5 + random4);

    candlestick.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(volumeValue),
    });

    volume.push({
      timestamp,
      value: Math.floor(volumeValue),
      color: close >= open ? '#26a69a' : '#ef5350',
    });

    lastClose = close;
  }

  const ma5 = calculateMA(candlestick, 5);
  const ma10 = calculateMA(candlestick, 10);
  const ma20 = calculateMA(candlestick, 20);

  return {
    candlestick,
    volume,
    ma5,
    ma10,
    ma20,
  };
}

export function generateKLineDataByType(
  type: ChartTabType,
  stockId: string = 'default',
  basePrice: number = 100
): KLineChartData {
  let seed = stockId.charCodeAt(0);
  let adjustedPrice = basePrice;

  switch (type) {
    case 'stock':
      adjustedPrice = basePrice;
      break;
    case 'industry':
      seed = seed * 2;
      adjustedPrice = basePrice * 0.95;
      break;
    case 'market':
      seed = seed * 3;
      adjustedPrice = 3000;
      break;
  }

  return generateKLineData(`${type}_${seed}`, adjustedPrice, 100);
}
