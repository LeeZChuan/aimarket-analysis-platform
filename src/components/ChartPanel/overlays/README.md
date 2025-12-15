# 图表自定义覆盖物

这个文件夹包含基于 klinecharts v9 的自定义覆盖物（Overlay）插件。

## horizontalRegionSelection

**水平区域选择工具** - 允许用户在图表上框选一个区域用于分析。

### 功能特性

- ✅ 可拖拽的矩形选择区域
- ✅ 左右两个拖拽手柄（蓝色矩形）用于调整宽度
- ✅ 限制拖拽范围在可视区域内，最小宽度30px
- ✅ 左上角关闭按钮（红色圆形+白色×）用于删除选择
- ✅ 半透明蓝色背景高亮选中区域
- ✅ 使用几何图形替代图片，加载速度更快

### 使用方式

#### 1. 通过快捷按钮（推荐）
在 AI 聊天输入框左侧工具栏中，点击 **框选图标** 按钮即可激活。

#### 2. 通过绘图工具栏
在图表左侧绘图工具栏中选择对应工具。

#### 3. 程序调用
```typescript
import { registerOverlay } from 'klinecharts';
import { horizontalRegionSelection } from './overlays/horizontalRegionSelection';

// 注册覆盖物
registerOverlay(horizontalRegionSelection);

// 创建实例
chart.createOverlay({ name: 'horizontalRegionSelection' });
```

### 插件架构

该插件使用 klinecharts 的 `OverlayTemplate` 接口实现：

```typescript
{
  name: 'horizontalRegionSelection',
  totalStep: 2,              // 需要两个点（左右边界）
  mode: 'strong_magnet',     // 强磁吸模式，对齐K线
  createPointFigures: (params) => {
    // 返回图形数组：矩形、线条、手柄图标
  }
}
```

### 扩展开发

如需创建新的覆盖物，可以参考此文件的结构：

1. 定义覆盖物配置（name, totalStep, mode 等）
2. 实现 `createPointFigures` 方法绘制图形
3. 在 `ChartPanel/index.tsx` 中注册
4. 在 `DrawingToolbar.tsx` 中添加类型定义

### 相关文件

- `/src/components/ChartPanel/index.tsx` - 图表主组件
- `/src/components/AIAssistant/ChatInput/index.tsx` - 快捷按钮
- `/src/store/useChartStore.ts` - 图表状态管理
- `/src/components/ChartPanel/DrawingToolbar.tsx` - 绘图工具栏

