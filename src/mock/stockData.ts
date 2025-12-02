/**
 * 股票和基金Mock数据
 * 提供大量的股票、基金和自选股数据用于开发测试
 */

import { Stock, Fund } from '../types/stock';

/**
 * Mock股票数据 - 美股主要科技股
 */
export const MOCK_STOCKS: Stock[] = [
  // 科技巨头 - 北美
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, marketCap: 2800000000000, volume: 52340000, sector: 'Technology', region: 'north-america' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: -1.23, marketCap: 2820000000000, volume: 28450000, sector: 'Technology', region: 'north-america' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.87, marketCap: 1780000000000, volume: 21560000, sector: 'Technology', region: 'north-america' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: 2.10, marketCap: 1850000000000, volume: 35670000, sector: 'Consumer Cyclical', region: 'north-america' },
  { symbol: 'META', name: 'Meta Platforms', price: 482.90, change: 1.85, marketCap: 1230000000000, volume: 18920000, sector: 'Technology', region: 'north-america' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 3.24, marketCap: 789000000000, volume: 89560000, sector: 'Automotive', region: 'north-america' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.20, change: -1.15, marketCap: 1220000000000, volume: 42340000, sector: 'Technology', region: 'north-america' },

  // 半导体 - 北美
  { symbol: 'AMD', name: 'Advanced Micro', price: 142.65, change: 1.92, marketCap: 230000000000, volume: 45780000, sector: 'Technology', region: 'north-america' },
  { symbol: 'INTC', name: 'Intel Corp.', price: 43.25, change: -0.56, marketCap: 182000000000, volume: 38920000, sector: 'Technology', region: 'north-america' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', price: 168.90, change: 0.78, marketCap: 188000000000, volume: 7450000, sector: 'Technology', region: 'north-america' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 892.50, change: 1.45, marketCap: 410000000000, volume: 2340000, sector: 'Technology', region: 'north-america' },
  { symbol: 'TXN', name: 'Texas Instruments', price: 189.75, change: -0.32, marketCap: 172000000000, volume: 4560000, sector: 'Technology', region: 'north-america' },

  // 电商与零售 - 亚洲/北美
  { symbol: 'BABA', name: 'Alibaba Group', price: 78.45, change: -2.34, marketCap: 198000000000, volume: 23450000, sector: 'Consumer Cyclical', region: 'asia' },
  { symbol: 'JD', name: 'JD.com Inc.', price: 32.80, change: 1.23, marketCap: 48000000000, volume: 12340000, sector: 'Consumer Cyclical', region: 'asia' },
  { symbol: 'PDD', name: 'PDD Holdings', price: 142.30, change: 3.67, marketCap: 186000000000, volume: 8920000, sector: 'Consumer Cyclical', region: 'asia' },
  { symbol: 'SHOP', name: 'Shopify Inc.', price: 68.90, change: 2.15, marketCap: 87000000000, volume: 10230000, sector: 'Technology', region: 'north-america' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 165.80, change: 0.45, marketCap: 448000000000, volume: 7890000, sector: 'Consumer Defensive', region: 'north-america' },

  // 社交媒体与娱乐 - 北美/欧洲
  { symbol: 'SNAP', name: 'Snap Inc.', price: 15.32, change: -3.21, marketCap: 24000000000, volume: 28940000, sector: 'Technology', region: 'north-america' },
  { symbol: 'PINS', name: 'Pinterest Inc.', price: 34.56, change: 1.89, marketCap: 23000000000, volume: 9870000, sector: 'Technology', region: 'north-america' },
  { symbol: 'SPOT', name: 'Spotify Tech.', price: 312.40, change: 2.67, marketCap: 61000000000, volume: 2340000, sector: 'Communication', region: 'europe' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.70, change: 1.34, marketCap: 209000000000, volume: 4560000, sector: 'Communication', region: 'north-america' },
  { symbol: 'DIS', name: 'Walt Disney Co.', price: 96.45, change: -0.78, marketCap: 176000000000, volume: 11230000, sector: 'Communication', region: 'north-america' },

  // 金融科技 - 北美
  { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.80, change: 0.95, marketCap: 67000000000, volume: 14560000, sector: 'Financial', region: 'north-america' },
  { symbol: 'SQ', name: 'Block Inc.', price: 74.25, change: 2.34, marketCap: 43000000000, volume: 9870000, sector: 'Financial', region: 'north-america' },
  { symbol: 'COIN', name: 'Coinbase Global', price: 234.60, change: 4.56, marketCap: 57000000000, volume: 7890000, sector: 'Financial', region: 'north-america' },
  { symbol: 'V', name: 'Visa Inc.', price: 278.90, change: 0.67, marketCap: 580000000000, volume: 6340000, sector: 'Financial', region: 'north-america' },
  { symbol: 'MA', name: 'Mastercard Inc.', price: 456.30, change: 0.89, marketCap: 432000000000, volume: 3120000, sector: 'Financial', region: 'north-america' },

  // 云计算与企业软件 - 北美
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 289.40, change: 1.23, marketCap: 282000000000, volume: 5670000, sector: 'Technology', region: 'north-america' },
  { symbol: 'ORCL', name: 'Oracle Corp.', price: 124.50, change: -0.45, marketCap: 342000000000, volume: 8900000, sector: 'Technology', region: 'north-america' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 548.70, change: 0.98, marketCap: 248000000000, volume: 2890000, sector: 'Technology', region: 'north-america' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', price: 678.90, change: 2.12, marketCap: 138000000000, volume: 1560000, sector: 'Technology', region: 'north-america' },
  { symbol: 'WDAY', name: 'Workday Inc.', price: 245.60, change: 1.45, marketCap: 63000000000, volume: 2340000, sector: 'Technology', region: 'north-america' },

  // 芯片设备与材料 - 欧洲/北美
  { symbol: 'ASML', name: 'ASML Holding', price: 892.30, change: 1.67, marketCap: 365000000000, volume: 980000, sector: 'Technology', region: 'europe' },
  { symbol: 'AMAT', name: 'Applied Materials', price: 198.45, change: 0.89, marketCap: 169000000000, volume: 6780000, sector: 'Technology', region: 'north-america' },
  { symbol: 'LRCX', name: 'Lam Research', price: 876.20, change: 1.34, marketCap: 118000000000, volume: 1230000, sector: 'Technology', region: 'north-america' },
  { symbol: 'KLAC', name: 'KLA Corp.', price: 634.50, change: 0.76, marketCap: 88000000000, volume: 890000, sector: 'Technology', region: 'north-america' },

  // 电动车与新能源 - 北美/亚洲
  { symbol: 'RIVN', name: 'Rivian Automotive', price: 21.45, change: -2.89, marketCap: 21000000000, volume: 34560000, sector: 'Automotive', region: 'north-america' },
  { symbol: 'LCID', name: 'Lucid Group', price: 3.42, change: -4.12, marketCap: 8000000000, volume: 28900000, sector: 'Automotive', region: 'north-america' },
  { symbol: 'NIO', name: 'NIO Inc.', price: 6.78, change: 2.34, marketCap: 11000000000, volume: 45670000, sector: 'Automotive', region: 'asia' },
  { symbol: 'XPEV', name: 'XPeng Inc.', price: 12.56, change: 1.87, marketCap: 11000000000, volume: 18900000, sector: 'Automotive', region: 'asia' },
  { symbol: 'F', name: 'Ford Motor Co.', price: 11.89, change: 0.34, marketCap: 47000000000, volume: 67890000, sector: 'Automotive', region: 'north-america' },

  // 生物科技 - 北美/欧洲
  { symbol: 'MRNA', name: 'Moderna Inc.', price: 87.60, change: 3.45, marketCap: 34000000000, volume: 7890000, sector: 'Healthcare', region: 'north-america' },
  { symbol: 'BNTX', name: 'BioNTech SE', price: 102.30, change: 2.78, marketCap: 25000000000, volume: 2340000, sector: 'Healthcare', region: 'europe' },
  { symbol: 'GILD', name: 'Gilead Sciences', price: 78.90, change: 0.56, marketCap: 99000000000, volume: 6780000, sector: 'Healthcare', region: 'north-america' },
  { symbol: 'BIIB', name: 'Biogen Inc.', price: 234.50, change: -1.23, marketCap: 34000000000, volume: 1560000, sector: 'Healthcare', region: 'north-america' },
  { symbol: 'REGN', name: 'Regeneron Pharma', price: 912.40, change: 1.12, marketCap: 99000000000, volume: 890000, sector: 'Healthcare', region: 'north-america' },

  // 传统科技 - 北美
  { symbol: 'IBM', name: 'IBM Corp.', price: 167.80, change: -0.23, marketCap: 154000000000, volume: 4560000, sector: 'Technology', region: 'north-america' },
  { symbol: 'CSCO', name: 'Cisco Systems', price: 54.30, change: 0.45, marketCap: 221000000000, volume: 19870000, sector: 'Technology', region: 'north-america' },
  { symbol: 'HPQ', name: 'HP Inc.', price: 29.45, change: -0.67, marketCap: 30000000000, volume: 8900000, sector: 'Technology', region: 'north-america' },
  { symbol: 'DELL', name: 'Dell Technologies', price: 98.70, change: 1.23, marketCap: 71000000000, volume: 3450000, sector: 'Technology', region: 'north-america' },
];

