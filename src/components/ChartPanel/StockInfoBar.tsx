/**
 * 股票信息栏组件（简化版）
 *
 * 功能：
 * - 显示股票代码、周期、交易所
 * - 显示开盘价和收盘价
 * - 鼠标悬停时自动切换显示对应K线数据
 * - 收盘价涨跌颜色标识
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
    close: stock?.price || 178.72,
  };

  const basePrice = stock?.price || 178.72;
  const currentPrice = displayData.close;
  const isPositive = currentPrice >= basePrice;

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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">O</span>
          <span className="text-sm font-mono text-white">
            {displayData.open.toFixed(2)}
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
      </div>
    </div>
  );
}
