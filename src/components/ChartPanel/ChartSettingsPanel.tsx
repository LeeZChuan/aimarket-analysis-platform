/**
 * 图表设置面板组件
 *
 * 功能：
 * - K线类型切换（蜡烛实心/空心、OHLC柱、面积图）
 * - 涨跌颜色方案切换（红涨绿跌 / 绿涨红跌）
 * - 网格线显示/隐藏开关
 * - 十字准线显示/隐藏开关
 * - 点击外部自动关闭（通过 anchorRef 排除触发按钮）
 *
 * 使用位置：
 * - /components/ChartPanel/ChartToolbar.tsx - 工具栏右侧设置按钮触发
 */

import { useRef, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

export type CandleType = 'candle_solid' | 'candle_stroke' | 'ohlc' | 'area';
export type ColorScheme = 'red_up' | 'green_up';

export interface ChartSettings {
  candleType: CandleType;
  colorScheme: ColorScheme;
  showGrid: boolean;
  showCrosshair: boolean;
}

export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  candleType: 'candle_solid',
  colorScheme: 'red_up',
  showGrid: true,
  showCrosshair: true,
};

interface ChartSettingsPanelProps {
  settings: ChartSettings;
  onChange: (settings: ChartSettings) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const CANDLE_TYPES: { value: CandleType; label: string; desc: string }[] = [
  { value: 'candle_solid', label: '蜡烛实心', desc: '经典实心蜡烛图' },
  { value: 'candle_stroke', label: '蜡烛空心', desc: '空心描边蜡烛图' },
  { value: 'ohlc', label: 'OHLC 柱', desc: '开高低收四价柱' },
  { value: 'area', label: '面积图', desc: '折线面积填充图' },
];

const COLOR_SCHEMES: { value: ColorScheme; label: string; up: string; down: string }[] = [
  { value: 'red_up', label: '红涨绿跌', up: '#EF5350', down: '#26A69A' },
  { value: 'green_up', label: '绿涨红跌', up: '#26A69A', down: '#EF5350' },
];

export function ChartSettingsPanel({ settings, onChange, onClose, anchorRef }: ChartSettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  const update = <K extends keyof ChartSettings>(key: K, value: ChartSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div
      ref={panelRef}
      className="absolute z-[9999] rounded-xl shadow-2xl overflow-hidden"
      style={{
        bottom: 'calc(100% + 8px)',
        right: 0,
        width: '260px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          图表设置
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { color: 'var(--text-primary)', background: 'var(--bg-hover)' })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { color: 'var(--text-muted)', background: 'transparent' })}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-4">

        {/* K线类型 */}
        <section>
          <div className="text-[11px] font-medium mb-2 px-1" style={{ color: 'var(--text-disabled)' }}>
            K线类型
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CANDLE_TYPES.map((ct) => {
              const active = settings.candleType === ct.value;
              return (
                <button
                  key={ct.value}
                  onClick={() => update('candleType', ct.value)}
                  className="flex flex-col items-start px-2.5 py-2 rounded-lg text-left transition-all"
                  style={{
                    background: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    color: active ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  <span className="text-[11px] font-semibold leading-none mb-0.5">{ct.label}</span>
                  <span className="text-[10px] leading-none" style={{ opacity: active ? 0.85 : 0.6 }}>{ct.desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 涨跌色 */}
        <section>
          <div className="text-[11px] font-medium mb-2 px-1" style={{ color: 'var(--text-disabled)' }}>
            涨跌颜色
          </div>
          <div className="flex gap-2">
            {COLOR_SCHEMES.map((cs) => {
              const active = settings.colorScheme === cs.value;
              return (
                <button
                  key={cs.value}
                  onClick={() => update('colorScheme', cs.value)}
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: active ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                    border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                  }}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2.5 h-4 rounded-sm" style={{ background: cs.up }} />
                    <div className="w-2.5 h-4 rounded-sm" style={{ background: cs.down }} />
                  </div>
                  <span className="text-[11px]" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {cs.label}
                  </span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: 'var(--accent-primary)' }} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 显示控制 */}
        <section>
          <div className="text-[11px] font-medium mb-2 px-1" style={{ color: 'var(--text-disabled)' }}>
            显示控制
          </div>
          <div className="flex flex-col gap-1">
            {[
              { key: 'showGrid' as const, label: '网格线' },
              { key: 'showCrosshair' as const, label: '十字准线' },
            ].map(({ key, label }) => {
              const active = settings[key] as boolean;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                >
                  <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <button
                    onClick={() => update(key, !active)}
                    className="relative w-9 h-5 rounded-full transition-all duration-200"
                    style={{
                      background: active ? 'var(--accent-primary)' : 'var(--bg-hover)',
                      border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{ left: active ? 'calc(100% - 16px)' : '1px' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
