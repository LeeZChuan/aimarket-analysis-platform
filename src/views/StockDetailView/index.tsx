import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Loader2, TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { Table } from '../../components/Table';
import { LineVolumeChart } from '../../components/LineVolumeChart';
import { ChartTabs } from '../../components/ChartTabs';
import { ColumnConfig } from '../../components/Table/types';
import { stockService, LineChartData, VolumeChartData } from '../../services/stockService';
import { notifyError } from '../../utils/notify';

interface StockData {
  id: string;
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  open: number;
  high: number;
  low: number;
  close: number;
  marketCap: number;
  pe: number;
  pb: number;
  sector?: string;
}

export function StockDetailView() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<string | undefined>(undefined);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const pageSize = 50;

  const loadStockList = useCallback(async (page: number, append: boolean = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await stockService.getStockList(page, pageSize);

      const tableData: StockData[] = response.stocks.map((stock, index) => ({
        id: `stock-${page}-${index}`,
        code: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.price * (stock.change / 100),
        changePercent: stock.change,
        volume: stock.volume || 0,
        amount: (stock.volume || 0) * stock.price,
        open: stock.price * (1 - Math.random() * 0.02),
        high: stock.price * (1 + Math.random() * 0.03),
        low: stock.price * (1 - Math.random() * 0.03),
        close: stock.price,
        marketCap: stock.marketCap || 0,
        pe: Math.random() * 40 + 10,
        pb: Math.random() * 4 + 1,
        sector: stock.sector,
      }));

      if (append) {
        setStockData(prev => [...prev, ...tableData]);
      } else {
        setStockData(tableData);
      }

      setTotal(response.total);
      setHasMore(page * pageSize < response.total);

    } catch (err) {
      console.error('Failed to load stock list:', err);
      notifyError('加载股票列表失败，请重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  const loadTimelineData = useCallback(async (symbol: string) => {
    setChartLoading(true);
    try {
      const data = await stockService.getTimelineData(symbol, 100);
      if (data) {
        setLineChartData(data.lineData);
        setVolumeData(data.volumeData);
      } else {
        setLineChartData([]);
        setVolumeData([]);
      }
    } catch (err) {
      console.error('Failed to load timeline data:', err);
      setLineChartData([]);
      setVolumeData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockList(1, false);
  }, [loadStockList]);

  useEffect(() => {
    if (selectedStock?.code) {
      loadTimelineData(selectedStock.code);
    }
  }, [selectedStock?.code, loadTimelineData]);

  const handleScroll = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8 && hasMore && !loadingRef.current) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadStockList(nextPage, true);
    }
  }, [hasMore, currentPage, loadStockList]);

  const columns: ColumnConfig[] = [
    {
      key: 'code',
      title: '代码',
      dataIndex: 'code',
      width: 100,
      fixed: 'left',
      sortable: true,
    },
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
      width: 120,
      fixed: 'left',
      sortable: true,
    },
    {
      key: 'priceInfo',
      title: '价格信息',
      dataIndex: 'priceInfo',
      width: 400,
      children: [
        {
          key: 'price',
          title: '最新价',
          dataIndex: 'price',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => (
            <span className="font-medium text-base">{value.toFixed(2)}</span>
          ),
        },
        {
          key: 'change',
          title: '涨跌额',
          dataIndex: 'change',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => (
            <span
              className="font-medium"
              style={{ color: value >= 0 ? '#f04134' : '#00c853' }}
            >
              {value >= 0 ? '+' : ''}{value.toFixed(2)}
            </span>
          ),
        },
        {
          key: 'changePercent',
          title: '涨跌幅',
          dataIndex: 'changePercent',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => (
            <span
              className="font-semibold"
              style={{ color: value >= 0 ? '#f04134' : '#00c853' }}
            >
              {value >= 0 ? '+' : ''}{value.toFixed(2)}%
            </span>
          ),
        },
        {
          key: 'volume',
          title: '成交量',
          dataIndex: 'volume',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => (
            <span className="text-sm">{(value / 10000).toFixed(0)}万</span>
          ),
        },
      ],
    },
    {
      key: 'tradingInfo',
      title: '交易数据',
      dataIndex: 'tradingInfo',
      width: 400,
      children: [
        {
          key: 'open',
          title: '今开',
          dataIndex: 'open',
          width: 100,
          align: 'right',
          render: (value: number) => <span className="text-sm">{value.toFixed(2)}</span>,
        },
        {
          key: 'high',
          title: '最高',
          dataIndex: 'high',
          width: 100,
          align: 'right',
          render: (value: number) => (
            <span className="text-sm" style={{ color: '#f04134' }}>{value.toFixed(2)}</span>
          ),
        },
        {
          key: 'low',
          title: '最低',
          dataIndex: 'low',
          width: 100,
          align: 'right',
          render: (value: number) => (
            <span className="text-sm" style={{ color: '#00c853' }}>{value.toFixed(2)}</span>
          ),
        },
        {
          key: 'close',
          title: '昨收',
          dataIndex: 'close',
          width: 100,
          align: 'right',
          render: (value: number) => <span className="text-sm">{value.toFixed(2)}</span>,
        },
      ],
    },
    {
      key: 'fundamentals',
      title: '估值指标',
      dataIndex: 'fundamentals',
      width: 300,
      children: [
        {
          key: 'marketCap',
          title: '市值',
          dataIndex: 'marketCap',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => <span className="text-sm">{(value / 100000000).toFixed(0)}亿</span>,
        },
        {
          key: 'pe',
          title: '市盈率',
          dataIndex: 'pe',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => <span className="text-sm">{value.toFixed(2)}</span>,
        },
        {
          key: 'pb',
          title: '市净率',
          dataIndex: 'pb',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => <span className="text-sm">{value.toFixed(2)}</span>,
        },
      ],
    },
    {
      key: 'amount',
      title: '成交额',
      dataIndex: 'amount',
      width: 120,
      align: 'right',
      render: (value: number) => <span className="text-sm">{(value / 100000000).toFixed(2)}亿</span>,
    },
  ];

  const handleRowClick = (record: StockData) => {
    setSelectedStock(record);
    setSelectedRowKey(record.id);
  };

  const chartHeight = window.innerHeight - 180;
  const lineVolumeHeight = Math.floor(chartHeight * 0.4);
  const klineHeight = Math.floor(chartHeight * 0.55);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--text-secondary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>加载股票数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex gap-4 p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 min-w-0">
        <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  市场行情
                </h2>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  已加载 <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stockData.length}</span> / {total} 只股票
                </p>
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>加载更多...</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentPage(1);
                loadStockList(1, false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">刷新</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <Table
            columns={columns}
            dataSource={stockData}
            rowKey="id"
            selectedRowKey={selectedRowKey}
            height={window.innerHeight - 170}
            rowHeight={48}
            headerHeight={48}
            onRowClick={handleRowClick}
            onScroll={handleScroll}
          />
          {loadingMore && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                加载中...
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="w-[600px] flex flex-col gap-4">
        <div
          className="border rounded-lg overflow-hidden shadow-sm"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-secondary)'
          }}
        >
          <div
            className="px-5 py-4"
            style={{
              background: 'linear-gradient(to right, var(--bg-secondary), var(--bg-tertiary))',
              borderBottom: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedStock ? `${selectedStock.name}` : '个股详情'}
              </h2>
              {selectedStock && (
                <span className="text-sm px-3 py-1 rounded" style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-muted)'
                }}>
                  {selectedStock.code}
                </span>
              )}
            </div>
            {selectedStock && (
              <div className="flex items-baseline gap-4 mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedStock.price.toFixed(2)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>CNY</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedStock.change >= 0 ? (
                    <TrendingUp className="w-5 h-5" style={{ color: '#f04134' }} />
                  ) : (
                    <TrendingDown className="w-5 h-5" style={{ color: '#00c853' }} />
                  )}
                  <span
                    className="text-lg font-semibold"
                    style={{ color: selectedStock.change >= 0 ? '#f04134' : '#00c853' }}
                  >
                    {selectedStock.change >= 0 ? '+' : ''}
                    {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            {chartLoading ? (
              <div
                className="flex flex-col items-center justify-center gap-3"
                style={{ height: lineVolumeHeight }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>加载图表数据...</p>
              </div>
            ) : selectedStock ? (
              <LineVolumeChart
                lineData={lineChartData}
                volumeData={volumeData}
                height={lineVolumeHeight}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ height: lineVolumeHeight }}
              >
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  请从列表中选择股票查看详情
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex-1 border rounded-lg overflow-hidden shadow-sm"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-secondary)'
          }}
        >
          <ChartTabs
            stockId={selectedStock?.id}
            stockSymbol={selectedStock?.code}
            stockSector={selectedStock?.sector}
            stockPrice={selectedStock?.price}
            height={klineHeight}
          />
        </div>
      </div>
    </div>
  );
}