/**
 * Mock基金数据 - 主要ETF基金
 */
export const MOCK_FUNDS: Fund[] = [
  // 宽基指数ETF
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 458.90, change: 0.78, fundType: 'ETF', expenseRatio: 0.09, aum: 398000000000, sector: 'Index', volume: 78900000 },
  { symbol: 'VOO', name: 'Vanguard S&P 500', price: 456.78, change: 0.82, fundType: 'ETF', expenseRatio: 0.03, aum: 358000000000, sector: 'Index', volume: 4560000 },
  { symbol: 'IVV', name: 'iShares Core S&P 500', price: 456.23, change: 0.81, fundType: 'ETF', expenseRatio: 0.03, aum: 348000000000, sector: 'Index', volume: 3890000 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 389.45, change: 1.23, fundType: 'ETF', expenseRatio: 0.20, aum: 245000000000, sector: 'Technology', volume: 38900000 },
  { symbol: 'VTI', name: 'Vanguard Total Stock', price: 234.56, change: 0.65, fundType: 'ETF', expenseRatio: 0.03, aum: 1450000000000, sector: 'Index', volume: 3450000 },
  { symbol: 'DIA', name: 'SPDR Dow Jones ETF', price: 389.70, change: 0.45, fundType: 'ETF', expenseRatio: 0.16, aum: 31000000000, sector: 'Index', volume: 4560000 },

  // 科技类ETF
  { symbol: 'VGT', name: 'Vanguard Info Tech', price: 512.30, change: 1.45, fundType: 'ETF', expenseRatio: 0.10, aum: 67000000000, sector: 'Technology', volume: 890000 },
  { symbol: 'XLK', name: 'Tech Select Sector', price: 198.60, change: 1.34, fundType: 'ETF', expenseRatio: 0.10, aum: 58000000000, sector: 'Technology', volume: 6780000 },
  { symbol: 'SOXX', name: 'iShares Semiconductor', price: 456.80, change: 0.98, fundType: 'ETF', expenseRatio: 0.35, aum: 12000000000, sector: 'Technology', volume: 2340000 },
  { symbol: 'SMH', name: 'VanEck Semiconductor', price: 234.50, change: 1.12, fundType: 'ETF', expenseRatio: 0.35, aum: 14000000000, sector: 'Technology', volume: 4560000 },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', price: 47.80, change: 2.34, fundType: 'ETF', expenseRatio: 0.75, aum: 7800000000, sector: 'Technology', volume: 12340000 },

  // 金融类ETF
  { symbol: 'XLF', name: 'Financial Select', price: 38.90, change: 0.56, fundType: 'ETF', expenseRatio: 0.10, aum: 41000000000, sector: 'Financial', volume: 45670000 },
  { symbol: 'VFH', name: 'Vanguard Financials', price: 98.40, change: 0.67, fundType: 'ETF', expenseRatio: 0.10, aum: 11000000000, sector: 'Financial', volume: 2340000 },
  { symbol: 'KRE', name: 'SPDR Regional Bank', price: 48.70, change: -0.89, fundType: 'ETF', expenseRatio: 0.35, aum: 4500000000, sector: 'Financial', volume: 18900000 },

  // 医疗健康ETF
  { symbol: 'XLV', name: 'Health Care Select', price: 142.30, change: 0.45, fundType: 'ETF', expenseRatio: 0.10, aum: 36000000000, sector: 'Healthcare', volume: 8900000 },
  { symbol: 'VHT', name: 'Vanguard Health Care', price: 256.80, change: 0.67, fundType: 'ETF', expenseRatio: 0.10, aum: 17000000000, sector: 'Healthcare', volume: 890000 },
  { symbol: 'IBB', name: 'iShares Biotech', price: 134.50, change: 1.23, fundType: 'ETF', expenseRatio: 0.45, aum: 8900000000, sector: 'Healthcare', volume: 3450000 },

  // 能源类ETF
  { symbol: 'XLE', name: 'Energy Select Sector', price: 89.60, change: -1.34, fundType: 'ETF', expenseRatio: 0.10, aum: 34000000000, sector: 'Energy', volume: 23450000 },
  { symbol: 'VDE', name: 'Vanguard Energy', price: 121.40, change: -1.12, fundType: 'ETF', expenseRatio: 0.10, aum: 7800000000, sector: 'Energy', volume: 1230000 },
  { symbol: 'USO', name: 'US Oil Fund', price: 78.90, change: -2.34, fundType: 'ETF', expenseRatio: 0.60, aum: 1200000000, sector: 'Energy', volume: 8900000 },

  // 房地产ETF
  { symbol: 'VNQ', name: 'Vanguard Real Estate', price: 87.60, change: 0.34, fundType: 'ETF', expenseRatio: 0.12, aum: 38000000000, sector: 'Real Estate', volume: 4560000 },
  { symbol: 'XLRE', name: 'Real Estate Select', price: 38.20, change: 0.45, fundType: 'ETF', expenseRatio: 0.10, aum: 6700000000, sector: 'Real Estate', volume: 2340000 },
  { symbol: 'IYR', name: 'iShares Real Estate', price: 89.40, change: 0.56, fundType: 'ETF', expenseRatio: 0.40, aum: 4500000000, sector: 'Real Estate', volume: 3890000 },

  // 债券ETF
  { symbol: 'BND', name: 'Vanguard Total Bond', price: 71.80, change: -0.12, fundType: 'Bond', expenseRatio: 0.03, aum: 98000000000, sector: 'Fixed Income', volume: 5670000 },
  { symbol: 'AGG', name: 'iShares Core Bond', price: 97.50, change: -0.08, fundType: 'Bond', expenseRatio: 0.03, aum: 104000000000, sector: 'Fixed Income', volume: 4560000 },
  { symbol: 'TLT', name: 'iShares 20+ Yr Bond', price: 89.20, change: -0.45, fundType: 'Bond', expenseRatio: 0.15, aum: 48000000000, sector: 'Fixed Income', volume: 28900000 },
  { symbol: 'LQD', name: 'iShares IG Corp Bond', price: 107.30, change: -0.23, fundType: 'Bond', expenseRatio: 0.14, aum: 37000000000, sector: 'Fixed Income', volume: 12340000 },

  // 国际市场ETF
  { symbol: 'VEA', name: 'Vanguard FTSE Dev', price: 48.90, change: 0.78, fundType: 'ETF', expenseRatio: 0.05, aum: 115000000000, sector: 'International', volume: 12340000 },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerg', price: 42.30, change: 1.23, fundType: 'ETF', expenseRatio: 0.08, aum: 78000000000, sector: 'International', volume: 18900000 },
  { symbol: 'EFA', name: 'iShares MSCI EAFE', price: 78.60, change: 0.89, fundType: 'ETF', expenseRatio: 0.32, aum: 68000000000, sector: 'International', volume: 23450000 },
  { symbol: 'EEM', name: 'iShares MSCI Emerg', price: 41.20, change: 1.45, fundType: 'ETF', expenseRatio: 0.68, aum: 21000000000, sector: 'International', volume: 34560000 },

  // 黄金与商品ETF
  { symbol: 'GLD', name: 'SPDR Gold Shares', price: 198.40, change: 0.67, fundType: 'ETF', expenseRatio: 0.40, aum: 61000000000, sector: 'Commodity', volume: 8900000 },
  { symbol: 'SLV', name: 'iShares Silver Trust', price: 23.50, change: 1.23, fundType: 'ETF', expenseRatio: 0.50, aum: 12000000000, sector: 'Commodity', volume: 23450000 },
  { symbol: 'DBC', name: 'Invesco DB Commodity', price: 22.80, change: -0.45, fundType: 'ETF', expenseRatio: 0.87, aum: 1800000000, sector: 'Commodity', volume: 4560000 },
];

