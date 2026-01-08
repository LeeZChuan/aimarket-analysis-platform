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

import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

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
    <Tabs value={value} onValueChange={(val) => onChange(val as TimeRange)}>
      <TabsList className="h-7">
        {TIME_RANGES.map((range) => (
          <TabsTrigger
            key={range.value}
            value={range.value}
            className="px-2 py-0.5 text-[10px]"
            title={`查看${range.description}`}
          >
            {range.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
