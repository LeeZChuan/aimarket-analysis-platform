# 组件主题迁移指南

本指南说明如何将现有组件迁移到主题系统。

## 迁移步骤

### 第一步：创建组件样式文件

为每个组件创建一个 `ComponentStyles.tsx` 文件，将所有硬编码的颜色值替换为CSS变量。

**示例：ChatPanelStyles.tsx**

```tsx
export const chatPanelStyles = {
  container: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  },

  header: {
    background: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-primary)',
  },

  messageUser: {
    background: 'var(--accent-primary)',
    color: 'white',
  },

  messageAssistant: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)',
  },

  input: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)',
  },

  inputFocus: {
    borderColor: 'var(--border-active)',
  },

  button: {
    background: 'var(--accent-primary)',
    color: 'white',
  },

  buttonHover: {
    background: 'var(--accent-hover)',
  },

  buttonDisabled: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-disabled)',
    cursor: 'not-allowed',
  },
};
```

### 第二步：更新组件导入

```tsx
// 在组件文件顶部添加
import { chatPanelStyles } from './ChatPanelStyles';
```

### 第三步：替换硬编码颜色

#### 迁移前 ❌

```tsx
<div className="bg-[#1A1A1A] text-white border border-[#2A2A2A]">
  内容
</div>
```

#### 迁移后 ✅

```tsx
<div style={chatPanelStyles.container}>
  内容
</div>
```

### 第四步：处理交互状态

#### 迁移前 ❌

```tsx
<button className="bg-[#3A9FFF] hover:bg-[#5BB3FF] text-white">
  按钮
</button>
```

#### 迁移后 ✅

```tsx
<button
  style={chatPanelStyles.button}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = chatPanelStyles.buttonHover.background;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = chatPanelStyles.button.background;
  }}
>
  按钮
</button>
```

### 第五步：处理条件样式

#### 迁移前 ❌

```tsx
<div className={`p-3 ${isActive ? 'bg-[#3A9FFF]/20 border-[#3A9FFF]' : 'bg-[#0D0D0D]'}`}>
  内容
</div>
```

#### 迁移后 ✅

```tsx
<div
  className="p-3"
  style={isActive ? chatPanelStyles.itemActive : chatPanelStyles.item}
>
  内容
</div>
```

## 常见颜色映射

以下是从旧颜色到CSS变量的映射表：

| 旧颜色 | CSS变量 | 说明 |
|--------|---------|------|
| `#0D0D0D` | `var(--bg-primary)` | 主背景（最深） |
| `#1A1A1A` | `var(--bg-secondary)` | 次要背景 |
| `#2A2A2A` | `var(--bg-tertiary)` / `var(--border-primary)` | 第三级背景 / 主边框 |
| `#3A3A3A` | `var(--bg-hover)` / `var(--border-secondary)` | 悬停背景 / 次要边框 |
| `#FFFFFF` / `white` | `var(--text-primary)` | 主文本 |
| `#D9D9D9` | `var(--text-secondary)` | 次要文本 |
| `text-gray-500` | `var(--text-muted)` | 弱化文本 |
| `text-gray-400` | `var(--text-muted)` | 弱化文本 |
| `#3A9FFF` | `var(--accent-primary)` | 主强调色（蓝色） |
| `#5BB3FF` | `var(--accent-hover)` | 悬停强调色 |
| `#00D09C` | `var(--success)` | 成功/涨（绿色） |
| `text-red-500` / `#FF4976` | `var(--error)` | 错误/跌（红色） |
| `#FFB800` | `var(--warning)` | 警告（黄色） |

## 图表组件特殊处理

K线图等图表组件需要特殊处理，因为它们在初始化时需要读取CSS变量：

```tsx
import { useEffect } from 'react';
import { init } from 'klinecharts';

function ChartComponent() {
  useEffect(() => {
    // 获取当前主题的颜色值
    const getCSSVar = (varName: string) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    };

    const chart = init(chartRef.current, {
      styles: {
        grid: {
          horizontal: { color: getCSSVar('--chart-grid') },
          vertical: { color: getCSSVar('--chart-grid') },
        },
        candle: {
          bar: {
            upColor: getCSSVar('--chart-candle-up'),
            downColor: getCSSVar('--chart-candle-down'),
            upBorderColor: getCSSVar('--chart-candle-up'),
            downBorderColor: getCSSVar('--chart-candle-down'),
          },
        },
      },
    });

    // 监听主题变化
    const observer = new MutationObserver(() => {
      chart.setStyles({
        grid: {
          horizontal: { color: getCSSVar('--chart-grid') },
          vertical: { color: getCSSVar('--chart-grid') },
        },
        candle: {
          bar: {
            upColor: getCSSVar('--chart-candle-up'),
            downColor: getCSSVar('--chart-candle-down'),
            upBorderColor: getCSSVar('--chart-candle-up'),
            downBorderColor: getCSSVar('--chart-candle-down'),
          },
        },
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} />;
}
```

