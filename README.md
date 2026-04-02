# AstraTrade

AstraTrade 是一个基于 `React 18 + TypeScript + Vite` 的股票分析与交易前端，聚焦 K 线分析、AI 对话和自选股管理。

## 快速开始

```bash
npm install
npm run dev
```

默认访问：`http://localhost:5173`

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

## 环境变量

```env
# 后端 API 地址（默认可用 /api）
VITE_API_BASE_URL=/api
```

生产环境示例见：`.env.production.example`

## 关键约定

- UI 组件优先使用 shadcn/ui 体系
- Toast 统一使用 `src/utils/notify.ts`
- API 请求统一走 `src/services/request.ts`
- ChartPanel Overlay 开发遵循 `src/components/ChartPanel/README.md`

## 项目结构

```text
src/
├── components/   UI 组件
├── services/     API 服务层
├── store/        Zustand 状态管理
├── views/        页面容器
├── llm/          AI 相关模板和类型
└── utils/        通用工具
```

## TODO（精简）

- [x] ✅ 完成基础主题系统（深色/浅色）与 Token 驱动
- [x] ✅ 完成 ChartPanel 基础绘图与右键菜单能力
- [x] ✅ 完成 AI 对话基础链路（输入、展示、服务调用）
- [ ] 对接真实基本面数据（替换当前占位/随机数据）
- [ ] 增加核心测试（服务层 + 关键组件）
- [ ] 补齐移动端基础适配
