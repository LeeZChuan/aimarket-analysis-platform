# 主题系统快速入门

## 快速使用

### 1. 添加主题切换按钮

```tsx
import { ThemeSwitcher } from './components/ThemeSwitcher';

// 在你的组件中
<ThemeSwitcher />
```

### 2. 使用CSS变量

```tsx
// 直接使用CSS变量
<div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
  内容
</div>
```

### 3. 外部控制（嵌入到App中）

```javascript
// 方法 1: 使用 window 对象
window.setAppTheme('light');  // 切换到亮色
window.setAppTheme('dark');   // 切换到暗色

// 方法 2: 使用 postMessage
iframe.contentWindow.postMessage({
  type: 'SET_THEME',
  theme: 'light'
}, '*');

// 方法 3: 直接设置属性
document.querySelector('iframe').contentDocument.documentElement
  .setAttribute('data-theme', 'light');
```

## 可用的CSS变量

### 背景色
- `var(--bg-primary)` - 主背景
- `var(--bg-secondary)` - 次要背景
- `var(--bg-tertiary)` - 第三级背景
- `var(--bg-hover)` - 悬停背景
- `var(--bg-active)` - 激活背景

### 文本色
- `var(--text-primary)` - 主文本
- `var(--text-secondary)` - 次要文本
- `var(--text-tertiary)` - 第三级文本
- `var(--text-muted)` - 弱化文本
- `var(--text-disabled)` - 禁用文本

### 边框色
- `var(--border-primary)` - 主边框
- `var(--border-secondary)` - 次要边框
- `var(--border-hover)` - 悬停边框
- `var(--border-active)` - 激活边框

### 强调色
- `var(--accent-primary)` - 主强调色（蓝色）
- `var(--accent-hover)` - 悬停强调色
- `var(--accent-active)` - 激活强调色

### 状态色
- `var(--success)` - 成功/涨（绿色）
- `var(--error)` - 错误/跌（红色）
- `var(--warning)` - 警告（黄色）

## 组件样式模式

创建组件样式文件：

```tsx
// ComponentStyles.tsx
export const componentStyles = {
  container: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)',
    transition: 'all 0.3s ease',
  },

  button: {
    background: 'var(--accent-primary)',
    color: 'white',
    border: 'none',
    transition: 'background 0.3s ease',
  },

  buttonHover: {
    background: 'var(--accent-hover)',
  },
};
```

在组件中使用：

```tsx
import { componentStyles } from './ComponentStyles';

export function MyComponent() {
  return (
    <div style={componentStyles.container}>
      <button
        style={componentStyles.button}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = componentStyles.buttonHover.background;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = componentStyles.button.background;
        }}
      >
        按钮
      </button>
    </div>
  );
}
```

## 完整示例

```tsx
import { useTheme } from '../hooks/useTheme';

export function ThemedComponent() {
  const { theme, toggleTheme, isDark } = useTheme();

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
        当前主题: {theme}
      </h3>

      <button
        onClick={toggleTheme}
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
        切换主题
      </button>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-primary)',
        borderRadius: '4px',
        color: 'var(--text-secondary)'
      }}>
        这是一个完全支持主题切换的组件
      </div>
    </div>
  );
}
```

## 注意事项

1. 始终使用CSS变量，避免硬编码颜色值
2. 为颜色相关属性添加 `transition` 实现平滑切换
3. 测试两种主题下的显示效果
4. 确保有足够的对比度，保证可读性

## 调试技巧

在浏览器控制台快速切换主题：

```javascript
// 切换到亮色
window.setAppTheme('light')

// 切换到暗色
window.setAppTheme('dark')

// 查看当前主题
window.getAppTheme()
```

## 更多信息

详细文档请参考 `THEME_SYSTEM.md`
