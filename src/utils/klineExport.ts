import type { KLineDataItem } from '../store/useChartStore';

interface ExportMeta {
  symbol: string;
  timeframe: string;
  startTime: string;
  endTime: string;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 19);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}

function buildFilename(rows: KLineDataItem[], meta: ExportMeta, ext: string): string {
  const firstTs = rows.length > 0 ? rows[0].timestamp : Date.now();
  const lastTs = rows.length > 0 ? rows[rows.length - 1].timestamp : Date.now();
  const start = new Date(firstTs).toISOString().slice(0, 10);
  const end = new Date(lastTs).toISOString().slice(0, 10);
  return sanitizeFilename(`${meta.symbol}_${meta.timeframe}_${start}_${end}`) + `.${ext}`;
}

export function buildKLineCsv(rows: KLineDataItem[], meta: ExportMeta): string {
  const header = 'timestamp,datetime,open,high,low,close,volume,symbol,timeframe';
  const lines = rows.map((r) =>
    [
      r.timestamp,
      formatTimestamp(r.timestamp),
      r.open,
      r.high,
      r.low,
      r.close,
      r.volume,
      meta.symbol,
      meta.timeframe,
    ].join(',')
  );
  return [header, ...lines].join('\n');
}

export function buildKLineJson(rows: KLineDataItem[], meta: ExportMeta): string {
  const payload = {
    symbol: meta.symbol,
    timeframe: meta.timeframe,
    startTime: meta.startTime,
    endTime: meta.endTime,
    count: rows.length,
    data: rows.map((r) => ({
      timestamp: r.timestamp,
      datetime: formatTimestamp(r.timestamp),
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBlob(filename: string, mimeType: string, content: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportKLineCsv(rows: KLineDataItem[], meta: ExportMeta): void {
  const csv = buildKLineCsv(rows, meta);
  downloadBlob(buildFilename(rows, meta, 'csv'), 'text/csv;charset=utf-8', csv);
}

export function exportKLineJson(rows: KLineDataItem[], meta: ExportMeta): void {
  const json = buildKLineJson(rows, meta);
  downloadBlob(buildFilename(rows, meta, 'json'), 'application/json;charset=utf-8', json);
}
