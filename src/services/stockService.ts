/**
 * 股票服务
 * 提供股票、自选股的查询和管理接口
 */

import {
  Stock,
  StockListResponse,
  WatchlistResponse,
  StockSearchRequest,
} from '../types/stock';
import {
  MOCK_STOCKS,
  MOCK_WATCHLIST,
  searchStocks,
} from '../mock/stockData';

/**
 * 股票服务类
 */
class StockService {
  /**
   * 获取股票列表
   * @param page - 页码（可选）
   * @param limit - 每页数量（可选）
   * @returns Promise<StockListResponse>
   */
  async getStockList(page: number = 1, limit: number = 50): Promise<StockListResponse> {
    await this.delay(300);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStocks = MOCK_STOCKS.slice(startIndex, endIndex);

    return {
      stocks: paginatedStocks,
      total: MOCK_STOCKS.length,
      timestamp: Date.now(),
    };
  }


  /**
   * 获取自选股列表
   * @returns Promise<WatchlistResponse>
   */
  async getWatchlist(): Promise<WatchlistResponse> {
    await this.delay(200);

    return {
      watchlist: MOCK_WATCHLIST,
      total: MOCK_WATCHLIST.length,
      timestamp: Date.now(),
    };
  }

  /**
   * 搜索股票
   * @param request - 搜索请求参数
   * @returns Promise<StockListResponse>
   */
  async searchStock(request: StockSearchRequest): Promise<StockListResponse> {
    await this.delay(300);

    const results = searchStocks(request.keyword, MOCK_STOCKS);

    const page = request.page || 1;
    const limit = request.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      stocks: paginatedResults,
      total: results.length,
      timestamp: Date.now(),
    };
  }


  /**
   * 根据股票代码获取股票详情
   * @param symbol - 股票代码
   * @returns Promise<Stock | null>
   */
  async getStockBySymbol(symbol: string): Promise<Stock | null> {
    await this.delay(200);

    const stock = MOCK_STOCKS.find(
      (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
    );

    return stock || null;
  }


  /**
   * 添加到自选股（Mock实现，实际应该调用API）
   * @param stock - 股票对象
   * @returns Promise<boolean>
   */
  async addToWatchlist(stock: Stock): Promise<boolean> {
    await this.delay(200);
    return true;
  }

  /**
   * 从自选股移除（Mock实现，实际应该调用API）
   * @param symbol - 股票代码
   * @returns Promise<boolean>
   */
  async removeFromWatchlist(symbol: string): Promise<boolean> {
    await this.delay(200);
    return true;
  }

  /**
   * 模拟网络延迟
   * @param ms - 延迟毫秒数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

