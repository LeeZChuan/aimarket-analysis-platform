import { useState, useMemo, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Table } from '../../components/Table';
import { LineVolumeChart } from '../../components/LineVolumeChart';
import { ChartTabs } from '../../components/ChartTabs';
import { ColumnConfig } from '../../components/Table/types';
import { stockService, LineChartData, VolumeChartData } from '../../services/stockService';

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
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeChartData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // 加载股票列表
  const loadStockList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockService.getStockList(1, 100);
      
      // 转换为表格需要的数据格式
      const tableData: StockData[] = response.stocks.map((stock, index) => ({
        id: `stock-${index}`,
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
      
      setStockData(tableData);
    } catch (err) {
      console.error('Failed to load stock list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载分时图数据
  const loadTimelineData = useCallback(async (symbol: string) => {
    setChartLoading(true);
    try {
      const data = await stockService.getTimelineData(symbol, 100);
      if (data) {
        setLineChartData(data.lineData);
        setVolumeData(data.volumeData);
      } else {
        // 如果API没有数据，使用空数组
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

  // 初始加载股票列表
  useEffect(() => {
    loadStockList();
  }, [loadStockList]);

  // 选中股票变化时加载分时图数据
  useEffect(() => {
    if (selectedStock?.code) {
      loadTimelineData(selectedStock.code);
    }
  }, [selectedStock?.code, loadTimelineData]);

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
            <span className="font-medium">{value.toFixed(2)}</span>
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
            <span style={{ color: value >= 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
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
            <span style={{ color: value >= 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
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
            <span>{(value / 10000).toFixed(0)}万</span>
          ),
        },
      ],
    },
    {
      key: 'tradingInfo',
      title: '交易信息',
      dataIndex: 'tradingInfo',
      width: 400,
      children: [
        {
          key: 'open',
          title: '今开',
          dataIndex: 'open',
          width: 100,
          align: 'right',
          render: (value: number) => value.toFixed(2),
        },
        {
          key: 'high',
          title: '最高',
          dataIndex: 'high',
          width: 100,
          align: 'right',
          render: (value: number) => value.toFixed(2),
        },
        {
          key: 'low',
          title: '最低',
          dataIndex: 'low',
          width: 100,
          align: 'right',
          render: (value: number) => value.toFixed(2),
        },
        {
          key: 'close',
          title: '昨收',
          dataIndex: 'close',
          width: 100,
          align: 'right',
          render: (value: number) => value.toFixed(2),
        },
      ],
    },
    {
      key: 'fundamentals',
      title: '基本面',
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
          render: (value: number) => `${(value / 100000000).toFixed(0)}亿`,
        },
        {
          key: 'pe',
          title: '市盈率',
          dataIndex: 'pe',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => value.toFixed(2),
        },
        {
          key: 'pb',
          title: '市净率',
          dataIndex: 'pb',
          width: 100,
          align: 'right',
          sortable: true,
          draggable: true,
          render: (value: number) => value.toFixed(2),
        },
      ],
    },
    {
      key: 'amount',
      title: '成交额',
      dataIndex: 'amount',
      width: 120,
      align: 'right',
      render: (value: number) => `${(value / 100000000).toFixed(2)}亿`,
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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-disabled)' }} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex gap-4 p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>个股列表</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            共 {stockData.length} 只股票，支持虚拟滚动、固定列、排序和列拖拽
          </p>
        </div>
        <Table
          columns={columns}
          dataSource={stockData}
          rowKey="id"
          selectedRowKey={selectedRowKey}
          height={window.innerHeight - 150}
          rowHeight={48}
          headerHeight={48}
          onRowClick={handleRowClick}
        />
      </div>
      <div className="w-[600px] flex flex-col gap-4">
        <div className="border rounded overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
          <div
            className="px-4 py-3"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedStock ? `${selectedStock.name} (${selectedStock.code})` : '个股走势'}
            </h2>
            {selectedStock && (
              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedStock.price.toFixed(2)}
                </span>
                <span
                  className="text-lg"
                  style={{ color: selectedStock.change >= 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                >
                  {selectedStock.change >= 0 ? '+' : ''}
                  {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            {chartLoading ? (
              <div 
                className="flex items-center justify-center"
                style={{ height: lineVolumeHeight }}
              >
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-disabled)' }} />
              </div>
            ) : (
              <LineVolumeChart
                lineData={lineChartData}
                volumeData={volumeData}
                height={lineVolumeHeight}
              />
            )}
          </div>
        </div>

        <div className="flex-1 border rounded overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
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
