/**
 * 图表头部组件
 *
 * 功能：
 * - 显示股票代码和名称
 * - 显示当前价格（支持鼠标悬停时的动态价格）
 * - 显示涨跌幅（带颜色区分）
 * - 显示选中日期（鼠标悬停时）
 * - 可折叠展开头部控制区域
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表顶部信息栏
 */

import { ChevronUp, ChevronDown } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface ChartHeaderProps {
  stock?: Stock;
  hoveredPrice: number | null;
  hoveredChange: number | null;
  hoveredDate: string | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  children?: React.ReactNode;
}

export function ChartHeader({
  stock,
  hoveredPrice,
  hoveredChange,
  hoveredDate,
  isExpanded,
  onToggleExpand,
  children,
}: ChartHeaderProps) {
  const displayPrice = hoveredPrice !== null ? hoveredPrice : (stock?.price || 178.72);
  const displayChange = hoveredChange !== null ? hoveredChange : (stock?.change || 2.34);

  return (
    <div className="border-b border-[#2A2A2A]">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold text-white">
                {stock?.symbol || 'AAPL'}
              </h1>
              <p className="text-xs text-gray-500">
                {stock?.name || 'Apple Inc.'}
              </p>
            </div>
            <div className="h-5 w-px bg-[#2A2A2A]" />
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-mono font-bold text-white">
                ${displayPrice.toFixed(2)}
              </span>
              <span
                className={`text-sm font-semibold ${
                  displayChange >= 0 ? 'text-[#00D09C]' : 'text-[#FF4976]'
                }`}
              >
                {displayChange >= 0 ? '+' : ''}
                {displayChange.toFixed(2)}%
              </span>
              {hoveredDate && (
                <span className="text-xs text-gray-500 ml-1">
                  {hoveredDate}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onToggleExpand}
            className="text-gray-500 hover:text-white transition-colors"
            title={isExpanded ? '收起' : '展开'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && children && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
