/**
 * 图表标签切换组件
 *
 * 功能：
 * - 提供个股/行业/大盘三个维度的图表切换
 * - 从API获取对应的K线数据
 * - 集成K线图表展示
 *
 * 使用位置：
 * - 目前未在主要页面使用（可作为独立组件使用）
 * - 可用于多维度对比分析场景
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { ChartTabType, ChartTab } from '../../types/chart';
import { KLineChart } from '../KLineChart';
import { stockService, KLineChartData } from '../../services/stockService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface ChartTabsProps {
  stockId?: string;
  stockSymbol?: string;
  stockSector?: string;
  stockPrice?: number;
  height?: number;
}

const TABS: ChartTab[] = [
  { key: 'stock', label: '个股' },
  { key: 'industry', label: '行业' },
  { key: 'market', label: '大盘' },
];

// 默认空数据
const EMPTY_KLINE_DATA: KLineChartData = {
  candlestick: [],
  volume: [],
};

export function ChartTabs({
  stockId = 'default',
  stockSymbol = 'AAPL',
  stockSector = 'Technology',
  // stockPrice 保留用于未来可能的价格展示
  stockPrice: _stockPrice = 100,
  height = 500,
}: ChartTabsProps) {
  void _stockPrice; // 显式标记未使用变量
  const [activeTab, setActiveTab] = useState<ChartTabType>('stock');
  const [klineData, setKlineData] = useState<KLineChartData>(EMPTY_KLINE_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载K线数据
  const loadKLineData = useCallback(async (tab: ChartTabType) => {
    setLoading(true);
    setError(null);
    
    try {
      let data: KLineChartData | null = null;
      
      switch (tab) {
        case 'stock':
          // 获取个股K线
          data = await stockService.getKLineChartData(stockSymbol, 'day', 120);
          break;
        case 'industry':
          // 获取行业指数K线
          data = await stockService.getIndustryKLine(stockSector, 'day', 120);
          break;
        case 'market':
          // 获取大盘指数K线（默认标普500）
          data = await stockService.getMarketIndexKLine('SPX', 'day', 120);
          break;
      }
      
      if (data) {
        setKlineData(data);
      } else {
        setKlineData(EMPTY_KLINE_DATA);
        setError('暂无数据');
      }
    } catch (err) {
      console.error('Failed to load kline data:', err);
      setError('加载数据失败');
      setKlineData(EMPTY_KLINE_DATA);
    } finally {
      setLoading(false);
    }
  }, [stockSymbol, stockSector]);

  // 切换标签或股票时加载数据
  useEffect(() => {
    loadKLineData(activeTab);
  }, [activeTab, stockId, loadKLineData]);

  return (
    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ChartTabType)} className="flex flex-col h-full">
      <TabsList className="w-full h-9 rounded-none border-b p-1" style={{ borderColor: 'var(--border-primary)' }}>
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className="flex-1 px-6 text-sm rounded-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} className="flex-1 p-4 mt-0">
          {loading ? (
            <div
              className="flex items-center justify-center"
              style={{ height: height }}
            >
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-disabled)' }} />
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: height, color: 'var(--text-disabled)' }}
            >
              <p className="text-sm">{error}</p>
              <button
                onClick={() => loadKLineData(activeTab)}
                className="mt-2 text-sm px-4 py-1 rounded"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                重试
              </button>
            </div>
          ) : (
            <KLineChart data={klineData} height={height} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
