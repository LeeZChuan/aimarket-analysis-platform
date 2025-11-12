import { useState, useMemo } from 'react';
import { Table } from '../../components/Table';
import { LineVolumeChart } from '../../components/LineVolumeChart';
import { ChartTabs } from '../../components/ChartTabs';
import { ColumnConfig } from '../../components/Table/types';
import { generateLineChartData, generateVolumeData } from '../../mock/chartData';

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
}

export function StockDetailView() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<string | undefined>(undefined);

  const generateMockStockData = (count: number): StockData[] => {
    const stocks = [];
    const baseNames = [
      '中国平安', '贵州茅台', '招商银行', '工商银行', '建设银行',
      '中国石油', '中国石化', '农业银行', '中国银行', '交通银行',
      '中国人寿', '中国太保', '新华保险', '中国神华', '中国联通',
      '中国移动', '中国电信', '中国铁建', '中国中铁', '中国建筑',
    ];

    for (let i = 0; i < count; i++) {
      const baseName = baseNames[i % baseNames.length];
      const basePrice = 10 + Math.random() * 190;
      const change = (Math.random() - 0.5) * 10;
      const changePercent = (change / basePrice) * 100;

      stocks.push({
        id: `stock-${i}`,
        code: `${600000 + i}`,
        name: count > 20 ? `${baseName}${Math.floor(i / 20)}` : baseName,
        price: parseFloat((basePrice + change).toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 100000000),
        amount: Math.floor(Math.random() * 10000000000),
        open: parseFloat(basePrice.toFixed(2)),
        high: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
        low: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
        close: parseFloat((basePrice + change).toFixed(2)),
        marketCap: Math.floor(Math.random() * 1000000000000),
        pe: parseFloat((10 + Math.random() * 40).toFixed(2)),
        pb: parseFloat((1 + Math.random() * 5).toFixed(2)),
      });
    }

    return stocks;
  };

  const stockData = useMemo(() => generateMockStockData(2000), []);

  const lineChartData = useMemo(() => {
    const stockId = selectedStock?.id || 'default';
    const basePrice = selectedStock?.price || 100;
    return generateLineChartData(stockId, basePrice, 100);
  }, [selectedStock?.id, selectedStock?.price]);

  const volumeData = useMemo(() => {
    const stockId = selectedStock?.id || 'default';
    const baseVolume = selectedStock?.volume || 1000000;
    return generateVolumeData(stockId, 100, baseVolume);
  }, [selectedStock?.id, selectedStock?.volume]);

  const columns: ColumnConfig[] = [
    {
      key: 'code',
      title: '代码',
      dataIndex: 'code',
      width: 100,
      fixed: 'left',
    },
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
      width: 120,
      fixed: 'left',
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
          render: (value: number) => (
            <span className={value >= 0 ? 'text-[#00D09C]' : 'text-[#FF4976]'}>
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
          render: (value: number) => (
            <span className={value >= 0 ? 'text-[#00D09C]' : 'text-[#FF4976]'}>
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
          render: (value: number) => `${(value / 100000000).toFixed(0)}亿`,
        },
        {
          key: 'pe',
          title: '市盈率',
          dataIndex: 'pe',
          width: 100,
          align: 'right',
          render: (value: number) => value.toFixed(2),
        },
        {
          key: 'pb',
          title: '市净率',
          dataIndex: 'pb',
          width: 100,
          align: 'right',
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

  return (
    <div className="h-full w-full bg-[#0D0D0D] flex gap-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">个股列表</h2>
          <p className="text-sm text-gray-400 mt-1">
            共 {stockData.length} 只股票，支持虚拟滚动和固定列
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
        <div className="border border-[#2A2A2A] rounded overflow-hidden">
          <div className="bg-[#1A1A1A] px-4 py-3 border-b border-[#2A2A2A]">
            <h2 className="text-lg font-bold text-white">
              {selectedStock ? `${selectedStock.name} (${selectedStock.code})` : '个股走势'}
            </h2>
            {selectedStock && (
              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-2xl font-bold text-white">
                  {selectedStock.price.toFixed(2)}
                </span>
                <span
                  className={`text-lg ${
                    selectedStock.change >= 0 ? 'text-[#00D09C]' : 'text-[#FF4976]'
                  }`}
                >
                  {selectedStock.change >= 0 ? '+' : ''}
                  {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <LineVolumeChart
              lineData={lineChartData}
              volumeData={volumeData}
              height={lineVolumeHeight}
            />
          </div>
        </div>

        <div className="flex-1 border border-[#2A2A2A] rounded overflow-hidden">
          <ChartTabs
            stockId={selectedStock?.id}
            stockPrice={selectedStock?.price}
            height={klineHeight}
          />
        </div>
      </div>
    </div>
  );
}
