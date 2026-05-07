import { http } from './request';
import type { StockOutlookReport, StockOutlookRequest } from '../types/stockReport';

class StockReportService {
  async getOutlookReport(request: StockOutlookRequest): Promise<StockOutlookReport> {
    const response = await http.post<StockOutlookReport>('/stock-reports/outlook', request);
    return response.data;
  }
}

export const stockReportService = new StockReportService();
