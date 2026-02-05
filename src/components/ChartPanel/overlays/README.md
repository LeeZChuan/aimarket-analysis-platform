# 图表自定义覆盖物 (Overlays)

这个文件夹包含基于 klinecharts v9 的自定义覆盖物（Overlay）插件。

## 目录结构

```
overlays/
├── README.md                      # 本文档
├── horizontalRegionSelection.ts   # 水平区域选择工具
├── rectOverlay.ts                 # 矩形绘制工具
├── circleOverlay.ts               # 圆形绘制工具
├── ellipseOverlay.ts              # 椭圆形绘制工具
└── triangleOverlay.ts             # 三角形绘制工具
```

## 内置 Overlay 与自定义 Overlay

### klinecharts v9 内置 Overlay

以下 overlay 可直接使用，无需自定义：
- 线条类：`horizontalRayLine`, `horizontalSegment`, `horizontalStraightLine`, `verticalRayLine`, `verticalSegment`, `verticalStraightLine`, `rayLine`, `segment`, `straightLine`
- 价格线：`priceLine`, `priceChannelLine`, `parallelStraightLine`
- 其他：`fibonacciLine`, `simpleAnnotation`, `simpleTag`

### 自定义 Overlay（本目录实现）

以下 overlay 需要自定义实现：
- `rect` - 矩形
- `circle` - 圆形
- `ellipse` - 椭圆形
- `triangle` - 三角形
- `horizontalRegionSelection` - 水平区域选择

## 各 Overlay 说明

### horizontalRegionSelection

**水平区域选择工具** - 允许用户在图表上框选一个区域用于分析。

功能特性：
- 可拖拽的矩形选择区域
- 左右两个拖拽手柄（蓝色圆形）用于调整宽度
- 左上角确认按钮（绿色）和关闭按钮（红色）
- 半透明蓝色背景高亮选中区域
- 使用几何图形替代图片，加载速度更快

### rectOverlay

**矩形绘制工具** - 在图表上绘制矩形区域。

- `totalStep: 3` - 需要2个点（对角线两端）
- 支持填充和边框样式
- 默认蓝色半透明填充

### circleOverlay

**圆形绘制工具** - 在图表上绘制圆形。

- `totalStep: 3` - 需要2个点（圆心和圆周上一点）
- 半径由两点距离计算
- 支持填充和边框样式

### ellipseOverlay

**椭圆形绘制工具** - 在图表上绘制椭圆形。

- `totalStep: 3` - 需要2个点（左上角和右下角）
- 绘制完成后自动生成4个控制点（左、右、上、下）
- 4个控制点位于椭圆边缘，可独立拖动调整椭圆形状
- 支持填充和边框样式

### triangleOverlay

**三角形绘制工具** - 在图表上绘制三角形。

- `totalStep: 4` - 需要3个点（三个顶点）
- 绘制过程中显示连接线
- 支持填充和边框样式

## 使用方式

### 1. 注册 Overlay

```typescript
import { registerOverlay } from 'klinecharts';
import { rectOverlay } from './overlays/rectOverlay';
import { circleOverlay } from './overlays/circleOverlay';
import { ellipseOverlay } from './overlays/ellipseOverlay';
import { triangleOverlay } from './overlays/triangleOverlay';

// 在组件初始化时注册
useEffect(() => {
  registerOverlay(rectOverlay);
  registerOverlay(circleOverlay);
  registerOverlay(ellipseOverlay);
  registerOverlay(triangleOverlay);
}, []);
```

### 2. 创建 Overlay 实例

```typescript
// 创建矩形
chart.createOverlay({ name: 'rect' });

// 创建圆形
chart.createOverlay({ name: 'circle' });

// 创建椭圆形
chart.createOverlay({ name: 'ellipse' });

// 创建三角形
chart.createOverlay({ name: 'triangle' });
```

### 3. 通过绘图工具栏使用

在图表左侧绘图工具栏中选择对应工具即可开始绘制。

## 扩展开发

如需创建新的 overlay，请参考以下结构：

```typescript
import type { OverlayTemplate } from 'klinecharts';

export const myOverlay: OverlayTemplate = {
  // 唯一标识名称
  name: 'myOverlay',

  // 完成绘制需要的步骤数（点击次数 + 1）
  totalStep: 3,

  // 是否需要默认的点图形
  needDefaultPointFigure: true,

  // 是否需要 X/Y 轴上的图形
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  // 默认样式
  styles: {
    // 根据图形类型配置
  },

  // 创建图形的核心方法
  createPointFigures: ({ coordinates, overlay, bounding }) => {
    // coordinates: 用户点击的坐标点数组
    // overlay: overlay 实例
    // bounding: 画布边界信息

    // 返回图形数组
    return [
      {
        type: 'rect',  // 基础图形类型：rect, circle, line, polygon, text, arc
        attrs: { /* 图形属性 */ },
        styles: { /* 样式 */ },
        ignoreEvent: false  // 是否忽略事件
      }
    ];
  },

  // 可选的事件回调
  onClick: (event) => { /* ... */ },
  onDrawEnd: (event) => { /* ... */ },
  // ... 更多事件
};
```

### 基础图形类型

klinecharts v9 内置的基础图形（可在 `createPointFigures` 中使用）：

| 类型 | 说明 | 必需属性 |
|------|------|----------|
| `rect` | 矩形 | `x`, `y`, `width`, `height` |
| `circle` | 圆形 | `x`, `y`, `r` |
| `line` | 线条 | `coordinates: [{x, y}, ...]` |
| `polygon` | 多边形 | `coordinates: [{x, y}, ...]` |
| `arc` | 弧形 | `x`, `y`, `r`, `startAngle`, `endAngle` |
| `text` | 文本 | `x`, `y`, `text` |
| `rectText` | 带背景的文本 | `x`, `y`, `text` |

### 样式配置

```typescript
styles: {
  style: 'stroke_fill',  // 'stroke' | 'fill' | 'stroke_fill'
  color: 'rgba(58, 159, 255, 0.25)',  // 填充色
  borderColor: '#3A9FFF',              // 边框色
  borderSize: 1                         // 边框宽度
}
```

## 相关文件

- `/src/components/ChartPanel/index.tsx` - 图表主组件（注册 overlay）
- `/src/components/ChartPanel/DrawingToolbar.tsx` - 绘图工具栏
- `/src/store/useChartStore.ts` - 图表状态管理
- `/src/components/AIAssistant/ChatInput/index.tsx` - AI 助手快捷按钮
