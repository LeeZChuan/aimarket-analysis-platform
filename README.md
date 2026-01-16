# AI 股票分析交易平台（前端）

一个基于 **React 18 + TypeScript + Vite** 的股票分析与交易前端示例，包含 K 线图表、股票搜索、自选股、AI 对话等模块。

## 📦 部署文档

- **[快速部署指南](./QUICK_DEPLOY.md)** - 5 分钟快速上手部署
- **[完整部署文档](./DEPLOYMENT.md)** - 详细的部署流程、配置说明和故障排查

## 快速开始

### 环境要求
- Node.js >= 16

### 启动

```bash
npm install
npm run dev
```

访问：`http://localhost:5173`

## 环境变量（可选）

项目默认可运行（部分能力可能使用 Mock/降级）。如需开启对应能力，请配置 `.env`：

```env
# 可选：后端 API 基础地址（默认 /api，会被 Vite 代理到 http://localhost:3000）
VITE_API_BASE_URL=/api

# 可选：Supabase（仅在你启用对话持久化等能力时需要）
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
```

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览构建产物
npm run preview

# ESLint
npm run lint

# TS 类型检查
npm run typecheck
```

## 项目结构（核心）

```
src/
  components/          UI 组件
  services/            API 服务层（统一走 request.ts）
  store/               Zustand 状态管理
  views/               页面（路由容器）
  llm/ prompt/         AI 相关逻辑与模板
  types/               类型定义
```

## 关键约定（重要）

### 统一 UI 组件库
- 项目已接入 **shadcn/ui + Tailwind CSS**，新 UI 优先使用 shadcn/ui 组件体系。
- 全局顶部通知使用 `sonner`，入口在 `src/main.tsx` 已挂载 `<Toaster position="top-center" />`。
- 通知封装在 `src/utils/notify.ts`（`notifyError/notifyWarning/notifySuccess`）。

### 统一请求与错误提示
- 所有 HTTP 请求统一走 `src/services/request.ts`
- 后端报错/非成功 code 会触发顶部通知（toast）

## FAQ

### 为什么我本地调用 `/api` 没响应？
- 开发环境下 Vite 会把 `/api` 代理到 `http://localhost:3000`（见 `vite.config.ts`）。
- 请确认后端服务已启动且端口一致。


