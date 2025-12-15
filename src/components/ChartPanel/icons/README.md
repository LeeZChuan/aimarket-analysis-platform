# 自定义绘图工具图标

这个文件夹包含与 lucide-react 风格一致的自定义 SVG 图标。

## 为什么需要自定义图标？

lucide-react 库中没有提供某些特定的绘图工具图标（如水平线段、垂直射线等），所以我们创建了自定义图标来保持 UI 的一致性。

## 图标规范

所有自定义图标遵循 lucide-react 的设计规范：
- **视图框**: 24x24
- **描边宽度**: 2px
- **描边样式**: round cap + round join
- **颜色**: 使用 `currentColor` 继承父元素颜色
- **填充**: 默认为 none，需要填充时使用 `currentColor`

## 可用图标

### 水平线工具
- `HorizontalLine` - 水平直线 ➖
- `HorizontalRayLine` - 水平射线（左端点 + 右箭头）
- `HorizontalSegment` - 水平线段（两端都有点）

### 垂直线工具
- `VerticalLine` - 垂直直线 |
- `VerticalRayLine` - 垂直射线（上端点 + 下箭头）
- `VerticalSegment` - 垂直线段（两端都有点）

### 斜线工具
- `DiagonalLine` - 斜直线 /
- `DiagonalRayLine` - 斜射线（左下端点 + 右上箭头）
- `DiagonalSegment` - 斜线段（两端都有点）

### 其他工具
- `ParallelLines` - 平行线（两条水平线）
- `PriceChannel` - 价格通道（两条平行斜线）

## 使用方式

```tsx
import {
  HorizontalLine,
  HorizontalRayLine,
  HorizontalSegment,
  VerticalLine,
  VerticalRayLine,
  VerticalSegment,
  DiagonalLine,
  DiagonalRayLine,
  DiagonalSegment,
  ParallelLines,
  PriceChannel,
} from './icons/CustomIcons';

// 在组件中使用
<HorizontalLine className="w-4 h-4" />
<VerticalRayLine className="w-4 h-4 text-blue-500" />
```

## 添加新图标

如需添加新图标，请遵循以下步骤：

1. 在 `CustomIcons.tsx` 中创建新组件
2. 使用 24x24 viewBox
3. 设置 stroke="currentColor" 和 strokeWidth="2"
4. 使用 strokeLinecap="round" 和 strokeLinejoin="round"
5. 添加到 `CustomIcons` 导出对象中
6. 在此文档中更新图标列表

## 图标预览

你可以在 DrawingToolbar 左侧工具栏中查看所有图标的实际效果。

### 设计原则

- **简洁**: 使用最少的笔画表达含义
- **清晰**: 在小尺寸下也能清晰识别
- **一致**: 与 lucide-react 风格保持一致
- **语义化**: 图标形状直观表达工具功能

## 维护说明

- 修改图标时保持 lucide-react 风格
- 确保图标在不同颜色主题下都清晰可见
- 测试不同尺寸下的显示效果（16px, 20px, 24px）
- 保持代码注释清晰

