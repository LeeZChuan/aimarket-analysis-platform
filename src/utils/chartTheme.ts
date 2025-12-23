/**
 * K线图主题配置工具
 *
 * 根据当前主题（dark/light）返回对应的klinecharts样式配置
 */

import type { Styles } from 'klinecharts';
import { Theme } from '../store/useThemeStore';

export function getChartThemeStyles(theme: Theme): Partial<Styles> {
  const isDark = theme === 'dark';

  return {
    grid: {
      horizontal: {
        color: isDark ? '#2A2A2A' : '#E5E5E5',
      },
      vertical: {
        color: isDark ? '#2A2A2A' : '#E5E5E5',
      },
    },
    candle: {
      type: 'candle_solid',
      bar: {
        upColor: '#00D09C',
        downColor: '#FF4976',
        upBorderColor: '#00D09C',
        downBorderColor: '#FF4976',
        upWickColor: '#00D09C',
        downWickColor: '#FF4976',
      },
      tooltip: {
        text: {
          color: isDark ? '#D9D9D9' : '#333333',
        },
      },
    },
    indicator: {
      tooltip: {
        text: {
          color: isDark ? '#D9D9D9' : '#333333',
        },
      },
    },
    xAxis: {
      axisLine: {
        color: isDark ? '#2A2A2A' : '#E5E5E5',
      },
      tickText: {
        color: isDark ? '#888888' : '#666666',
      },
      tickLine: {
        color: isDark ? '#2A2A2A' : '#E5E5E5',
      },
    },
    yAxis: {
      axisLine: {
        color: isDark ? '#2A2A2A' : '#E5E5E5',
      },
      tickText: {
        color: isDark ? '#888888' : '#666666',
      },
      tickLine: {
        color: isDark ? '#2A2A2A' : '#E5E5E5',
      },
    },
    separator: {
      color: isDark ? '#2A2A2A' : '#E5E5E5',
    },
    crosshair: {
      horizontal: {
        line: {
          color: isDark ? '#888888' : '#999999',
        },
        text: {
          backgroundColor: isDark ? '#333333' : '#666666',
          borderColor: isDark ? '#333333' : '#666666',
        },
      },
      vertical: {
        line: {
          color: isDark ? '#888888' : '#999999',
        },
        text: {
          backgroundColor: isDark ? '#333333' : '#666666',
          borderColor: isDark ? '#333333' : '#666666',
        },
      },
    },
  };
}
