# AstraTrade

AstraTrade 是一个基于 `React 18 + TypeScript + Vite` 的股票分析前端，当前核心能力包括行情图表、K 线区间上下文、AI 对话、模板/场景分析和规划执行。

## 当前产品形态

- 普通对话：用户自由输入问题，前端携带模型、供应商、场景和当前 K 线上下文发送到后端。
- 模板/场景对话：用户选择模板/场景后继续对话，前端只传 `sceneId`，模板正文由后端维护。
- 规划执行：用户进入规划模式后，后端生成计划建议；用户确认后，前端按 `execute -> verify` 顺序执行，并且只有执行成功才进入校验。

## 技术栈

- React 18
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- klinecharts
- lucide-react
- sonner

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
npm run test:ai-chat
npm run preview
npm run lint
npm run typecheck
```

说明：

- `npm run test:ai-chat` 是当前 AI 对话三链路的轻量回归测试。
- `npm run build` 当前可通过。
- `npm run lint` 和 `npm run typecheck` 目前仍有既有非 AI 对话链路问题，主要集中在图表、Markdown、Table 和基础 request 类型，后续需要单独清理。

## 环境变量

```env
# 后端 API 地址，默认走 Vite 代理或同源 /api
VITE_API_BASE_URL=/api
```

## 目录结构

```text
src/
├── components/        UI 组件
│   ├── AIAssistant/  AI 对话、模板/场景、规划执行入口
│   ├── ChartPanel/   K 线图表、绘图、右键菜单
│   └── ui/           基础 UI 组件
├── services/         API 服务层
├── store/            Zustand 状态管理
├── types/            业务类型
├── views/            页面容器
├── llm/              LLM 相关类型与模板预留
└── utils/            通用工具
```

## 关键约定

- API 请求统一走 `src/services/request.ts`。
- 对话接口统一由 `src/services/conversationService.ts` 封装。
- AI 对话请求统一由 `src/components/AIAssistant/chatRequestBuilder.ts` 构建。
- AI 对话状态统一由 `src/store/useConversationStore.ts` 管理。
- Toast 统一使用 `src/utils/notify.ts`。
- K 线上下文来自 `src/store/useChartStore.ts`，发送消息时快照化。
- 图片上传入口暂时隐藏，直到后端多模态协议明确。
- 前端不保存模板 prompt 正文；模板/场景语义由 `sceneId` 与后端模板系统承接。

## 技术文档

最新整体设计见 [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md)。

## 当前技术路线

1. 优先稳定 AI 对话三链路：普通对话、模板/场景对话、规划执行。
2. 将 UI 调度、请求构建、流式执行、消息解析分别隔离，减少组件内分支。
3. 保持后端作为 prompt 和模板策略中心，前端只传结构化上下文和用户意图。
4. 按 TDD 补齐关键链路测试，再逐步清理全仓 typecheck/lint 历史问题。
5. 后续再接入真实多模态、结构化规划执行接口和更完整的服务层测试。
