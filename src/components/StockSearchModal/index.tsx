/**
 * 股票搜索弹窗组件
 *
 * 功能：
 * - 全局股票搜索功能（支持按代码、名称搜索）
 * - 按地区筛选（亚洲/欧洲/北美洲/南美洲/非洲/大洋洲/南极洲）
 * - 显示全球80+股票列表
 * - 实时搜索过滤（无需提交）
 * - 显示股票价格和涨跌幅
 * - 快速添加到自选股（星标按钮）
 * - 点击股票选中并关闭弹窗
 * - 点击遮罩层或关闭按钮关闭
 *
 * 使用位置：
 * - /components/Sidebar/index.tsx - 点击搜索按钮弹出
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search, TrendingUp, TrendingDown, Plus, Star, Loader2 } from 'lucide-react';
import { Stock } from '../../types/stock';
import { stockService } from '../../services/stockService';
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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(stock => stock.symbol === symbol);
  };

  const handleAddToWatchlist = (stock: Stock, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInWatchlist(stock.symbol)) {
      addToWatchlist(stock);
    }
  };

  // 加载股票列表
  const loadStocks = useCallback(async (keyword: string, region: Region) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (keyword.trim()) {
        // 有搜索关键词时使用搜索接口
        response = await stockService.searchStock({
          keyword,
          limit: 100,
        });
      } else {
        // 无关键词时获取股票列表
        response = await stockService.getStockList(1, 100, {
          region: region !== 'all' ? region : undefined,
        });
      }
      
      let filteredStocks = response.stocks;
      
      // 如果有搜索关键词且需要按地区过滤
      if (keyword.trim() && region !== 'all') {
        filteredStocks = filteredStocks.filter(stock => stock.region === region);
      }
      
      setStocks(filteredStocks);
    } catch (err) {
      setError('加载股票列表失败，请稍后重试');
      console.error('Failed to load stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    if (isOpen) {
      loadStocks('', selectedRegion);
    }
  }, [isOpen, loadStocks, selectedRegion]);

  // 聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // 处理点击外部关闭和ESC关闭
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

  // 防抖搜索
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      loadStocks(searchQuery, selectedRegion);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedRegion, loadStocks]);

  const handleSelectStock = (stock: Stock) => {
    onSelectStock(stock);
    onClose();
    setSearchQuery('');
    setSelectedRegion('all');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div
        ref={modalRef}
        className="rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>搜索股票</h2>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-disabled)' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索代码或名称..."
              className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-disabled)' }}>地区筛选：</span>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region.value}
                  onClick={() => setSelectedRegion(region.value)}
                  className="px-3 py-1 text-xs rounded-full transition-all"
                  style={
                    selectedRegion === region.value
                      ? { background: 'var(--accent-primary)', color: 'white' }
                      : { background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }
                  }
                  onMouseEnter={(e) => {
                    if (selectedRegion !== region.value) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRegion !== region.value) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'var(--bg-primary)';
                    }
                  }}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-disabled)' }}>
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">加载中...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-disabled)' }}>
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => loadStocks(searchQuery, selectedRegion)}
                className="mt-2 text-sm px-4 py-1 rounded"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                重试
              </button>
            </div>
          ) : stocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-disabled)' }}>
              <Search className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">未找到匹配的股票</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="w-full p-3 rounded-lg transition-all group cursor-pointer"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                  onClick={() => handleSelectStock(stock)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold transition-colors group-hover-symbol" style={{ color: 'var(--text-primary)' }}>
                            {stock.symbol}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{stock.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {stock.region && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-disabled)', background: 'var(--bg-secondary)' }}>
                              {REGIONS.find(r => r.value === stock.region)?.label || stock.region}
                            </span>
                          )}
                          {stock.sector && (
                            <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                              {stock.sector}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                        className="p-1.5 rounded transition-all"
                        style={
                          isInWatchlist(stock.symbol)
                            ? { color: 'var(--accent-primary)', cursor: 'not-allowed' }
                            : { color: 'var(--text-disabled)' }
                        }
                        onMouseEnter={(e) => {
                          if (!isInWatchlist(stock.symbol)) {
                            e.currentTarget.style.color = 'var(--accent-primary)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isInWatchlist(stock.symbol)) {
                            e.currentTarget.style.color = 'var(--text-disabled)';
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                        title={isInWatchlist(stock.symbol) ? '已在自选股中' : '添加到自选股'}
                      >
                        {isInWatchlist(stock.symbol) ? (
                          <Star className="w-4 h-4" style={{ fill: 'var(--accent-primary)' }} />
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

        <div className="px-6 py-4 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-disabled)' }}>
          <span>共找到 {stocks.length} 只股票</span>
          <span>点击股票可切换到该股票的K线图</span>
        </div>
      </div>
    </div>
  );
}
