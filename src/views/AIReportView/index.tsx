import { FormEvent, useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { stockReportService } from '../../services/stockReportService';
import { stockService } from '../../services/stockService';
import { useStockReportPreferenceStore } from '../../store/useStockReportPreferenceStore';
import type { Stock } from '../../types/stock';
import type {
  ReportHorizon,
  ReportSignalStatus,
  StockOutlookReport,
} from '../../types/stockReport';
import {
  HORIZON_LABEL,
  RECOMMENDATION_LABEL,
  TRAFFIC_LIGHT_COLOR,
  TRAFFIC_LIGHT_LABEL,
  TRAFFIC_LIGHT_TINT,
  buildStockOutlookRequest,
  formatConfidence,
  formatGeneratedAt,
  normalizeProbability,
  shouldShowCandidates,
} from './reportUtils';

const SAMPLE_QUESTIONS = ['分析苹果走势', '英伟达明天会涨吗', '特斯拉适合长期拿吗'];

function getSignalIcon(status: ReportSignalStatus) {
  switch (status) {
    case 'green':
      return ShieldCheck;
    case 'yellow':
      return AlertTriangle;
    case 'red':
      return AlertTriangle;
  }
}

function PreferenceButton({
  value,
  active,
  onClick,
  compact = false,
}: {
  value: ReportHorizon;
  active: boolean;
  onClick: (value: ReportHorizon) => void;
  compact?: boolean;
}) {
  const description = value === 'short'
    ? '技术面、资金动向、明日概率'
    : '估值、财报、行业前景';

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex flex-col justify-center rounded-lg px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
        compact ? 'min-h-[58px] w-full sm:w-40' : 'min-h-[84px] flex-1'
      }`}
      style={{
        background: active ? 'var(--bg-active)' : 'var(--bg-secondary)',
        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      <span className="text-sm font-semibold">{HORIZON_LABEL[value]}</span>
      <span className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
        {description}
      </span>
    </button>
  );
}

function FirstUsePreference({
  onSelect,
}: {
  onSelect: (value: ReportHorizon) => void;
}) {
  return (
    <section
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-lg p-5"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
    >
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          第一次使用先选风格
        </div>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          选择后会自动记住，报告只保留你需要看的内容。
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <PreferenceButton value="short" active={false} onClick={onSelect} />
        <PreferenceButton value="long" active={false} onClick={onSelect} />
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section
      className="flex min-h-[360px] flex-col items-center justify-center rounded-lg px-6 text-center"
      style={{ border: '1px dashed var(--border-primary)', color: 'var(--text-muted)' }}
    >
      <BarChart3 className="mb-4 h-10 w-10" style={{ color: 'var(--text-disabled)' }} />
      <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
        输入一句股票问题，直接生成结论报告
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6">
        例如“分析苹果走势”。系统会把股票识别、关键风险灯和短/长线重点放在一页里。
      </p>
    </section>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      className="flex min-h-[300px] flex-col items-center justify-center rounded-lg px-6 text-center"
      style={{ background: 'rgba(var(--error-rgb), 0.08)', border: '1px solid rgba(var(--error-rgb), 0.35)' }}
    >
      <AlertTriangle className="mb-4 h-10 w-10" style={{ color: 'var(--error)' }} />
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        报告生成失败
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
      >
        <RefreshCw className="h-4 w-4" />
        重试
      </button>
    </section>
  );
}

function SignalSparkline({
  series,
  color,
}: {
  series?: Array<{ timestamp: number; value: number }>;
  color: string;
}) {
  const points = useMemo(() => {
    if (!series || series.length < 2) return '';

    const sorted = [...series].sort((a, b) => a.timestamp - b.timestamp);
    const min = Math.min(...sorted.map((item) => item.value));
    const max = Math.max(...sorted.map((item) => item.value));
    const span = max - min || 1;

    return sorted
      .map((item, index) => {
        const x = (index / (sorted.length - 1)) * 100;
        const y = 34 - ((item.value - min) / span) * 28;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [series]);

  if (!points) {
    return (
      <div
        className="mt-4 flex h-12 items-center justify-center rounded-md text-xs"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-disabled)' }}
      >
        暂无趋势图
      </div>
    );
  }

  return (
    <svg viewBox="0 0 100 40" className="mt-4 h-12 w-full" role="img" aria-label="趋势图">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrafficLightSection({ report }: { report: StockOutlookReport }) {
  return (
    <section className="grid gap-3 lg:grid-cols-3">
      {report.trafficLights.map((light) => {
        const Icon = getSignalIcon(light.status);
        const color = TRAFFIC_LIGHT_COLOR[light.status];

        return (
          <article
            key={light.key}
            className="rounded-lg p-4"
            style={{
              background: 'var(--bg-secondary)',
              border: `1px solid ${light.status === 'red' ? 'rgba(var(--error-rgb), 0.48)' : 'var(--border-primary)'}`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: TRAFFIC_LIGHT_TINT[light.status], color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {light.title}
                  </h3>
                </div>
                <p className="mt-3 text-2xl font-semibold" style={{ color }}>
                  {TRAFFIC_LIGHT_LABEL[light.status]}
                </p>
              </div>
              <div className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: TRAFFIC_LIGHT_TINT[light.status], color }}>
                {light.value}
              </div>
            </div>
            <p className="mt-3 min-h-[44px] text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
              {light.reason}
            </p>
            <SignalSparkline series={light.series} color={color} />
          </article>
        );
      })}
    </section>
  );
}

function RecommendationSection({ report }: { report: StockOutlookReport }) {
  const color = TRAFFIC_LIGHT_COLOR[report.recommendation.highlight];
  const isBearish = report.recommendation.action === 'bearish' || report.recommendation.action === 'avoid';
  const TrendIcon = isBearish ? TrendingDown : report.recommendation.action === 'neutral' ? HelpCircle : TrendingUp;

  return (
    <section
      className="rounded-lg p-5"
      style={{
        background: TRAFFIC_LIGHT_TINT[report.recommendation.highlight],
        border: `1px solid ${color}`,
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ background: 'var(--bg-primary)', color }}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {RECOMMENDATION_LABEL[report.recommendation.action]}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              置信度 {formatConfidence(report.recommendation.confidence)}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold leading-8" style={{ color: 'var(--text-primary)' }}>
            {report.recommendation.title}
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
            {report.recommendation.summary}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1 rounded-lg px-3 py-2" style={{ background: 'var(--bg-primary)' }}>
          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>识别股票</span>
          <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {report.resolvedStock.symbol}
          </span>
          <span className="max-w-[180px] truncate text-xs" style={{ color: 'var(--text-muted)' }}>
            {report.resolvedStock.name}
          </span>
        </div>
      </div>
    </section>
  );
}

function FocusSection({
  report,
  horizon,
}: {
  report: StockOutlookReport;
  horizon: ReportHorizon;
}) {
  const up = normalizeProbability(report.shortTerm?.nextDayProbability.up ?? 0);
  const down = normalizeProbability(report.shortTerm?.nextDayProbability.down ?? 0);

  if (horizon === 'short') {
    return (
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>技术面</h3>
          <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
            {report.shortTerm?.technical || '技术面数据暂缺'}
          </p>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>资金动向</h3>
          <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
            {report.shortTerm?.capitalFlow || '资金动向数据暂缺'}
          </p>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>明日涨跌概率</h3>
          <div className="mt-4 space-y-3">
            <ProbabilityBar label="上涨" value={up} color="var(--success)" />
            <ProbabilityBar label="下跌" value={down} color="var(--error)" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>估值</h3>
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          {report.longTerm?.valuation || '估值数据暂缺'}
        </p>
      </div>
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>财报</h3>
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          {report.longTerm?.earnings || '财报数据暂缺'}
        </p>
      </div>
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>行业前景</h3>
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          {report.longTerm?.industryOutlook || '行业前景数据暂缺'}
        </p>
      </div>
    </section>
  );
}

function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="font-mono" style={{ color }}>{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-primary)' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function DataQualitySection({ report }: { report: StockOutlookReport }) {
  if (!report.dataQuality.length) return null;

  return (
    <section className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>数据状态</h3>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {report.dataQuality.map((item) => {
          const isMissing = item.status === 'missing';
          const Icon = item.status === 'ok' ? CheckCircle2 : isMissing ? AlertTriangle : Clock;
          const color = item.status === 'ok' ? 'var(--success)' : isMissing ? 'var(--error)' : 'var(--warning)';

          return (
            <div key={`${item.key}-${item.status}`} className="flex items-start gap-2 rounded-md px-3 py-2" style={{ background: 'var(--bg-primary)' }}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
              <div className="min-w-0">
                <div className="text-xs font-medium" style={{ color: isMissing ? 'var(--error)' : 'var(--text-secondary)' }}>
                  {item.key}
                </div>
                <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
                  {isMissing ? `数据源暂缺：${item.message}` : item.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CandidateStrip({
  candidates,
  onSelect,
}: {
  candidates: Stock[];
  onSelect: (stock: Stock) => void;
}) {
  if (!candidates.length) return null;

  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(var(--warning-rgb), 0.1)', border: '1px solid rgba(var(--warning-rgb), 0.35)' }}>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        <AlertTriangle className="h-4 w-4" style={{ color: 'var(--warning)' }} />
        股票识别置信度偏低，可点一个候选重跑
      </div>
      <div className="flex flex-wrap gap-2">
        {candidates.slice(0, 3).map((stock) => (
          <button
            type="button"
            key={stock.symbol}
            onClick={() => onSelect(stock)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
          >
            <span className="font-mono">{stock.symbol}</span>
            <span>{stock.name}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReportView({
  report,
  horizon,
}: {
  report: StockOutlookReport;
  horizon: ReportHorizon;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>
          {report.resolvedStock.sector || '未标注行业'} · 识别置信度 {formatConfidence(report.resolvedStock.confidence)}
        </span>
        <span>生成时间 {formatGeneratedAt(report.generatedAt)}</span>
      </div>
      <RecommendationSection report={report} />
      <TrafficLightSection report={report} />
      <FocusSection report={report} horizon={horizon} />
      <DataQualitySection report={report} />
    </div>
  );
}

export function AIReportView() {
  const { horizon, setHorizon } = useStockReportPreferenceStore();
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<StockOutlookReport | null>(null);
  const [reportHorizon, setReportHorizon] = useState<ReportHorizon | null>(null);
  const [candidates, setCandidates] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{ query: string; symbol?: string } | null>(null);

  const activeHorizon = horizon || 'short';
  const canSubmit = !!horizon && query.trim().length > 0 && !isLoading;

  const loadCandidates = useCallback(async (keyword: string) => {
    try {
      const response = await stockService.searchStock({ keyword, limit: 3 });
      setCandidates(response.stocks.slice(0, 3));
    } catch {
      setCandidates([]);
    }
  }, []);

  const requestReport = useCallback(async (rawQuery: string, symbol?: string) => {
    if (!horizon) return;
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setCandidates([]);
    setLastRequest({ query: trimmed, symbol });

    try {
      const result = await stockReportService.getOutlookReport(
        buildStockOutlookRequest(trimmed, horizon, symbol),
      );
      setReport(result);
      setReportHorizon(horizon);
      if (shouldShowCandidates(result.resolvedStock.confidence)) {
        await loadCandidates(trimmed);
      }
    } catch (err) {
      setReport(null);
      setReportHorizon(null);
      setError(err instanceof Error ? err.message : '请检查后端聚合接口 /api/stock-reports/outlook 是否可用');
    } finally {
      setIsLoading(false);
    }
  }, [horizon, loadCandidates]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    requestReport(query);
  };

  const handleCandidateSelect = (stock: Stock) => {
    const nextQuery = `${stock.symbol} ${stock.name}`;
    setQuery(nextQuery);
    requestReport(nextQuery, stock.symbol);
  };

  const handleRetry = () => {
    if (lastRequest) {
      requestReport(lastRequest.query, lastRequest.symbol);
    } else {
      requestReport(query);
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <main className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
              <Sparkles className="h-4 w-4" />
              AI研判
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal" style={{ color: 'var(--text-primary)' }}>
              一句话生成股票走势报告
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
              自动识别股票类型和代码，优先输出结论、红绿灯风险和关键依据。
            </p>
          </div>

          {horizon && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <PreferenceButton value="short" active={activeHorizon === 'short'} onClick={setHorizon} compact />
              <PreferenceButton value="long" active={activeHorizon === 'long'} onClick={setHorizon} compact />
            </div>
          )}
        </header>

        {!horizon ? (
          <FirstUsePreference onSelect={setHorizon} />
        ) : (
          <>
            <section className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-disabled)' }} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="例如：分析苹果走势"
                    className="h-11 w-full rounded-lg pl-10 pr-4 text-sm outline-none transition-colors"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'var(--accent-primary)', color: 'white' }}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  生成报告
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((sample) => (
                  <button
                    type="button"
                    key={sample}
                    onClick={() => setQuery(sample)}
                    className="rounded-md px-2.5 py-1 text-xs transition-colors"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </section>

            <CandidateStrip candidates={candidates} onSelect={handleCandidateSelect} />

            {isLoading ? (
              <section
                className="flex min-h-[360px] items-center justify-center rounded-lg"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <div className="flex flex-col items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
                  正在拉取聚合数据并生成{HORIZON_LABEL[activeHorizon]}报告
                </div>
              </section>
            ) : error ? (
              <ErrorState message={error} onRetry={handleRetry} />
            ) : report ? (
              <ReportView report={report} horizon={reportHorizon || activeHorizon} />
            ) : (
              <EmptyState />
            )}
          </>
        )}

        <footer className="flex items-start gap-2 pb-4 text-xs leading-5" style={{ color: 'var(--text-disabled)' }}>
          <Circle className="mt-1 h-2 w-2 shrink-0" />
          报告仅作为辅助研判展示，不包含下单、组合管理或实时预警。
        </footer>
      </main>
    </div>
  );
}
