import { useState, useRef, useEffect } from 'react';
import { X, Search, TrendingUp, TrendingDown, Plus, Star } from 'lucide-react';
import { Stock } from '../../types/stock';
import { MOCK_STOCKS } from '../../mock/stockData';
import { useStore } from '../../store/useStore';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (stock: Stock) => void;
}

type Region = 'all' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'africa' | 'oceania' | 'antarctica';

const REGIONS: { value: Region; label: string }[] = [
  { value: 'all', label: '全部地区' },
  { value: 'asia', label: '亚洲' },
  { value: 'europe', label: '欧洲' },
  { value: 'north-america', label: '北美洲' },
  { value: 'south-america', label: '南美洲' },
  { value: 'africa', label: '非洲' },
  { value: 'oceania', label: '大洋洲' },
  { value: 'antarctica', label: '南极洲' },
];

export function StockSearchModal({ isOpen, onClose, onSelectStock }: StockSearchModalProps) {
  const { watchlist, addToWatchlist } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  const handleAddToWatchlist = (stock: Stock, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInWatchlist(stock.symbol)) {
      addToWatchlist(stock);
    }
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    let stocks = MOCK_STOCKS;

    if (selectedRegion !== 'all') {
      stocks = stocks.filter(stock => stock.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      stocks = stocks.filter(
        stock =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
      );
    }

    setFilteredStocks(stocks);
  }, [searchQuery, selectedRegion]);

  const handleSelectStock = (stock: Stock) => {
    onSelectStock(stock);
    onClose();
    setSearchQuery('');
    setSelectedRegion('all');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-white">搜索股票</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#2A2A2A]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索代码或名称..."
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3A9FFF] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">地区筛选：</span>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region.value}
                  onClick={() => setSelectedRegion(region.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    selectedRegion === region.value
                      ? 'bg-[#3A9FFF] text-white'
                      : 'bg-[#0D0D0D] text-gray-400 hover:text-white hover:bg-[#2A2A2A] border border-[#2A2A2A]'
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">未找到匹配的股票</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="w-full p-3 rounded-lg bg-[#0D0D0D] hover:bg-[#2A2A2A] border border-[#2A2A2A] hover:border-[#3A9FFF] transition-all group cursor-pointer"
                  onClick={() => handleSelectStock(stock)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white group-hover:text-[#3A9FFF] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-xs text-gray-500">{stock.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {stock.region && (
                            <span className="text-xs text-gray-600 bg-[#1A1A1A] px-2 py-0.5 rounded">
                              {REGIONS.find(r => r.value === stock.region)?.label || stock.region}
                            </span>
                          )}
                          {stock.sector && (
                            <span className="text-xs text-gray-600">
                              {stock.sector}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-mono font-semibold text-white">
                          ${stock.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-semibold flex items-center gap-1 justify-end ${
                            stock.change >= 0 ? 'text-[#00D09C]' : 'text-[#FF4976]'
                          }`}
                        >
                          {stock.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {stock.change >= 0 ? '+' : ''}
                          {stock.change.toFixed(2)}%
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleAddToWatchlist(stock, e)}
                        disabled={isInWatchlist(stock.symbol)}
                        className={`p-1.5 rounded transition-all ${
                          isInWatchlist(stock.symbol)
                            ? 'text-[#3A9FFF] cursor-not-allowed'
                            : 'text-gray-500 hover:text-[#3A9FFF] hover:bg-[#1A1A1A]'
                        }`}
                        title={isInWatchlist(stock.symbol) ? '已在自选股中' : '添加到自选股'}
                      >
                        {isInWatchlist(stock.symbol) ? (
                          <Star className="w-4 h-4 fill-[#3A9FFF]" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-gray-500">
          <span>共找到 {filteredStocks.length} 只股票</span>
          <span>点击股票可切换到该股票的K线图</span>
        </div>
      </div>
    </div>
  );
}
