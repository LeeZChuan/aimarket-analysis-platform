import type { Styles } from 'klinecharts';
import { Theme } from '../store/useThemeStore';

const getCSSVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function getChartThemeStyles(theme: Theme): Partial<Styles> {
  const grid = getCSSVar('--chart-grid');
  const candleUp = getCSSVar('--chart-candle-up');
  const candleDown = getCSSVar('--chart-candle-down');
  const textSecondary = getCSSVar('--text-secondary');
  const textTertiary = getCSSVar('--text-tertiary');
  const bgTertiary = getCSSVar('--bg-tertiary');

  return {
    grid: {
      horizontal: { color: grid },
      vertical:   { color: grid },
    },
    candle: {
      type: 'candle_solid',
      bar: {
        upColor:        candleUp,
        downColor:      candleDown,
        upBorderColor:  candleUp,
        downBorderColor:candleDown,
        upWickColor:    candleUp,
        downWickColor:  candleDown,
      },
      tooltip: {
        text: { color: textSecondary },
      },
    },
    indicator: {
      tooltip: {
        text: { color: textSecondary },
      },
    },
    xAxis: {
      axisLine: { color: grid },
      tickText: { color: textTertiary },
      tickLine: { color: grid },
    },
    yAxis: {
      axisLine: { color: grid },
      tickText: { color: textTertiary },
      tickLine: { color: grid },
    },
    separator: { color: grid },
    crosshair: {
      horizontal: {
        line: { color: textTertiary },
        text: { backgroundColor: bgTertiary, borderColor: bgTertiary },
      },
      vertical: {
        line: { color: textTertiary },
        text: { backgroundColor: bgTertiary, borderColor: bgTertiary },
      },
    },
  };
}


