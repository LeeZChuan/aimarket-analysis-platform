/**
 * 技术指标菜单组件
 *
 * 功能：
 * - 技术指标选择菜单（下拉面板）
 * - 主图指标（MA/EMA/BOLL/SAR）
 * - 副图指标（VOL/MACD/RSI/KDJ/CCI/DMI）
 * - 指标激活状态显示
 * - 点击切换指标开关
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表顶部工具栏右侧
 */

import { useRef, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

export interface IndicatorOption {
  name: string;
  label: string;
  description: string;
}

interface IndicatorMenuProps {
  activeIndicators: string[];
  onToggleIndicator: (indicator: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  position?: 'top' | 'bottom';
}

export function IndicatorMenu({ activeIndicators, onToggleIndicator, isOpen, onToggle, position = 'top' }: IndicatorMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const mainIndicators: IndicatorOption[] = [
    { name: 'MA', label: 'MA', description: '移动平均线' },
    { name: 'EMA', label: 'EMA', description: '指数移动平均' },
    { name: 'BOLL', label: 'BOLL', description: '布林带' },
    { name: 'SAR', label: 'SAR', description: '抛物线转向' },
  ];

  const subIndicators: IndicatorOption[] = [
    { name: 'VOL', label: 'VOL', description: '成交量' },
    { name: 'MACD', label: 'MACD', description: '指数平滑异同移动平均线' },
    { name: 'RSI', label: 'RSI', description: '相对强弱指标' },
    { name: 'KDJ', label: 'KDJ', description: '随机指标' },
    { name: 'CCI', label: 'CCI', description: '顺势指标' },
    { name: 'DMI', label: 'DMI', description: '动向指标' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="px-2 py-0.5 rounded text-[10px] transition-colors flex items-center gap-1"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.borderColor = 'var(--border-primary)';
        }}
        title="技术指标"
      >
        <BarChart3 className="w-3 h-3" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 rounded-lg shadow-xl p-3 z-50 min-w-[240px] animate-in fade-in duration-200 ${
            position === 'bottom' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="space-y-3">
            <div>
              <h3 className="text-[10px] mb-2 font-medium" style={{ color: 'var(--text-disabled)' }}>主图指标</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {mainIndicators.map((indicator) => (
                  <button
                    key={indicator.name}
                    onClick={() => onToggleIndicator(indicator.name)}
                    className="px-2 py-1.5 text-[10px] font-medium rounded transition-all text-left"
                    style={
                      activeIndicators.includes(indicator.name)
                        ? {
                            background: 'var(--bg-active)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                          }
                        : {
                            background: 'var(--bg-primary)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-primary)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!activeIndicators.includes(indicator.name)) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!activeIndicators.includes(indicator.name)) {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }
                    }}
                    title={indicator.description}
                  >
                    <div className="font-semibold">{indicator.label}</div>
                    <div className="text-[9px] opacity-70">{indicator.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px" style={{ background: 'var(--border-primary)' }} />

            <div>
              <h3 className="text-[10px] mb-2 font-medium" style={{ color: 'var(--text-disabled)' }}>副图指标</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {subIndicators.map((indicator) => (
                  <button
                    key={indicator.name}
                    onClick={() => onToggleIndicator(indicator.name)}
                    className="px-2 py-1.5 text-[10px] font-medium rounded transition-all text-left"
                    style={
                      activeIndicators.includes(indicator.name)
                        ? {
                            background: 'var(--bg-active)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                          }
                        : {
                            background: 'var(--bg-primary)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-primary)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!activeIndicators.includes(indicator.name)) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!activeIndicators.includes(indicator.name)) {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }
                    }}
                    title={indicator.description}
                  >
                    <div className="font-semibold">{indicator.label}</div>
                    <div className="text-[9px] opacity-70">{indicator.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
