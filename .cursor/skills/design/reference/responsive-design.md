# 响应式设计

## 移动优先：正确编写样式

首先为移动设备编写基础样式，使用 `min-width` 查询来逐步增加样式的复杂性。桌面优先（`max-width`）意味着移动设备会优先加载不必要的样式。

## 断点：内容驱动

不要盲目追求设备尺寸——让内容告诉你断点在哪里。从窄屏开始，逐渐拉伸直到设计出现问题，并在该处添加断点。通常三个断点就足够了（640、768、1024px）。对于没有断点的流式布局，可以使用 `clamp()`。

## 检测输入法，而不仅仅是屏幕尺寸

**屏幕尺寸并不能告诉你输入法。** 笔记本电脑使用触摸屏，平板电脑使用键盘——使用指针和悬停查询：

```css

/* 精细指针（鼠标、触控板）*/

@media (pointer: fine) {

.button { padding: 8px 16px; }
}

/* 粗指针（触摸、触控笔）*/

@media (pointer: rough) {

.button { padding: 12px 20px; } /* 更大的触摸目标 */

}

/* 设备支持悬停 */

@media (hover: hover) {

.card:hover { transform: translateY(-2px); }

}

/* 设备不支持悬停（触摸）*/

@media (hover: none) {

.card { /* 无悬停状态 - 请使用激活状态 */ }

}

```

**重要提示**：不要依赖悬停功能。触摸用户无法悬停。

## 安全区域：处理刘海屏

现代手机都有刘海屏、圆角和主屏幕指示器。使用 `env()`：

```css

body {

padding-top: env(safe-area-inset-top);

padding-bottom: env(safe-area-inset-bottom);

padding-left: env(safe-area-inset-left);

padding-right: env(safe-area-inset-right);

}

/* 带备用方案 */

.footer {

padding-bottom: max(1rem, env(safe-area-inset-bottom));

}

```

**在 meta 标签中启用 viewport-fit**：

```html

<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## 响应式图片：正确设置

### 使用宽度描述符的 srcset

```html

<img

src="hero-800.jpg"

srcset="
hero-400.jpg 400w,

hero-800.jpg 800w,

hero-1200.jpg 1200w

"
sizes="(max-width: 768px) 100vw, 50vw"

alt="Hero image"

>
```

**工作原理**：

- `srcset` 列出可用图片及其实际宽度（`w` 描述符）

- `sizes` 告诉浏览器图片的宽度显示

- 浏览器会根据视口宽度和设备像素比选择最佳文件

### 用于艺术指导的图片元素

当您需要不同的裁剪/构图（而不仅仅是分辨率）时：

```html

<picture>

<source media="(min-width: 768px)" srcset="wide.jpg">

<source media="(max-width: 767px)" srcset="tall.jpg">

<img src="fallback.jpg" alt="...">

</picture>

```

## 布局适配模式

**导航**：三个阶段——移动设备上的汉堡菜单+抽屉，平板电脑上的横向紧凑布局，桌面端的完整标签布局。**表格**：在移动设备上使用 `display: block` 和 `data-label` 属性转换为卡片式布局。**渐进式展开**：使用 `<details>/<summary>` 来放置可在移动设备上折叠的内容。

## 测试：不要只依赖开发者工具

开发者工具的设备模拟功能虽然对布局很有用，但却无法模拟：

- 实际的触摸交互

- 真实的 CPU/内存限制

- 网络延迟模式

- 字体渲染差异

- 浏览器界面/键盘外观

**至少在以下设备上进行测试：**一台真实的 iPhone、一台真实的 Android 设备，以及一台平板电脑（如果相关）。廉价的 Android 手机会暴露出模拟器无法检测到的性能问题。

---

**避免：**优先考虑桌面端的设计。使用设备检测而非功能检测。使用独立的移动端/桌面端代码库。忽略平板电脑和横屏模式。假设所有移动设备的性能都很强大。