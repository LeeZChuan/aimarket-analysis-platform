# 需求澄清（启发式引导）— 实施步骤与扩展说明

本文档描述**已落地**的 A 方案（`guidanceAttachment` + 服务端注入 system）、分步接入顺序，以及**树状分支**的升级路径。

---

## 一、设计结论（与需求对齐）

| 项 | 实现 |
|----|------|
| 方案 | **A**：`POST .../chat` 请求体增加 `guidanceAttachment`，服务端在 `AgentSession` 中拼入 system，与模型供应商解耦 |
| 用户可见摘要 | `content` 与 `guidanceAttachment.summary` 一致，经 `sendChatMessage` → 一条**用户气泡** + 后端 `chatHistory` 用户消息 |
| 题目形态 V1 | **纯静态顺序**：`guidance.flows.ts` 中 `steps[]`，`guidance.engine.ts` 中 `advanceLinear` |
| 入口 | 必须先选**答题策略**（对应 `flowId`）才能进入题目；入口按钮在 `ChatPanel` 标题栏「需求澄清」 |

---

## 二、已交付文件清单

### 后端（`aimarket-analysis-platform-backend`）

1. `src/modules/guidance/guidance.types.ts` — 协议类型  
2. `src/modules/guidance/guidance.dto.ts` — Zod：`guidanceAdvanceBodySchema`、`guidanceAttachmentSchema`  
3. `src/modules/guidance/guidance.flows.ts` — 静态流程与 `listStrategies` / `getFlow`  
4. `src/modules/guidance/guidance.engine.ts` — `advanceLinear`、`buildSummaryDraft`  
5. `src/modules/guidance/guidance.system.ts` — `formatGuidanceSystemBlock`（注入 system）  
6. `src/modules/guidance/guidance.service.ts` — 鉴权 + 调用引擎  
7. `src/modules/guidance/guidance.controller.ts` / `guidance.routes.ts`  
8. `src/app.ts` — `app.use('/api/guidance', guidanceRoutes)`  
9. `src/modules/conversations/conversations.routes.ts` — `POST /:id/guidance/advance`  
10. `src/modules/conversations/conversations.dto.ts` — `chatSchema` 增加 `guidanceAttachment`  
11. `src/modules/conversations/conversations.controller.ts` — `runAgentSession` 传入 `guidanceAttachment`  
12. `src/modules/ai/agent/AgentSession.ts` — `systemFinal` 拼接澄清块  

### 前端（`aimarket-analysis-platform`）

1. `src/types/guidance.ts` — 展示用类型  
2. `src/types/conversation.ts` — `GuidanceStepAnswer`、`GuidanceAttachment`、`ChatRequest.guidanceAttachment`  
3. `src/services/guidanceService.ts` — 封装 HTTP  
4. `src/components/AIAssistant/GuidanceWizard/index.tsx` — 策略 → 顺序题 → 摘要 → `onComplete`  
5. `src/components/AIAssistant/ChatPanel/index.tsx` — 入口按钮 + 完成回调里 `sendChatMessage`  

---

## 三、API 契约（便于联调）

### 1. 策略列表

- `GET /api/guidance/strategies`  
- 响应 `data.strategies: { flowId, title, description?, version }[]`

### 2. 流程定义

- `GET /api/guidance/flows/:flowId`  
- 响应 `data.flow: GuidanceFlow`

### 3. 推进一步（校验 + 下一题或完成）

- `POST /api/conversations/:id/guidance/advance`  
- Body：`{ flowId, answers: { stepId, choiceId?, skipped?, freeText? }[] }`  
- 响应 `data: { completed, nextStep, summaryDraft? }`

### 4. 主对话（已有）

- `POST /api/conversations/:id/chat?stream=1`  
- Body 在原有字段基础上增加可选：

```json
{
  "content": "【需求澄清摘要】...",
  "guidanceAttachment": {
    "flowId": "intent_quick",
    "version": "1",
    "strategyTitle": "快速摸底",
    "answers": [{ "stepId": "q_goal", "choiceId": "c_trend" }],
    "summary": "与 content 一致的摘要文本"
  }
}
```

---

## 四、推荐实施顺序（若从零重做可参考）

1. **协议与 DTO**：先固定 `GuidanceAttachment` / `advance` 的 Zod 与 TS 类型。  
2. **静态 flows + 线性引擎**：`advanceLinear` + 单元测试（非法选项、顺序错误、跳过规则）。  
3. **独立路由**：`/guidance/strategies`、`/flows/:id`；再挂 `/:id/guidance/advance`（带会话归属校验）。  
4. **chat 扩展**：`chatSchema` + `AgentSession` 注入。  
5. **前端向导**：策略页 → 顺序答题 → 摘要编辑 → `sendChatMessage`。  
6. **验收**：抓包确认 `guidanceAttachment` 随 chat 发送；数据库中用户 `content` 为摘要；模型回复能体现摘要意图。

---

## 五、树状分支升级方案（当前未实现，仅设计）

**适用**：不同上一题选项进入不同后续题（非全局顺序 `steps[i]`）。

### 5.1 数据模型（建议）

在 `GuidanceFlow` 上增加（或与 `steps` 二选一）：

```ts
type NodeId = string;

type GuidanceNode = {
  id: NodeId;
  title: string;
  prompt?: string;
  choices: GuidanceChoice[];
  allowSkip?: boolean;
};

// 邻接：当前节点 + 所选 choice → 下一节点；缺省可映射到 END
type GuidanceGraph = {
  flowId: string;
  version: string;
  entryNodeId: NodeId;
  nodes: Record<NodeId, GuidanceNode>;
  transitions: Record<NodeId, Partial<Record<string, NodeId | 'END'>>>;
};
```

### 5.2 状态

- 客户端维护 `path: { nodeId, choiceId? }[]` 或仅 `answers` 带 `nodeId` 字段。  
- `advance` 请求体改为：`{ flowId, currentNodeId, answer }` 或仍发送**累计路径**由服务端解析。

### 5.3 服务端 `advanceGraph`

1. 校验 `currentNodeId` 合法。  
2. 根据 `answer.choiceId`（或 skip）查 `transitions` 得 `nextId`。  
3. `nextId === 'END'` → `completed: true` 并 `buildSummaryDraftFromPath`。  
4. 否则返回 `nextStep = nodes[nextId]`（形状可与现 `GuidanceStep` 对齐以便 UI 复用）。

### 5.4 前端

- `GuidanceWizard` 用 `nextStep.id` 作为题目标识，不再用 `answers.length` 索引。  
- 摘要生成依赖路径遍历，仍产出同一 `guidanceAttachment` 形状，**chat 接口不变**。

### 5.5 测试重点

- 环检测（配置错误导致死循环）。  
- 未配置分支时的默认下一跳。  
- 与 V1 线性流程**并存**：可用 `flowKind: 'linear' | 'graph'` 分支两套引擎。

---

## 六、运维与产品注意点

- **换模型**：只要仍走 `AgentSession` + `buildPrompt`，无需改引导协议。  
- **摘要长度**：`summary` 上限 8000 字（Zod），可按需调整。  
- **多会话**：引导答题依赖 `conversationId`；无会话时向导内会先创建会话再 `advance`。  
- **持久化答题进度**（可选后续）：在 `Conversation` 表增加 `guidanceState Json?`，或专用表；当前为**无状态 advance**（每次提交全量 `answers`）。