/**
 * Mock自选股列表 - 初始自选股数据
 */
export const MOCK_WATCHLIST: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, marketCap: 2800000000000, volume: 52340000, sector: 'Technology', region: 'north-america' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: -1.23, marketCap: 2820000000000, volume: 28450000, sector: 'Technology', region: 'north-america' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.87, marketCap: 1780000000000, volume: 21560000, sector: 'Technology', region: 'north-america' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 3.24, marketCap: 789000000000, volume: 89560000, sector: 'Automotive', region: 'north-america' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.20, change: -1.15, marketCap: 1220000000000, volume: 42340000, sector: 'Technology', region: 'north-america' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: 2.10, marketCap: 1850000000000, volume: 35670000, sector: 'Consumer Cyclical', region: 'north-america' },
];

/**
 * 根据关键词搜索股票
 */
export const searchStocks = (keyword: string, stocks: Stock[]): Stock[] => {
  const lowerKeyword = keyword.toLowerCase().trim();
  if (!lowerKeyword) return stocks;

  return stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerKeyword) ||
      stock.name.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * 根据关键词搜索基金
 */
export const searchFunds = (keyword: string, funds: Fund[]): Fund[] => {
  const lowerKeyword = keyword.toLowerCase().trim();
  if (!lowerKeyword) return funds;

  return funds.filter(
    (fund) =>
      fund.symbol.toLowerCase().includes(lowerKeyword) ||
      fund.name.toLowerCase().includes(lowerKeyword)
  );
};
