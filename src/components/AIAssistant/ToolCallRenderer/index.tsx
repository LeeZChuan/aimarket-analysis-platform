import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import type { ToolCallUIState } from '../../../types/conversation';

interface ToolCallRendererProps {
  toolCalls: ToolCallUIState[];
  /** 是否正在进行中（还有工具未完成） */
  isActive?: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  get_stock_data: '查询股票数据',
  get_kline_data: '获取K线数据',
  calc_technical_indicators: '计算技术指标',
  search_stocks: '搜索股票',
};

function ToolCallCard({ tc }: { tc: ToolCallUIState }) {
  const [expanded, setExpanded] = useState(false);
  const label = TOOL_LABELS[tc.toolName] ?? tc.toolName;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 overflow-hidden text-xs">
      {/* 标题行 */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
      >
        {/* 状态图标 */}
        {tc.status === 'loading' ? (
          <Loader2 className="size-3.5 text-blue-500 animate-spin shrink-0" />
        ) : tc.status === 'error' ? (
          <XCircle className="size-3.5 text-destructive shrink-0" />
        ) : (
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
        )}

        <Wrench className="size-3 text-muted-foreground shrink-0" />
        <span className="font-medium text-foreground/80">{label}</span>

        {/* 简要参数预览 */}
        <span className="text-muted-foreground truncate flex-1">
          {formatInputPreview(tc.input)}
        </span>

        {expanded ? (
          <ChevronDown className="size-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-3 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* 展开详情 */}
      {expanded && (
        <div className="border-t border-border/40 px-3 py-2 space-y-2 bg-background/40">
          {/* 输入参数 */}
          <div>
            <div className="text-muted-foreground mb-1">参数</div>
            <pre className="text-[11px] text-foreground/70 whitespace-pre-wrap break-all font-mono bg-muted/40 rounded p-2">
              {JSON.stringify(tc.input, null, 2)}
            </pre>
          </div>

          {/* 工具结果 */}
          {tc.result && (
            <div>
              <div className={`mb-1 ${tc.isError ? 'text-destructive' : 'text-muted-foreground'}`}>
                {tc.isError ? '错误' : '结果'}
              </div>
              <pre className="text-[11px] text-foreground/70 whitespace-pre-wrap break-all font-mono bg-muted/40 rounded p-2 max-h-48 overflow-y-auto">
                {tc.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatInputPreview(input: Record<string, unknown>): string {
  const entries = Object.entries(input);
  if (entries.length === 0) return '';
  return entries
    .slice(0, 2)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ');
}

export function ToolCallRenderer({ toolCalls, isActive }: ToolCallRendererProps) {
  if (toolCalls.length === 0) return null;

  const loadingCount = toolCalls.filter(tc => tc.status === 'loading').length;
  const doneCount = toolCalls.filter(tc => tc.status === 'done').length;
  const errorCount = toolCalls.filter(tc => tc.status === 'error').length;

  return (
    <div className="space-y-1.5 my-2">
      {/* 汇总标题 */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Wrench className="size-3" />
        <span>
          {isActive && loadingCount > 0
            ? `正在调用工具... (${doneCount + errorCount}/${toolCalls.length})`
            : `调用了 ${toolCalls.length} 个工具`}
        </span>
        {errorCount > 0 && (
          <span className="text-destructive">({errorCount} 个失败)</span>
        )}
      </div>

      {/* 工具卡片列表 */}
      <div className="space-y-1">
        {toolCalls.map(tc => (
          <ToolCallCard key={tc.toolUseId} tc={tc} />
        ))}
      </div>
    </div>
  );
}
