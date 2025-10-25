import { Search, TrendingUp, X, Star, BarChart3, PieChart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';
import { Stock, Fund } from '../types/stock';

type TabType = 'watchlist' | 'stocks' | 'funds';

export function Sidebar() {
  const { watchlist, selectedStock, setSelectedStock, removeFromWatchlist } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'stocks') {
          const response = await stockService.getStockList(1, 100);
          setStocks(response.stocks);
        } else if (activeTab === 'funds') {
          const response = await stockService.getFundList(1, 100);
          setFunds(response.funds);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab !== 'watchlist') {
      loadData();
    }
  }, [activeTab]);

  const getCurrentList = () => {
    switch (activeTab) {
      case 'watchlist':
        return watchlist;
      case 'stocks':
        return stocks;
      case 'funds':
        return funds;
      default:
        return watchlist;
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'watchlist':
        return <Star className="w-4 h-4" />;
      case 'stocks':
        return <BarChart3 className="w-4 h-4" />;
      case 'funds':
        return <PieChart className="w-4 h-4" />;
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'watchlist':
        return '自选股';
      case 'stocks':
        return '股票列表';
      case 'funds':
        return '基金列表';
    }
  };

  const currentList = getCurrentList();
  const filteredList = searchTerm
    ? currentList.filter(
        (item) =>
          item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentList;

  return (
    <div className="w-80 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col h-full">
      <div className="p-4 border-b border-[#2A2A2A]">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索代码或名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF]"
          />
        </div>

        <div className="flex gap-2">
          {(['watchlist', 'stocks', 'funds'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]/50 border border-transparent'
              }`}
              title={getTabLabel(tab)}
            >
              {getTabIcon(tab)}
              <span className="hidden xl:inline">{getTabLabel(tab)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 text-sm">加载中...</div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 text-sm">
                {searchTerm ? '未找到匹配结果' : '暂无数据'}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredList.map((stock) => (
              <div
                key={stock.symbol}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  selectedStock?.symbol === stock.symbol
                    ? 'bg-[#3A9FFF]/20 border border-[#3A9FFF]'
                    : 'bg-[#0D0D0D] border border-transparent hover:border-[#2A2A2A]'
                }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">
                        {stock.symbol}
                      </span>
                      <span className="text-xs text-gray-500">{stock.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-white font-mono text-lg">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          stock.change >= 0 ? 'text-[#00D09C]' : 'text-red-500'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {activeTab === 'watchlist' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(stock.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2A2A2A] rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-[#2A2A2A]">
        <div className="text-xs text-gray-500 text-center">
          AstraTrade v1.0
        </div>
      </div>
    </div>
  );
}
