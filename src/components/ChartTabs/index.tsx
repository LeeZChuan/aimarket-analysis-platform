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
