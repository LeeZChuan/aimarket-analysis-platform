/**
 * 时间周期选择器组件
 *
 * 功能：
 * - 提供时间周期切换按钮组（1D/5D/1W/1M/3M/1Y）
 * - 高亮当前选中周期
 * - 点击切换不同时间周期
 *
 * 使用位置：
 * - /components/ChartPanel/index.tsx - 图表顶部工具栏
 */

export type TimeRange = '1D' | '5D' | '1W' | '1M' | '3M' | '1Y';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TIME_RANGES: { value: TimeRange; label: string; description: string }[] = [
  { value: '1D', label: '1D', description: '日线' },
  { value: '5D', label: '5D', description: '5日线' },
  { value: '1W', label: '1W', description: '周线' },
  { value: '1M', label: '1M', description: '月线' },
  { value: '3M', label: '3M', description: '季线' },
  { value: '1Y', label: '1Y', description: '年线' },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-0.5">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
            value === range.value
              ? 'bg-[#3A9FFF]/20 text-[#3A9FFF] border border-[#3A9FFF]/50'
              : 'text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]/50 border border-transparent'
          }`}
          title={`查看${range.description}`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
