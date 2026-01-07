# 项目协作 Skill（默认遵守）

> 目的：让后续对话/改动默认遵守本项目约定，不需要反复提醒。

## 沟通规范
- **默认使用中文回答**。
- **不确定就先确认**（不要无中生有、不要臆测接口/逻辑）。
- **尽量简单完成需求**，避免引入多余依赖/大改结构。

## UI 与交互规范
- **统一使用 shadcn/ui 组件体系**：优先使用 [shadcn-ui/ui](https://github.com/shadcn-ui/ui) 的组件模式（Tailwind + 可复制可改的组件），逐步沉淀为项目自己的组件库。
- **统一使用顶部 toast**：使用 `sonner`（shadcn 社区常用）。
  - 通知封装：`src/utils/notify.ts`（`notifyError/notifyWarning/notifySuccess`）。
  - Toaster 已在 `src/main.tsx` 挂载：`<Toaster position="top-center" />`。

## 请求与错误处理规范
- 所有 API 调用统一走 `src/services/request.ts`（不要私自直接 `fetch`）。
- 后端报错必须让用户看得到：请求失败/非成功 code 需触发 toast。
- **禁止**提交/保留任何 `127.0.0.1:7243/ingest` 之类的 debug 上报代码。

## 文档维护规范
- `README.md` 保持**短、可执行**：快速启动/环境变量/脚本/关键约定即可。


