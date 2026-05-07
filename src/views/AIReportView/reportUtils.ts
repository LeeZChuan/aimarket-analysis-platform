import type {
  ReportHorizon,
  ReportRecommendationAction,
  ReportSignalStatus,
  StockOutlookRequest,
} from '../../types/stockReport';

export const LOW_CONFIDENCE_THRESHOLD = 0.7;

export const HORIZON_LABEL: Record<ReportHorizon, string> = {
  short: '短线',
  long: '长线',
};

export const RECOMMENDATION_LABEL: Record<ReportRecommendationAction, string> = {
  bullish: '看涨',
  neutral: '观望',
  bearish: '看跌',
  avoid: '回避',
};

export const TRAFFIC_LIGHT_LABEL: Record<ReportSignalStatus, string> = {
  green: '安全',
  yellow: '关注',
  red: '危险',
};

export const TRAFFIC_LIGHT_COLOR: Record<ReportSignalStatus, string> = {
  green: 'var(--success)',
  yellow: 'var(--warning)',
  red: 'var(--error)',
};

export const TRAFFIC_LIGHT_TINT: Record<ReportSignalStatus, string> = {
  green: 'rgba(var(--success-rgb), 0.12)',
  yellow: 'rgba(var(--warning-rgb), 0.14)',
  red: 'rgba(var(--error-rgb), 0.12)',
};

export const FOCUS_LABELS: Record<ReportHorizon, string[]> = {
  short: ['技术面', '资金动向', '明日涨跌概率'],
  long: ['估值', '财报', '行业前景'],
};

export function buildStockOutlookRequest(
  query: string,
  horizon: ReportHorizon,
  symbol?: string,
): StockOutlookRequest {
  const trimmed = query.trim();
  return {
    query: trimmed,
    symbol,
    horizon,
    locale: 'zh-CN',
  };
}

export function shouldShowCandidates(confidence: number): boolean {
  return confidence < LOW_CONFIDENCE_THRESHOLD;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function formatGeneratedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function normalizeProbability(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > 1) return Math.max(0, Math.min(100, value));
  return Math.max(0, Math.min(100, value * 100));
}

export function getVisibleFocusLabels(horizon: ReportHorizon): string[] {
  return FOCUS_LABELS[horizon];
}
