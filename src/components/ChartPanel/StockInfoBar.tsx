/**
 * 股票信息栏组件 (TradingView风格)
 *
 * 功能：
 * - 显示股票代码、周期、交易所
 * - 显示 OHLC 价格（开盘/最高/最低/收盘）
 * - 显示成交量
 * - 鼠标悬停时自动切换显示对应K线数据
 * - 涨跌幅颜色标识
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表顶部信息栏
 */

import type { KLineData } from 'klinecharts';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface StockInfoBarProps {
  stock?: Stock;
  timeRange: string;
  hoveredData: KLineData | null;
}

export function StockInfoBar({ stock, timeRange, hoveredData }: StockInfoBarProps) {
  const displayData = hoveredData || {
    open: stock?.price || 178.72,
    high: (stock?.price || 178.72) * 1.02,
    low: (stock?.price || 178.72) * 0.98,
    close: stock?.price || 178.72,
    volume: 42140000,
  };

  const basePrice = stock?.price || 178.72;
  const currentPrice = displayData.close;
  const priceChange = currentPrice - basePrice;
  const percentChange = (priceChange / basePrice) * 100;
  const isPositive = priceChange >= 0;

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#0D0D0D] border-b border-[#2A2A2A] transition-all duration-200">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-bold text-white">
          {stock?.symbol || 'AAPL'}
        </h1>
        <span className="text-xs text-gray-500">·</span>
        <span className="text-xs text-gray-400">{timeRange}</span>
        <span className="text-xs text-gray-500">·</span>
        <span className="text-xs text-gray-500">NASDAQ</span>
      </div>

      <div className="h-4 w-px bg-[#2A2A2A]" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">O</span>
          <span className="text-sm font-mono text-white">
            {displayData.open.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">H</span>
          <span className="text-sm font-mono text-white">
            {displayData.high.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">L</span>
          <span className="text-sm font-mono text-white">
            {displayData.low.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">C</span>
          <span className={`text-sm font-mono font-bold ${
            isPositive ? 'text-[#00D09C]' : 'text-[#FF4976]'
          }`}>
            {displayData.close.toFixed(2)}
          </span>
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
          isPositive
            ? 'bg-[#00D09C]/10 text-[#00D09C]'
            : 'bg-[#FF4976]/10 text-[#FF4976]'
        }`}>
          <span>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}
          </span>
          <span>
            ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="h-4 w-px bg-[#2A2A2A]" />

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500">Vol</span>
        <span className="text-sm font-mono text-white">
          {formatVolume(displayData.volume)}
        </span>
      </div>

      {hoveredData && (
        <div className="ml-auto">
          <div className="text-[10px] text-gray-500">
            {new Date(hoveredData.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      )}
    </div>
  );
}
