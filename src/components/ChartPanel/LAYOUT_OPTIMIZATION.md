# ChartPanel 布局优化说明

## 优化目标

参考 TradingView 的专业交易界面设计，对图表面板进行布局优化，提升用户体验和专业感。

## 布局对比

### 优化前（第一阶段）

```
┌─────────────────────────────────────────────────┐
│ 绘图工具栏 │ ChartHeader (顶部)                │
│ (左侧)     │ ┌──────────────────────────────┐  │
│            │ │ 股票代码 + 价格 + 涨跌幅      │  │
│            │ │ [展开/收起按钮]               │  │
│            │ ├──────────────────────────────┤  │
│            │ │ 时间周期 + 指标选择器(右侧)   │  │
│            │ └──────────────────────────────┘  │
│            │                                    │
│            │ 图表区域                           │
│            │                                    │
│            │                                    │
└─────────────────────────────────────────────────┘
```

**问题：**
- 顶部空间占用过大（展开时）
- 控制栏在顶部，操作不便
- 信息密度低，布局松散
- 与专业交易软件风格不符

### 优化后（第二阶段 - TradingView 风格）

```
┌─────────────────────────────────────────────────┐
│ 绘图 │ StockInfoBar (紧凑信息栏)              │
│ 工具 │ AAPL · 1D · NASDAQ | O 224.63 H 227.88 │
│ 栏   │ L 224.57 C 227.48 +4.76 (+2.14%) | Vol │
│      ├────────────────────────────────────────┤
│      │                                        │
│      │                                        │
│      │         图表区域 (最大化显示)          │
│      │                                        │
│      │                                        │
│      ├────────────────────────────────────────┤
│      │ ChartToolbar (底部控制栏)              │
│      │ 1D 5D 1W 1M 3M 1Y | 指标 | 🔍 📷 ⚙️   │
└─────────────────────────────────────────────────┘
```

**优势：**
- ✅ 顶部信息栏紧凑，不可折叠（始终显示关键信息）
- ✅ 控制栏移至底部，符合操作习惯
- ✅ OHLC 价格一目了然
- ✅ 图表区域最大化
- ✅ 专业的交易软件风格

## 新增组件详解

### 1. StockInfoBar（顶部信息栏）

**设计理念：** 一行显示所有关键信息，无折叠，始终可见。

**布局结构：**
```
[股票代码] · [周期] · [交易所] | O [开盘] H [最高] L [最低] C [收盘] [涨跌幅] | Vol [成交量] [日期]
```

**交互特性：**
- 默认显示当前股票的实时价格
- 鼠标悬停图表时，自动切换为对应K线的 OHLC 数据
- 涨跌幅带颜色（绿涨/红跌）和半透明背景
- 成交量自动格式化（M/K单位）
- 日期仅在悬停时显示

**代码示例：**
```tsx
<StockInfoBar
  stock={selectedStock}
  timeRange={timeRange}
  hoveredData={hoveredData} // 鼠标悬停的K线数据
/>
```

### 2. ChartToolbar（底部控制栏）

**设计理念：** 将所有控制按钮集中在底部，最小化对图表的干扰。

**布局结构：**
```
[时间周期选择器] | [指标菜单] | [缩放-] [缩放+] | [截图] [设置]
```

**交互特性：**
- 时间周期按钮组，点击切换
- 指标菜单向上展开（避免被遮挡）
- 工具按钮分组（缩放 | 功能）
- 所有按钮 hover 效果一致

**代码示例：**
```tsx
<ChartToolbar
  timeRange={timeRange}
  onTimeRangeChange={handleTimeRangeChange}
  activeIndicators={indicators}
  onToggleIndicator={toggleIndicator}
  showIndicatorMenu={showIndicatorMenu}
  onToggleIndicatorMenu={() => setShowIndicatorMenu(!showIndicatorMenu)}
/>
```

### 3. IndicatorMenu 优化

**新增功能：** 支持双向展开（顶部向下 / 底部向上）

**实现：**
```tsx
<IndicatorMenu
  position="bottom" // 'top' | 'bottom'
  // ... 其他 props
/>
```

当 `position="bottom"` 时，菜单自动向上展开，避免被页面底部遮挡。

## 数据流优化

### 优化前
```tsx
const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
const [hoveredChange, setHoveredChange] = useState<number | null>(null);
const [hoveredDate, setHoveredDate] = useState<string | null>(null);

// 3个分散的状态管理
```

### 优化后
```tsx
const [hoveredData, setHoveredData] = useState<KLineData | null>(null);

// 单一的完整数据对象
// 包含：timestamp, open, high, low, close, volume
```

**优势：**
- 减少状态数量
- 数据一致性更好
- 组件间传递更简洁
- 类型安全性提升

## 视觉优化

### 颜色系统
- **涨（阳线）**: `#00D09C` (绿色)
- **跌（阴线）**: `#FF4976` (红色)
- **高亮**: `#3A9FFF` (蓝色)
- **背景**: `#0D0D0D` (深黑)
- **边框**: `#2A2A2A` (深灰)
- **文本**: `#FFFFFF` / `#D9D9D9` / `#999999`

### 过渡动画
```css
transition-all duration-200  /* 组件过渡 */
animate-in fade-in duration-200  /* 菜单淡入 */
```

### 字体使用
- **股票代码**: 16px, bold
- **价格**: 14px, mono, bold
- **OHLC**: 14px, mono
- **标签**: 10px, 大写
- **按钮**: 10px

## 响应式适配

当前实现针对桌面端优化。移动端适配建议：

```
桌面端 (>1024px): 完整布局
平板 (768-1024px): 隐藏部分工具按钮
移动端 (<768px):
  - 信息栏简化为两行
  - 工具栏改为抽屉式
  - 绘图工具栏改为浮动按钮
```

## 性能优化

### 1. 组件级别
- 使用 `React.memo` 优化不必要的重渲染
- 事件监听器正确清理（useEffect cleanup）

### 2. 数据级别
- K线数据缓存（避免重复计算）
- 图表实例复用（init 一次）
- ResizeObserver 防抖优化

### 3. 渲染级别
- 虚拟滚动（处理大量数据）
- Canvas 渲染（klinecharts）
- CSS transform 动画（硬件加速）

## 可访问性

### 键盘导航
- [ ] 时间周期按钮支持 Tab 导航
- [ ] 指标菜单支持 Escape 关闭
- [ ] 绘图工具支持快捷键

### 屏幕阅读器
- 所有按钮都有 `title` 属性
- 语义化 HTML 结构
- ARIA 标签支持

## 浏览器兼容性

- Chrome 90+: ✅ 完全支持
- Firefox 88+: ✅ 完全支持
- Safari 14+: ✅ 完全支持
- Edge 90+: ✅ 完全支持

主要依赖：
- CSS Grid/Flexbox
- CSS Transitions
- ResizeObserver API
- Canvas API (klinecharts)

## 下一步计划

参见 [README.md](./README.md) 第三阶段功能增强。
