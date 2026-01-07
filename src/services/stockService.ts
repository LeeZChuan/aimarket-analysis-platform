/**
 * 股票服务
 * 提供股票、自选股的查询和管理接口
 */

import { http } from './request';
import {
  Stock,
  StockListResponse,
  WatchlistResponse,
  StockSearchRequest,
  StockDetail,
} from '../types/stock';

/**
 * K线数据
 */
export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * K线响应
 */
export interface KLineResponse {
  symbol: string;
  period: string;
  data: KLineData[];
}

/**
 * 分时图数据（价格线）
 */
export interface LineChartData {
  timestamp: number;
  value: number;
}

/**
 * 成交量数据
 */
export interface VolumeChartData {
  timestamp: number;
  value: number;
  color?: string;
}

/**
 * 分时图响应
 */
export interface TimelineResponse {
  symbol: string;
  lineData: LineChartData[];
  volumeData: VolumeChartData[];
}

/**
 * 完整K线图表数据（含均线）
 */
export interface KLineChartData {
  candlestick: KLineData[];
  volume: VolumeChartData[];
  ma5?: { timestamp: number; value: number }[];
  ma10?: { timestamp: number; value: number }[];
  ma20?: { timestamp: number; value: number }[];
  ma60?: { timestamp: number; value: number }[];
  ma120?: { timestamp: number; value: number }[];
}

/**
 * 实时行情
 */
export interface StockQuote {
  symbol: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  turnover?: number;
  week52High?: number;
  week52Low?: number;
  peRatio?: number;
  dividendYield?: number;
  updatedAt: string;
}

/**
 * 股票服务类
 */
class StockService {
  /**
   * 获取股票列表
   * @param page - 页码
   * @param limit - 每页数量
   * @param filters - 过滤条件
   */
  async getStockList(
    page: number = 1,
    limit: number = 50,
    filters?: { sector?: string; region?: string }
  ): Promise<StockListResponse> {
    const response = await http.get<StockListResponse>('/stocks', {
      page,
      limit,
      ...filters,
    });
    return response.data;
  }

  /**
   * 搜索股票
   * @param request - 搜索请求参数
   */
  async searchStock(request: StockSearchRequest): Promise<StockListResponse> {
    const response = await http.get<StockListResponse>('/stocks/search', {
      keyword: request.keyword,
      type: request.type,
      page: request.page || 1,
      limit: request.limit || 20,
    });
    return response.data;
  }

  /**
   * 根据股票代码获取股票详情
   * @param symbol - 股票代码
   */
  async getStockBySymbol(symbol: string): Promise<Stock | null> {
    try {
      const response = await http.get<{ stock: Stock }>(`/stocks/${symbol}`);
      return response.data?.stock || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取股票详细信息（包含更多字段）
   * @param symbol - 股票代码
   */
  async getStockDetail(symbol: string): Promise<StockDetail | null> {
    try {
      const response = await http.get<{ stock: StockDetail }>(`/stocks/${symbol}`);
      return response.data?.stock || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取股票实时行情
   * @param symbol - 股票代码
   */
  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const response = await http.get<{ quote: StockQuote }>(`/stocks/${symbol}/quote`);
      return response.data?.quote || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取股票K线数据
   * @param symbol - 股票代码
   * @param period - 周期 (day/week/month)
   * @param start - 开始日期 (YYYY-MM-DD)
   * @param end - 结束日期 (YYYY-MM-DD)
   */
  async getKLineData(
    symbol: string,
    period: 'day' | 'week' | 'month' = 'day',
    start?: string,
    end?: string
  ): Promise<KLineData[]> {
    try {
      const response = await http.get<KLineResponse>(`/stocks/${symbol}/kline`, {
        period,
        start,
        end,
      });
      return response.data?.data || [];
    } catch {
      return [];
    }
  }

  /**
   * 获取完整K线图表数据（含均线）
   * @param symbol - 股票代码
   * @param period - 周期 (day/week/month)
   * @param days - 获取天数
   */
  async getKLineChartData(
    symbol: string,
    period: 'day' | 'week' | 'month' = 'day',
    days: number = 120
  ): Promise<KLineChartData | null> {
    try {
      const response = await http.get<{ data: KLineChartData }>(`/stocks/${symbol}/kline/full`, {
        period,
        days,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取分时图数据（价格线 + 成交量）
   * @param symbol - 股票代码
   * @param days - 获取天数（默认1天即当日分时）
   */
  async getTimelineData(
    symbol: string,
    days: number = 1
  ): Promise<TimelineResponse | null> {
    try {
      const response = await http.get<{ data: TimelineResponse }>(`/stocks/${symbol}/timeline`, {
        days,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取行业指数K线数据
   * @param sector - 行业代码
   * @param period - 周期
   * @param days - 天数
   */
  async getIndustryKLine(
    sector: string,
    period: 'day' | 'week' | 'month' = 'day',
    days: number = 120
  ): Promise<KLineChartData | null> {
    try {
      const response = await http.get<{ data: KLineChartData }>(`/stocks/industry/${sector}/kline`, {
        period,
        days,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取大盘指数K线数据
   * @param index - 指数代码（如 SPX, DJI, IXIC）
   * @param period - 周期
   * @param days - 天数
   */
  async getMarketIndexKLine(
    index: string = 'SPX',
    period: 'day' | 'week' | 'month' = 'day',
    days: number = 120
  ): Promise<KLineChartData | null> {
    try {
      const response = await http.get<{ data: KLineChartData }>(`/stocks/market/${index}/kline`, {
        period,
        days,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

  /**
   * 获取自选股列表
   */
  async getWatchlist(): Promise<WatchlistResponse> {
    const response = await http.get<WatchlistResponse>('/watchlist');
    return response.data;
  }

  /**
   * 添加到自选股
   * @param stock - 股票对象或股票信息
   */
  async addToWatchlist(stock: Stock | { symbol: string; name: string }): Promise<boolean> {
    try {
      const response = await http.post('/watchlist', {
        symbol: stock.symbol,
        name: stock.name,
      });
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * 从自选股移除
   * @param symbol - 股票代码
   */
  async removeFromWatchlist(symbol: string): Promise<boolean> {
    try {
      const response = await http.delete(`/watchlist/${symbol}`);
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * 调整自选股排序
   * @param items - 排序项
   */
  async sortWatchlist(items: Array<{ symbol: string; sortOrder: number }>): Promise<boolean> {
    try {
      const response = await http.put('/watchlist/sort', { items });
      return response.success;
    } catch {
      return false;
    }
  }
}

/**
 * 导出股票服务单例
 */
export const stockService = new StockService();

/**
 * 便捷方法：获取所有股票
 */
export const getAllStocks = async (): Promise<Stock[]> => {
  const response = await stockService.getStockList(1, 100);
  return response.stocks;
};

/**
 * 便捷方法：获取自选股
 */
export const getWatchlist = async (): Promise<Stock[]> => {
  const response = await stockService.getWatchlist();
  return response.watchlist;
};
