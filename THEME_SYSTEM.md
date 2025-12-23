# 主题系统文档

## 概述

本项目实现了完整的黑白主题切换系统，支持：
- 黑色和白色两种主题
- 平滑的主题切换过渡效果
- 外部控制（可嵌入到 App 或其他软件）
- 易于维护的 CSS 变量系统
- 主题状态持久化（localStorage）

## 目录结构

```
src/
├── styles/
│   └── theme.css           # 主题CSS变量定义
├── store/
│   └── useThemeStore.ts    # 主题状态管理
├── hooks/
│   └── useTheme.ts         # 主题Hook
├── components/
│   └── ThemeSwitcher/      # 主题切换组件
└── utils/
    └── styles.ts           # 样式工具函数
```

## CSS变量定义

所有颜色都定义在 `src/styles/theme.css` 中，通过 `data-theme` 属性切换：

### 背景色
- `--bg-primary`: 主背景色
- `--bg-secondary`: 次要背景色
- `--bg-tertiary`: 第三级背景色
- `--bg-hover`: 悬停背景色
- `--bg-active`: 激活背景色

### 边框色
- `--border-primary`: 主边框色
- `--border-secondary`: 次要边框色
- `--border-hover`: 悬停边框色
- `--border-active`: 激活边框色

### 文本色
- `--text-primary`: 主文本色
- `--text-secondary`: 次要文本色
- `--text-tertiary`: 第三级文本色
- `--text-muted`: 弱化文本色
- `--text-disabled`: 禁用文本色

### 强调色
- `--accent-primary`: 主强调色（蓝色）
- `--accent-hover`: 悬停强调色
- `--accent-active`: 激活强调色

### 状态色
- `--success`: 成功/涨（绿色）
- `--error`: 错误/跌（红色）
- `--warning`: 警告（黄色）

### 图表色
- `--chart-grid`: 图表网格线颜色
- `--chart-candle-up`: K线上涨颜色
- `--chart-candle-down`: K线下跌颜色

### 滚动条
- `--scrollbar-track`: 滚动条轨道颜色
- `--scrollbar-thumb`: 滚动条滑块颜色
- `--scrollbar-thumb-hover`: 滚动条滑块悬停颜色

## 使用方法

### 1. 在组件中使用主题Hook

```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div>
      <button onClick={toggleTheme}>
        切换主题
      </button>
      <p>当前主题: {theme}</p>
    </div>
  );
}
```

### 2. 使用CSS变量

在React组件中使用内联样式：

```tsx
<div
  style={{
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)'
  }}
>
  内容
</div>
```

在CSS文件中使用：

```css
.my-class {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.my-class:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}
```

### 3. 使用ThemeSwitcher组件

```tsx
import { ThemeSwitcher } from '../components/ThemeSwitcher';

function MyPage() {
  return (
    <div>
      <ThemeSwitcher />
      {/* 其他内容 */}
    </div>
  );
}
```

### 4. 使用样式工具函数

```tsx
import { getThemedStyles } from '../utils/styles';

function MyComponent() {
  const styles = getThemedStyles();

  return (
    <div style={{ background: styles.bgPrimary }}>
      内容
    </div>
  );
}
```

## 外部控制主题

### 方法1: 通过 window 对象

当页面嵌入到 App 或其他软件时，外部可以通过以下方式控制主题：

```javascript
// 设置主题
window.setAppTheme('light');  // 或 'dark'

// 获取当前主题
const currentTheme = window.getAppTheme();
```

### 方法2: 通过 postMessage

外部应用可以通过 postMessage 发送主题切换消息：

```javascript
// 从外部应用发送消息
iframe.contentWindow.postMessage({
  type: 'SET_THEME',
  theme: 'light'  // 或 'dark'
}, '*');
```

### 方法3: 直接修改HTML属性

```javascript
// 外部直接设置 data-theme 属性
document.documentElement.setAttribute('data-theme', 'light');
```

## 添加新颜色变量

如果需要添加新的颜色变量：

1. 在 `src/styles/theme.css` 中为两个主题都定义变量：

```css
[data-theme='dark'] {
  --my-new-color: #FFFFFF;
}

[data-theme='light'] {
  --my-new-color: #000000;
}
```

2. 在组件中使用：

```tsx
<div style={{ color: 'var(--my-new-color)' }}>内容</div>
```

## 主题切换过渡效果

所有使用CSS变量的元素都应该添加过渡效果：

```css
.element {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## 最佳实践

1. **统一使用CSS变量**: 避免在代码中硬编码颜色值，始终使用CSS变量
2. **添加过渡效果**: 为颜色相关的CSS属性添加 `transition`
3. **保持一致性**: 使用统一的颜色变量，而不是为每个组件定义不同的颜色
4. **语义化命名**: 使用 `--bg-primary` 而不是 `--color-black`，便于主题切换
5. **测试两种主题**: 确保在黑白两种主题下都能正常显示和交互

## 图表主题适配

对于 K线图等图表组件，需要在图表初始化时读取CSS变量：

```tsx
const chart = init(container, {
  styles: {
    grid: {
      horizontal: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-grid')
      },
    },
    candle: {
      bar: {
        upColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-candle-up'),
        downColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--chart-candle-down'),
      },
    },
  },
});
```

监听主题变化并更新图表：

```tsx
useEffect(() => {
  const updateChartTheme = () => {
    if (chartRef.current) {
      chartRef.current.setStyles({
        // 更新图表样式
      });
    }
  };

  // 监听主题变化
  const observer = new MutationObserver(updateChartTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  return () => observer.disconnect();
}, []);
```

## Tailwind CSS 集成

虽然项目使用了 Tailwind CSS，但建议在需要主题切换的地方使用 CSS 变量而不是 Tailwind 类：

❌ 不推荐：
```tsx
<div className="bg-[#1A1A1A] text-white">内容</div>
```

✅ 推荐：
```tsx
<div style={{
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)'
}}>
  内容
</div>
```

## 故障排查

### 主题不生效
1. 检查 `data-theme` 属性是否正确设置在 `<html>` 元素上
2. 确认 `theme.css` 已正确导入到 `index.css`
3. 检查浏览器控制台是否有CSS加载错误

### 颜色没有过渡效果
1. 确保添加了 `transition` CSS属性
2. 检查是否使用了 `!important` 覆盖了过渡效果

### 外部控制不生效
1. 确认 `useThemeStore.ts` 中的事件监听器已正确设置
2. 检查 postMessage 的 origin 参数是否正确
3. 确认外部应用有访问 iframe 的权限

## 示例代码

完整的组件示例：

```tsx
import { useTheme } from '../hooks/useTheme';

export function ThemedCard() {
  const { isDark } = useTheme();

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        padding: '16px',
        transition: 'all 0.3s ease'
      }}
    >
      <h3 style={{ color: 'var(--text-primary)' }}>
        标题
      </h3>
      <p style={{ color: 'var(--text-secondary)' }}>
        内容文本
      </p>
      <button
        style={{
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent-primary)';
        }}
      >
        按钮
      </button>
    </div>
  );
}
```