## 迁移清单

使用此清单确保组件完全迁移：

- [ ] 创建 `ComponentStyles.tsx` 文件
- [ ] 定义所有颜色样式为CSS变量
- [ ] 更新组件导入样式文件
- [ ] 替换所有 `bg-[#xxx]` 类
- [ ] 替换所有 `text-[#xxx]` 类
- [ ] 替换所有 `border-[#xxx]` 类
- [ ] 处理 hover 状态
- [ ] 处理 active/selected 状态
- [ ] 处理 disabled 状态
- [ ] 添加过渡动画
- [ ] 测试黑色主题
- [ ] 测试白色主题
- [ ] 测试主题切换过渡效果

## 待迁移组件列表

以下组件尚未完全迁移到主题系统：

### 高优先级
- [ ] `/src/components/ChartPanel/index.tsx` - 图表面板（需要特殊处理）
- [ ] `/src/components/AIAssistant/ChatPanel/index.tsx` - AI聊天面板
- [ ] `/src/components/AIAssistant/ChatMessageList/index.tsx` - 消息列表
- [ ] `/src/components/AIAssistant/ChatInput/index.tsx` - 聊天输入框

### 中优先级
- [ ] `/src/components/StockSearchModal/index.tsx` - 股票搜索弹窗
- [ ] `/src/components/ChartPanel/ChartHeader.tsx` - 图表头部
- [ ] `/src/components/ChartPanel/ChartToolbar.tsx` - 图表工具栏
- [ ] `/src/components/ChartPanel/DrawingToolbar.tsx` - 绘图工具栏
- [ ] `/src/components/ChartPanel/IndicatorMenu.tsx` - 指标菜单
- [ ] `/src/components/ChartPanel/StockInfoBar.tsx` - 股票信息栏
- [ ] `/src/components/ChartPanel/TimeRangeSelector.tsx` - 时间范围选择器
- [ ] `/src/components/ChartPanel/RegionSelectionModal.tsx` - 区域选择弹窗

### 低优先级
- [ ] `/src/components/Table/Table.tsx` - 表格组件
- [ ] `/src/components/NavigationMenu/index.tsx` - 导航菜单
- [ ] `/src/components/NavigationButton/index.tsx` - 导航按钮
- [ ] `/src/views/LoginView/index.tsx` - 登录页面
- [ ] `/src/views/StockDetailView/index.tsx` - 股票详情页

## 批量迁移脚本

可以使用以下正则表达式辅助迁移（在代码编辑器中使用查找替换）：

### 查找背景色
```regex
bg-\[#[0-9A-Fa-f]{6}\]
```

### 查找文本色
```regex
text-\[#[0-9A-Fa-f]{6}\]
```

### 查找边框色
```regex
border-\[#[0-9A-Fa-f]{6}\]
```

注意：自动替换可能不够精确，建议手动检查每个替换。

## 测试主题切换

迁移完成后，使用以下方法测试：

```javascript
// 在浏览器控制台执行
// 每秒切换一次主题
setInterval(() => {
  const current = window.getAppTheme();
  window.setAppTheme(current === 'dark' ? 'light' : 'dark');
}, 1000);
```

观察是否有：
- 颜色突变（应该平滑过渡）
- 未切换的元素（说明还有硬编码颜色）
- 对比度不足的文本（需要调整颜色值）

## 最佳实践

1. **一次迁移一个组件**：避免同时修改多个文件导致错误
2. **保持样式文件简洁**：只定义真正需要的样式
3. **复用样式对象**：相似的元素使用相同的样式对象
4. **添加注释**：在样式文件中说明每个样式的用途
5. **测试边界情况**：确保在不同状态下都正常显示

## 获取帮助

- 查看已迁移的组件作为参考：`/src/components/Sidebar/`
- 阅读完整文档：`THEME_SYSTEM.md`
- 快速参考：`THEME_QUICK_START.md`
