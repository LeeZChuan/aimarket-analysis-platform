/**
 * 图表标签切换组件
 *
 * 功能：
 * - 提供个股/行业/大盘三个维度的图表切换
 * - 根据选中标签动态生成对应的K线数据
 * - 集成K线图表展示
 *
 * 使用位置：
 * - 目前未在主要页面使用（可作为独立组件使用）
 * - 可用于多维度对比分析场景
 */

import { useState, useMemo } from 'react';
import { ChartTabType, ChartTab } from '../../types/chart';
import { KLineChart } from '../KLineChart';
import { generateKLineDataByType } from '../../mock/chartData';

interface ChartTabsProps {
  stockId?: string;
  stockPrice?: number;
  height?: number;
}

const TABS: ChartTab[] = [
  { key: 'stock', label: '个股' },
  { key: 'industry', label: '行业' },
  { key: 'market', label: '大盘' },
];

export function ChartTabs({
  stockId = 'default',
  stockPrice = 100,
  height = 500,
}: ChartTabsProps) {
  const [activeTab, setActiveTab] = useState<ChartTabType>('stock');

  const klineData = useMemo(() => {
    return generateKLineDataByType(activeTab, stockId, stockPrice);
  }, [activeTab, stockId, stockPrice]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === tab.key
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4">
        <KLineChart data={klineData} height={height} />
      </div>
    </div>
  );
}
