export type ReportHorizon = 'short' | 'long';

export type ReportTrafficLightKey = 'fx' | 'capital_flow' | 'institution_holding';
export type ReportSignalStatus = 'green' | 'yellow' | 'red';
export type ReportRecommendationAction = 'bullish' | 'neutral' | 'bearish' | 'avoid';
export type ReportDataQualityStatus = 'ok' | 'partial' | 'missing';

export interface StockOutlookRequest {
  query: string;
  symbol?: string;
  horizon: ReportHorizon;
  locale: 'zh-CN';
}

export interface StockOutlookReport {
  reportId: string;
  generatedAt: string;
  resolvedStock: {
    symbol: string;
    name: string;
    sector?: string;
    region?: string;
    confidence: number;
  };
  recommendation: {
    action: ReportRecommendationAction;
    title: string;
    summary: string;
    confidence: number;
    highlight: ReportSignalStatus;
  };
  trafficLights: Array<{
    key: ReportTrafficLightKey;
    status: ReportSignalStatus;
    title: string;
    value: string;
    reason: string;
    series?: Array<{ timestamp: number; value: number }>;
  }>;
  shortTerm?: {
    technical: string;
    capitalFlow: string;
    nextDayProbability: {
      up: number;
      down: number;
    };
  };
  longTerm?: {
    valuation: string;
    earnings: string;
    industryOutlook: string;
  };
  dataQuality: Array<{
    key: string;
    status: ReportDataQualityStatus;
    message: string;
  }>;
}
