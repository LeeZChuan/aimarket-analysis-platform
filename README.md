# AstraTrade — AI 股票分析交易平台

基于 **React 18 + TypeScript + Vite** 构建的专业股票分析前端，包含 K 线图表、AI 对话分析、自选股管理等核心模块。

## 快速开始

```bash
npm install
npm run dev   # http://localhost:5173
```

## 常用命令

```bash
npm run build      # 生产构建
npm run preview    # 预览构建产物
npm run lint       # ESLint
npm run typecheck  # TS 类型检查
```

## 部署文档

- [快速部署指南](./docs/QUICK_DEPLOY.md)
- [完整部署文档](./docs/DEPLOYMENT.md)
- [本地开发指南](./docs/LOCAL_DEVELOPMENT.md)

---

## 设计理念

### 样式体系 — Design Token

所有视觉变量（颜色、字体、间距、圆角、阴影、动效时长）统一由 **`tokens.json`** 管理，这是整个样式体系的**唯一事实来源（Single Source of Truth）**。

**分层结构：**

```
tokens.json
├── primitive   原始层：具体色值阶梯（OKLCH 色彩空间）、字体栈、间距基准
└── semantic    语义层：dark / light 两套主题，将 primitive 映射为用途名称
                （bg.primary, text.muted, accent.primary, status.error 等）
```

**运行时链路：**

```
tokens.json
  → src/design/tokenLoader.ts   在 main.tsx 启动时注入 <style> 标签
    → CSS 自定义属性（--bg-primary, --accent-primary 等）
      → src/styles/theme.css    静态 CSS 降级兜底（JS 加载前使用）
        → tailwind.config.js    将 token 映射为 Tailwind 工具类
          → 组件样式消费
```

**颜色空间：** 使用 OKLCH（感知均匀色彩空间），相比 hex/rgb 能保证调色板在不同亮度下视觉权重一致。中性色带有极细微蓝色调（`chroma ≈ 0.01`），避免"死白/死黑"。

**如何修改主题：** 只需编辑 `tokens.json` 的 `semantic.dark` 或 `semantic.light` 区块，无需在组件中追踪散落的色值。未来接入移动端，只需为 TokenLoader 增加目标平台的输出格式即可。

**字体：** Plus Jakarta Sans（正文）+ JetBrains Mono（等宽/数字），替代 Inter / Roboto Mono，具有更强的字形个性和品牌辨识度。

---

### 组件封装

项目采用**单一职责**原则组织组件，每个组件只关注一个明确的功能域：

```
src/components/
├── AIAssistant/        AI 对话模块（ChatPanel / MessageList / ChatInput）
├── ChartPanel/         K 线图表面板（含绘图工具栏、技术指标、右键菜单）
│   ├── overlays/       自定义 klinecharts 覆盖物（矩形、圆形、趋势线等）
│   └── icons/          图表专用图标
├── Sidebar/            股票列表侧边栏（自选股 + 全部股票标签切换）
├── Table/              虚拟滚动高性能表格（支持列拖拽、排序、多级表头）
├── StockSearchModal/   股票搜索弹窗
├── ThemeSwitcher/      暗色 / 亮色主题切换按钮
└── ui/                 shadcn/ui 基础组件（Tabs 等）
```

**样式约定：**
- 纯粹的背景色 / 边框 / 文字颜色通过 `style={{ color: 'var(--text-primary)' }}` 内联引用 CSS 变量
- 复杂组件将样式对象抽离到同目录的 `*Styles.tsx` 文件（如 `SidebarStyles.tsx`、`ChartToolbarStyles.tsx`），避免组件文件膨胀
- 禁止在组件内出现硬编码 hex 色值；所有颜色均来自 Design Token

---

### 数据流转

```
后端 API / Mock
  ↓
src/services/request.ts      统一 HTTP 客户端（错误自动 toast 提示）
  ↓
src/services/*.ts            领域服务层（stockService, authService, aiService 等）
  ↓
src/store/*.ts               Zustand 全局状态（useStore, useChartStore, useThemeStore 等）
  ↓
views / components           视图层订阅状态，渲染 UI
```

**关键原则：**
- 所有网络请求必须经过 `src/services/request.ts`，禁止在组件中直接调用 `fetch`
- 后端错误由 request.ts 统一捕获，通过 `sonner` toast 上浮展示
- AI 相关的 Prompt 模板由 `src/llm/` 维护，与业务逻辑解耦
- 主题状态由 `useThemeStore` 持久化到 localStorage，并通过 `data-theme` 属性驱动 CSS 变量切换

---

## 项目结构

```
/
├── tokens.json              Design Token 源文件（唯一事实来源）
└── src/
    ├── design/
    │   └── tokenLoader.ts   Token 加载器（运行时注入 CSS 变量）
    ├── styles/
    │   └── theme.css        静态 CSS 降级（与 tokens.json 保持一致）
    ├── components/          UI 组件（见上方组件封装章节）
    ├── services/            API 服务层
    ├── store/               Zustand 状态
    ├── views/               路由页面容器
    ├── types/               TypeScript 类型定义
    ├── utils/               工具函数（notify, chartTheme, klineExport 等）
    └── llm/                 AI Prompt 模板与类型
```

---

## 关键约定

- **新 UI 组件** 优先使用 shadcn/ui 体系，Toast 通知使用 `src/utils/notify.ts`
- **API 请求** 统一走 `src/services/request.ts`，禁止裸 fetch
- **ChartPanel overlay** 开发须遵循 `src/components/ChartPanel/README.md` 中的约定（包括 `onRightClick: () => true`、注册到 `SHAPE_OVERLAY_NAMES` 等）
- **颜色** 只允许引用 CSS 变量，源头修改在 `tokens.json`

---

## TODO

### 样式与设计系统

- [ ] 为 `tokenLoader.ts` 增加构建时 CSS 文件输出能力，彻底替代 theme.css 作为静态降级
- [ ] 补充 `tokens.json` 中的 `spacing`、`zIndex`、`breakpoint` 语义 token，并映射至 Tailwind
- [ ] Table 组件、ChartTabs、LineVolumeChart 等仍存在少量硬编码色值，待统一替换
- [ ] 为 Design Token 体系增加 `tokens.schema.json` 进行 JSON Schema 校验，防止 token 命名错误
- [ ] 支持第三套主题（如高对比度/无障碍模式）

### 功能完善

- [ ] ChartPanel 绘图工具：文本标注的字号 / 颜色支持在 ChartSettingsPanel 中统一配置
- [ ] 自选股持久化至后端/Supabase，当前仅存于内存
- [ ] StockDetailView 中的 P/E、P/B 等基本面数据目前为随机值，需对接真实接口
- [ ] 股票搜索弹窗缺少搜索历史和热门股票推荐
- [ ] AI 对话支持多轮上下文自动截断策略（当前未做 token 限制）
- [ ] 移动端响应式适配（当前仅桌面端布局）
- [ ] K 线图时间周期不足：缺少分钟级别（1min/5min/15min/30min/60min）

### 工程质量

- [ ] 补充核心组件单元测试（Table 虚拟滚动、tokenLoader、stockService）
- [ ] 补充 E2E 测试覆盖登录 → 查看 K 线 → AI 分析完整流程
- [ ] Bundle 体积分析与优化（klinecharts 较大，考虑动态 import）
- [ ] ChartPanel 初始化时存在 ResizeObserver 与 dispose 的时序竞争，需修复

---

## 环境变量

```env
# 可选：后端 API 基础地址（默认 /api，Vite 代理到 http://localhost:3000）
VITE_API_BASE_URL=/api
```
