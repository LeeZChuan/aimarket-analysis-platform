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
}

export function IndicatorMenu({ activeIndicators, onToggleIndicator, isOpen, onToggle }: IndicatorMenuProps) {
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
        className="px-2 py-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[10px] text-gray-400 hover:text-white hover:border-[#3A9FFF] transition-colors flex items-center gap-1"
        title="技术指标"
      >
        <BarChart3 className="w-3 h-3" />
        <span>指标</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl p-3 z-50 min-w-[240px]">
          <div className="space-y-3">
            <div>
              <h3 className="text-[10px] text-gray-500 mb-2 font-medium">主图指标</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {mainIndicators.map((indicator) => (
                  <button
                    key={indicator.name}
                    onClick={() => onToggleIndicator(indicator.name)}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded transition-all text-left ${
                      activeIndicators.includes(indicator.name)
                        ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                        : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#2A2A2A] hover:border-[#3A3A3A]'
                    }`}
                    title={indicator.description}
                  >
                    <div className="font-semibold">{indicator.label}</div>
                    <div className="text-[9px] opacity-70">{indicator.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#2A2A2A]" />

            <div>
              <h3 className="text-[10px] text-gray-500 mb-2 font-medium">副图指标</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {subIndicators.map((indicator) => (
                  <button
                    key={indicator.name}
                    onClick={() => onToggleIndicator(indicator.name)}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded transition-all text-left ${
                      activeIndicators.includes(indicator.name)
                        ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
                        : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#2A2A2A] hover:border-[#3A3A3A]'
                    }`}
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
