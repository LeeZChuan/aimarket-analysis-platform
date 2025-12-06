/**
 * 股票列表侧边栏组件
 *
 * 功能：
 * - 自选股列表和全部股票列表的标签切换
 * - 本地搜索过滤（按股票代码或名称）
 * - 点击股票切换选中状态
 * - 显示股票基本信息（代码、名称、价格、涨跌幅）
 * - 添加/移除自选股功能
 * - 打开股票搜索弹窗
 * - 点击股票跳转到详情页
 *
 * 使用位置：
 * - /views/TradingView/index.tsx - 交易视图（左侧股票列表栏）
 */

import { Search, TrendingUp, X, Star, BarChart3, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useEffect } from 'react';
import { stockService } from '../../services/stockService';
import { Stock } from '../../types/stock';
import { StockSearchModal } from '../StockSearchModal';

type TabType = 'watchlist' | 'stocks';

export function Sidebar() {
  const { watchlist, selectedStock, setSelectedStock, removeFromWatchlist, addToWatchlist } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'stocks') {
          const response = await stockService.getStockList(1, 100);
          setStocks(response.stocks);
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
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'watchlist':
        return '自选股';
      case 'stocks':
        return '股票列表';
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  const handleAddToWatchlist = (stock: Stock, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInWatchlist(stock.symbol)) {
      addToWatchlist(stock);
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

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
  };

  return (
    <div className="bg-[#1A1A1A] flex flex-col h-full w-full">
      <StockSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStock={handleSelectStock}
      />

      <div className="p-4 border-b border-[#2A2A2A]">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="relative w-full mb-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-500 hover:text-white hover:border-[#3A9FFF] transition-all text-left group"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-[#3A9FFF] w-4 h-4 transition-colors" />
          搜索代码或名称...
        </button>

        <div className="flex gap-2">
          {(['watchlist', 'stocks'] as TabType[]).map((tab) => (
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
                title={`查看 ${stock.name} (${stock.symbol}) 详情`}
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
                  {activeTab === 'watchlist' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(stock.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2A2A2A] rounded"
                      title="从自选股中移除"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleAddToWatchlist(stock, e)}
                      disabled={isInWatchlist(stock.symbol)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                        isInWatchlist(stock.symbol)
                          ? 'text-[#3A9FFF] cursor-not-allowed'
                          : 'hover:bg-[#2A2A2A] text-gray-500 hover:text-[#3A9FFF]'
                      }`}
                      title={isInWatchlist(stock.symbol) ? '已在自选股中' : '添加到自选股'}
                    >
                      {isInWatchlist(stock.symbol) ? (
                        <Star className="w-4 h-4 fill-[#3A9FFF]" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
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
