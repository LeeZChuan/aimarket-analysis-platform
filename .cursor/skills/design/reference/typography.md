# 排版

## 经典排版原则

### 垂直韵律

行高应作为所有垂直间距的基本单位。如果正文文本的行高为 1.5（16px 字体，即 24px），则间距值应为 24px 的倍数。这能营造一种潜意识的和谐感——文本和空间共享一个数学基础。

### 模块化缩放与层级

常见错误：使用过多过于接近的字体大小（14px、15px、16px、18px……）。这会造成层级混乱。

**使用更少但对比度更高的字体大小。** 五种字体大小即可满足大多数需求：

| 用途 | 典型比例 | 用例 |

|------|---------------|----------|

| xs | 0.75rem | 标题、法律声明 |

| sm | 0.875rem | 辅助用户界面、元数据 |

|基础 | 1rem | 正文 |

| lg | 1.25-1.5rem | 副标题、导语 |

| xl+ | 2-4rem | 标题、中心文字 |

常用比例：1.25（大三度）、1.333（纯四度）、1.5（纯五度）。选择一个比例并坚持使用。

### 可读性和计量

使用 `ch` 单位进行基于字符的计量（`max-width: 65ch`）。行高与行长成反比——窄列需要更小的行距，宽列需要更大的行距。

**不易察觉的技巧**：深色背景上的浅色文字需要增加行高。由于文字在视觉上显得更轻，因此需要更多留白。在正常行高的基础上增加 0.05-0.1。

## 字体选择与搭配

### 选择特色字体

**避免使用那些几乎无人问津的默认字体**：Inter、Roboto、Open Sans、Lato、Montserrat。这些字体随处可见，会让你的设计显得千篇一律。它们适用于文档或工具等不需要个性的场合——但如果你想要打造独具特色的设计，那就另寻他处吧。

**更佳的 Google Fonts 替代方案**：

- 替代 Inter → **Instrument Sans**、**Plus Jakarta Sans**、**Outfit**

- 替代 Roboto → **Onest**、**Figtree**、**Urbanist**

- 替代 Open Sans → **Source Sans 3**、**Nunito Sans**、**DM Sans**

- 营造编辑/高端质感 → **Fraunces**、**Newsreader**、**Lora**

**系统字体被低估了**：`-apple-system`、BlinkMacSystemFont、“Segoe UI”、system-ui` 字体外观自然，加载速度极快，且易于阅读。对于性能优先于个性的应用，建议考虑使用系统字体。

### 字体搭配原则

**一个不为人知的真相**：你通常不需要第二种字体。一个精心挑选的字体系列，搭配多种字重，比两种相互冲突的字体更能清晰地展现层次结构。只有在需要真正对比时才添加第二种字体（例如，标题字体 + 正文衬线字体）。

搭配字体时，应在多个维度上进行对比：

- 衬线字体 + 无衬线字体（结构对比）

- 几何字体 + 人文主义字体（个性对比）

- 窄体标题字体 + 宽体正文字体（比例对比）

**切勿搭配相似但不完全相同的字体**（例如，两种几何无衬线字体）。它们会在缺乏清晰层次结构的情况下造成视觉冲突。

### 网页字体加载

布局偏移问题：字体加载延迟，文本重排，用户会看到内容跳动。以下是解决方法：

```css

/* 1. 使用 font-display: swap 来显示字体 */

@font-face {

font-family: 'CustomFont';

src: url('font.woff2') format('woff2');

font-display: swap;

}

/* 2. 匹配备用字体指标以尽量减少偏移 */

@font-face {

font-family: 'CustomFont-Fallback';

src: local('Arial');

size-adjust: 105%; /* 缩放以匹配 x 高度 */

ascent-override: 90%; /* 匹配上升部高度 */

descent-override: 20%; /* 匹配下降部深度 */

line-gap-override: 10%; /* 匹配行间距 */

}

body {

font-family: 'CustomFont', 'CustomFont-Fallback', sans-serif;

}

```

像 [Fontaine](https://github.com/unjs/fontaine) 这样的工具会自动计算这些覆盖值。

## 现代网页排版

### 流式字体

流式字体通过 `clamp(min, preferred, max)` 参数实现，使文本能够随视口平滑缩放。中间值（例如 `5vw + 1rem`）控制缩放速率——vw 值越高，缩放速度越快。添加 rem 偏移量，防止文本在小屏幕上缩放至 0。

**流式字体适用于**：营销/内容页面上的标题和显示文本，这些页面的文本占据布局的大部分，需要在不同的视口尺寸下保持足够的舒展度。

**固定 `rem` 缩放适用于**：应用程序 UI、仪表盘和数据密集型界面。目前主流的应用程序设计系统（Material、Polaris、Primer、Carbon）均未在产品 UI 中使用流式字体——固定缩放并可选择性地调整断点，能够提供容器化布局所需的空间可预测性。即使在营销页面上，正文也应使用固定缩放，因为不同视口之间的尺寸差异太小，无需使用固定缩放。

### OpenType 功能

大多数开发者并不知道这些功能的存在。使用它们可以提升页面美感：

```css

/* 用于数据对齐的表格数字 */

.data-table { font-variant-numeric: tabular-nums; }

/* 真分数 */

.recipe-amount { font-variant-numeric: diagonal-fractions; }

/* 用于缩写的小型大写字母 */

abbr { font-variant-caps: all-small-caps; }

/* 禁用代码中的连字 */

code { font-variant-ligatures: none; }

/* 启用字距调整（通常默认启用，但需要明确设置） */

body { font-kerning: normal; }

```

在 [Wakama] 查看您的字体支持哪些功能需要透明效果的环形图案和交互式场景。

---

**避免**：仅依赖颜色来传达信息。创建调色板时未明确每种颜色的作用。在大面积区域使用纯黑色（#000）。忽略色盲测试（8% 的男性患有色盲）。