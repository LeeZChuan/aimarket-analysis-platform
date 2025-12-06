# AI股票分析交易平台

一个现代化的股票分析与交易平台，集成AI智能分析助手，提供实时K线图表、智能问答和投资建议。

![Platform Preview](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📑 目录

- [快速开始](#-快速开始)
- [项目概述](#-项目概述)
- [技术栈](#-技术栈)
- [核心功能](#-核心功能)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [AI交互策略](#-ai交互策略)
- [组件使用说明](#-组件使用说明)
- [数据库设计](#-数据库设计)
- [状态管理](#-状态管理)
- [样式规范](#-样式规范)
- [部署指南](#-部署指南)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)

---

## 🚀 快速开始

### 前置要求

确保你的开发环境满足以下要求：

- **Node.js**: >= 16.x
- **npm**: >= 7.x
- **Git**: 最新版本

### 5分钟快速启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd project

# 2. 安装依赖
npm install

# 3. 启动开发服务器（无需配置即可运行）
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

### 数据源说明

**重要**: 项目的核心功能使用本地Mock数据，可以**无需任何配置**直接运行:

- ✅ **股票数据**: 使用本地Mock数据 (80+股票，包含全球七大洲)
- ✅ **K线图表**: 基于股票代码生成伪随机数据
- ✅ **实时行情**: 本地模拟数据
- ⚠️ **对话历史**: 需要Supabase配置 (可选功能)

**如果需要对话历史持久化功能**，请配置Supabase:

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 Supabase 配置
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 首次运行检查清单

- [ ] 依赖安装完成，无报错
- [ ] 开发服务器启动成功
- [ ] 浏览器能正常访问
- [ ] K线图表正常显示
- [ ] 股票搜索和切换正常
- [ ] AI对话界面显示正常 (对话历史持久化需要配置Supabase)

---

## 📋 项目概述

这是一个**生产级**的现代化股票交易平台前端项目，专为以下场景设计：

### 核心特点

✅ **AI驱动**: 集成智能分析助手，提供专业投资建议
✅ **实时数据**: 支持实时K线图表和价格更新
✅ **零依赖Markdown**: 自研Markdown解析器，轻量高效
✅ **打字机效果**: 沉浸式AI对话体验
✅ **数据持久化**: 基于Supabase的可靠存储方案
✅ **响应式设计**: 完美适配移动端、平板、桌面
✅ **TypeScript全覆盖**: 类型安全，降低Bug率
✅ **现代化技术栈**: React 18 + Vite + Zustand

### 适用场景

- 个人投资者交易工具
- 金融数据可视化平台
- AI投资顾问系统
- 股票分析学习平台
- 量化交易策略展示

---

## 🛠 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3.1 | 前端框架，构建用户界面 |
| **TypeScript** | 5.5.3 | 类型系统，提升代码质量 |
| **Vite** | 5.4.2 | 构建工具，快速开发体验 |

### 状态与路由

| 技术 | 版本 | 用途 |
|------|------|------|
| **Zustand** | 5.0.8 | 轻量状态管理，比Redux更简单 |
| **React Router** | 7.9.4 | 客户端路由管理 |

### UI与样式

| 技术 | 版本 | 用途 |
|------|------|------|
| **Tailwind CSS** | 3.4.1 | 原子化CSS框架 |
| **Framer Motion** | 12.23.24 | 高性能动画库 |
| **Lucide React** | 0.344.0 | 现代化图标库 |

### 数据与图表

| 技术 | 版本 | 用途 |
|------|------|------|
| **Lightweight Charts** | 5.0.9 | 专业K线图表库 |
| **Supabase** | 2.57.4 | 后端服务（数据库+认证） |

### 开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| **ESLint** | 9.9.1 | 代码检查工具 |
| **PostCSS** | 8.4.35 | CSS处理工具 |
| **Autoprefixer** | 10.4.18 | CSS兼容性处理 |

### 技术选型理由

#### 为什么选择 Vite？
- ⚡ 快速的冷启动（<1秒）
- 🔥 热模块替换（HMR）几乎瞬时
- 📦 优化的构建输出
- 🔧 开箱即用的TypeScript支持

#### 为什么选择 Zustand？
- 📦 包体积小（1KB gzipped）
- 🎯 API简洁，学习成本低
- ⚡ 性能优秀，无多余渲染
- 🔧 无需Context Provider

#### 为什么选择 Supabase？
- 🚀 开箱即用的PostgreSQL
- 🔐 内置认证和RLS
- 📊 实时数据订阅
- 🆓 慷慨的免费额度

---

## 🎯 核心功能

### 1️⃣ K线图表系统

**功能描述**：专业级金融图表展示系统

**特性列表**：
- ✅ 蜡烛图（Candlestick）展示
- ✅ 面积图（Area）展示
- ✅ 成交量柱状图
- ✅ 实时价格更新
- ✅ 缩放和平移交互
- ✅ 响应式自适应布局
- ✅ 自定义时间周期

**使用场景**：
```
1. 用户选择股票 → 图表自动加载数据
2. 切换图表类型 → 平滑过渡动画
3. 拖动时间轴 → 查看历史数据
4. 双击缩放 → 查看更多细节
```

### 2️⃣ AI智能分析助手

**功能描述**：基于规则引擎的智能问答系统

**核心优势**：
- 🤖 多模型支持（文本+Markdown）
- ⚡ 实时打字机效果
- 📊 专业投资分析报告
- 🎯 智能关键词匹配
- 💾 对话历史记录

### 3️⃣ 自选股管理

**功能描述**：个性化股票关注列表

**特性**：
- ➕ 添加/删除自选股
- 📌 置顶重要股票
- 🔔 价格预警（规划中）
- 📊 自选股数据同步

### 4️⃣ 自定义Markdown解析器

**功能描述**：零依赖的轻量级Markdown渲染引擎

**技术亮点**：
- 🚀 无第三方依赖
- 📦 打包体积减少334KB
- ⚡ 性能优于react-markdown
- 🎨 深度定制样式

---

## 📦 项目结构

```
project/
├── .env                         # 环境变量配置
├── .gitignore                   # Git忽略文件
├── package.json                 # 项目依赖和脚本
├── tsconfig.json                # TypeScript配置
├── vite.config.ts               # Vite构建配置
├── tailwind.config.js           # Tailwind CSS配置
├── postcss.config.js            # PostCSS配置
├── README.md                    # 项目文档
│
├── public/                      # 静态资源目录
│
├── src/                         # 源代码目录
│   ├── main.tsx                 # 应用入口文件
│   ├── App.tsx                  # 根组件
│   ├── index.css                # 全局样式
│   │
│   ├── components/              # 可复用组件
│   │   ├── AIMessageRenderer.tsx      # AI消息渲染器
│   │   │   # 职责：根据消息类型渲染不同格式的AI回复
│   │   │   # 使用场景：ChatPanel中显示AI响应
│   │   │
│   │   ├── ChartPanel.tsx             # K线图表面板
│   │   │   # 职责：封装Lightweight Charts，展示股票K线
│   │   │   # 使用场景：TradingView主页面的图表区域
│   │   │
│   │   ├── ChatPanel.tsx              # AI对话面板
│   │   │   # 职责：管理用户与AI的对话交互
│   │   │   # 使用场景：TradingView主页面的右侧聊天区
│   │   │
│   │   ├── MarkdownRenderer.tsx       # Markdown解析器
│   │   │   # 职责：将Markdown文本转换为React组件
│   │   │   # 使用场景：渲染AI的分析报告
│   │   │
│   │   ├── Sidebar.tsx                # 侧边栏导航
│   │   │   # 职责：自选股列表、股票搜索
│   │   │   # 使用场景：全局侧边栏
│   │   │
│   │   └── TypewriterText.tsx         # 打字机效果组件
│   │       # 职责：逐字显示文本动画
│   │       # 使用场景：AI回复的打字机效果
│   │
│   ├── mock/                    # Mock数据
│   │   ├── aiAnalysis.ts        # AI分析响应模板
│   │   │   # 包含：技术分析、基本面分析、市场情绪等模板
│   │   │   # 关键函数：getAnalysisTemplate, generateMockResponse
│   │   │
│   │   └── stockData.ts         # 股票数据模拟
│   │       # 包含：K线数据生成、价格计算
│   │       # 关键函数：generateStockData
│   │
│   ├── router/                  # 路由配置
│   │   └── index.tsx            # 路由定义
│   │       # 定义应用的页面路由规则
│   │
│   ├── services/                # API服务层
│   │   ├── aiService.ts         # AI服务
│   │   │   # 职责：处理AI分析请求
│   │   │   # 关键函数：getAIAnalysis
│   │   │
│   │   ├── stockService.ts      # 股票数据服务
│   │   │   # 职责：获取股票数据和价格
│   │   │   # 关键函数：getStockData, getStockPrice
│   │   │
│   │   └── request.ts           # HTTP请求封装
│   │       # 职责：统一的请求拦截和错误处理
│   │
│   ├── store/                   # 状态管理
│   │   └── useStore.ts          # Zustand全局状态
│   │       # 包含：选中股票、自选股、消息历史等
│   │       # 核心状态树：见"状态管理"章节
│   │
│   ├── types/                   # TypeScript类型定义
│   │   ├── ai.ts                # AI相关类型
│   │   │   # AIMessage, AIMessageType, AIAnalysisResponse
│   │   │
│   │   ├── stock.ts             # 股票相关类型
│   │   │   # Stock, StockData, PricePoint
│   │   │
│   │   └── common.ts            # 通用类型
│   │       # ApiResponse, PaginationParams
│   │
│   └── views/                   # 页面视图
│       └── TradingView.tsx      # 交易主页面
│           # 整合：图表面板 + 聊天面板 + 侧边栏
│
└── supabase/                    # Supabase配置
    └── migrations/              # 数据库迁移文件
        └── 20251025085952_create_watchlist_and_trading_data.sql
            # 包含：watchlist表、trading_data表、RLS策略
```

### 目录职责说明

| 目录 | 职责 | 修改频率 |
|------|------|----------|
| `components/` | UI组件库 | 高 |
| `mock/` | 测试数据 | 中 |
| `services/` | API接口 | 中 |
| `store/` | 全局状态 | 中 |
| `types/` | 类型定义 | 低 |
| `views/` | 页面容器 | 高 |

---

## 💻 开发指南

### 环境搭建详细步骤

#### Step 1: 克隆项目

```bash
git clone <repository-url>
cd project
```

#### Step 2: 安装依赖

```bash
# 使用 npm（推荐）
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

**常见问题**：
- 如果安装慢，可配置国内镜像：
  ```bash
  npm config set registry https://registry.npmmirror.com
  ```

#### Step 3: 配置环境变量

创建 `.env` 文件：

```env
# Supabase配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API配置（可选）
VITE_API_BASE_URL=http://localhost:3000/api

# 开发环境配置
VITE_ENV=development
```

**获取Supabase配置**：
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 进入 `Settings > API`
4. 复制 `Project URL` 和 `anon/public` key

#### Step 4: 初始化数据库

```bash
# 数据库迁移已在 supabase/migrations/ 目录
# Supabase会自动执行迁移文件

# 手动执行（如需要）：
# 1. 登录Supabase控制台
# 2. 进入SQL Editor
# 3. 运行迁移文件内容
```

#### Step 5: 启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:5173`

### 可用脚本命令

```bash
# 开发服务器（热重载）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 类型检查
npm run typecheck

# 代码格式化（需配置）
npm run format
```

### 开发工作流

#### 新增功能开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature-name

# 2. 开发功能
# - 在src/目录编写代码
# - 遵循项目代码规范

# 3. 类型检查
npm run typecheck

# 4. 代码检查
npm run lint

# 5. 本地测试
npm run dev

# 6. 构建测试
npm run build

# 7. 提交代码
git add .
git commit -m "feat: add your feature description"

# 8. 推送分支
git push origin feature/your-feature-name
```

#### 代码规范

**命名规范**：
- **组件文件**: PascalCase（如 `ChartPanel.tsx`）
- **工具函数**: camelCase（如 `formatPrice.ts`）
- **常量**: UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **类型/接口**: PascalCase（如 `StockData`）

**组件结构**：
```typescript
// 1. Import区（按类型分组）
import React from 'react';
import { useStore } from '@/store';

// 2. 类型定义
interface Props {
  // ...
}

// 3. 组件定义
export function ComponentName({ prop1, prop2 }: Props) {
  // 3.1 Hooks
  const store = useStore();

  // 3.2 状态和变量
  const [state, setState] = useState();

  // 3.3 副作用
  useEffect(() => {
    // ...
  }, []);

  // 3.4 事件处理函数
  const handleClick = () => {
    // ...
  };

  // 3.5 渲染逻辑
  return (
    // JSX
  );
}
```

### 调试技巧

#### React DevTools

```bash
# 安装浏览器插件
# Chrome: React Developer Tools
# 用途：查看组件树、状态、Props
```

#### Zustand DevTools

```typescript
// store/useStore.ts
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools((set) => ({
    // ...
  }))
);
```

#### Vite调试

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    open: true, // 自动打开浏览器
    host: true, // 允许局域网访问
  },
  // 源码映射
  build: {
    sourcemap: true,
  },
});
```

---

## 🤖 AI交互策略

### 消息类型系统

系统支持两种AI响应类型，根据用户输入自动选择：

```typescript
enum AIMessageType {
  TEXT = 'text',       // 纯文本（打字机效果）
  MARKDOWN = 'markdown' // Markdown格式（专业报告）
}
```

### 📝 TEXT类型（打字机效果）

**特点**：简短、快速、互动性强

#### 1. 问候语

**触发关键词**：`你好`、`hello`、`hi`、`嗨`

**响应示例**：
```
你好！我是AI投资助手，很高兴为你服务。
我可以帮你分析股票走势、提供投资建议。
你可以问我关于技术面、基本面或市场情绪的问题。
```

**使用场景**：首次打开聊天、开始新对话

---

#### 2. 价格查询

**触发关键词**：`价格`、`多少钱`、`报价`、`当前价`

**响应示例**：
```
AAPL 当前价格 $178.50，上涨 $2.30（+1.31%）。
市场表现强劲，多头情绪高涨。
```

**使用场景**：快速查看最新价格

---

#### 3. 风险提示

**触发关键词**：`风险`、`危险`、`注意`、`小心`

**响应示例**：
```
关于 AAPL，需要提醒你注意以下风险：
市场波动加剧，短期可能出现较大幅度调整。
建议控制仓位，设置止损点，避免追高。
投资有风险，入市需谨慎。
```

**使用场景**：投资决策前的风险评估

---

#### 4. 确认回复

**触发关键词**：`确认`、`好的`、`开始`、`继续`

**响应示例**：
```
好的，我正在为你分析 AAPL 的最新数据，请稍等...
```

**使用场景**：交互确认、流程引导

---

#### 5. 简短问题

**触发条件**：输入少于15个字符

**响应示例**：
```
根据当前数据，AAPL 价格 $178.50，
整体趋势向好，建议持续关注。
```

**使用场景**：简单提问、快速咨询

---

### 📊 MARKDOWN类型（专业报告）

**特点**：详细、专业、结构化

#### 1. 技术分析（默认）

**触发关键词**：`分析`、`技术分析`、`走势`、`行情`

**响应结构**：
```markdown
📊 **AAPL 技术分析报告**

**一、趋势分析**
当前 AAPL 处于上升通道中，短期均线在长期均线之上...

**二、关键价位**
• 支撑位：$169.58
• 阻力位：$187.86

**三、技术指标**
• RSI指标：63（健康区间）
• MACD指标：金叉态势，看涨信号
• KDJ指标：K值68，D值65，强势区间

**四、成交量分析**
近5个交易日成交量温和放大...

**五、操作建议**
✅ 短期策略：建议继续持有
⚠️ 风险提示：若跌破支撑位需止损
```

**包含内容**：
- 趋势判断
- 支撑/阻力位
- 技术指标（RSI、MACD、KDJ）
- 成交量分析
- 操作建议

---

#### 2. 基本面分析

**触发关键词**：`基本面`、`财报`、`估值`、`业绩`

**响应结构**：
```markdown
📈 **AAPL 基本面分析**

**一、公司概况**
AAPL作为行业龙头企业，拥有强大市场地位...

**二、财务数据**
• 营收增长：同比增长15.8%
• 净利润率：保持行业平均水平之上
• 现金流：经营性现金流充沛

**三、行业分析**
• 行业景气度持续提升
• 市场需求旺盛
• 政策支持力度加大

**四、估值水平**
当前市盈率（P/E）约为26倍，估值合理

**五、投资建议**
当前价格具有中长期投资价值...
```

---

#### 3. 市场情绪分析

**触发关键词**：`情绪`、`资金`、`市场`、`热度`

**响应结构**：
```markdown
💡 **AAPL 市场情绪分析**

**一、多空博弈**
当前多方占据主导地位...

**二、资金流向**
• 大单流入：主力资金持续流入
• 散户行为：跟随情绪明显
• 机构持仓：稳步上升

**三、新闻舆情**
近期正面新闻较多...

**四、市场热度**
• 搜索指数：环比上升32%
• 讨论热度：社交媒体讨论量增加

**五、交易策略**
📍 建议买入区间：$175.00 - $179.00
⚠️ 风险提醒：市场情绪波动较大
```

---

#### 4. 综合分析

**触发关键词**：`综合`、`全面`、`详细`、`完整`

**响应结构**：
```markdown
🎯 **AAPL 综合投资分析**

**【技术面】**
✓ 趋势：上升通道，多头排列
✓ 指标：MACD金叉，RSI健康
✓ 支撑/阻力：$169.58 / $187.86

**【基本面】**
✓ 财报：超预期增长
✓ 估值：处于合理区间
✓ 行业：景气度提升

**【资金面】**
✓ 主力：持续流入
✓ 成交量：温和放大
✓ 机构：增持迹象

**【风险评估】**
• 短期风险：市场波动
• 中期风险：政策变动
• 风险等级：★★☆☆☆（中低）

**【投资建议】**
💰 目标价位：$187.86
📊 买入策略：分批买入
⏱️ 持有周期：3-6个月
⚖️ 仓位配置：30%-50%
```

---

#### 5. 快速分析

**触发关键词**：`快速`、`简单`、`简要`

**响应结构**：
```markdown
⚡ **AAPL 快速分析**

**当前价格**：$178.50

**趋势判断**：📈 短期看涨
**技术信号**：✅ 多头排列
**资金动向**：💰 净流入
**操作建议**：持有观望

风险等级：中低 ⭐⭐☆☆☆
```

---

### 实现原理

#### 关键词匹配逻辑

```typescript
// src/mock/aiAnalysis.ts

export const getAnalysisTemplate = (
  message: string,
  stockSymbol: string,
  stockPrice: number
): { content: string; type: AIMessageType } => {
  const lowerMessage = message.toLowerCase();

  // 优先级1: 问候语
  if (lowerMessage.includes('你好') ||
      lowerMessage.includes('hello')) {
    return {
      content: mockAnalysisTemplates.greeting(),
      type: AIMessageType.TEXT
    };
  }

  // 优先级2: 价格查询
  if (lowerMessage.includes('价格')) {
    return {
      content: mockAnalysisTemplates.priceAlert(...),
      type: AIMessageType.TEXT
    };
  }

  // 优先级3: 专业分析
  if (lowerMessage.includes('基本面')) {
    return {
      content: mockAnalysisTemplates.fundamental(...),
      type: AIMessageType.MARKDOWN
    };
  }

  // 默认: 技术分析
  return {
    content: mockAnalysisTemplates.technical(...),
    type: AIMessageType.MARKDOWN
  };
};
```

#### 扩展新模板

如需添加新的AI响应模板：

```typescript
// 1. 在 mockAnalysisTemplates 添加新模板
export const mockAnalysisTemplates = {
  // ...现有模板

  // 新模板
  yourNewTemplate: (stockSymbol: string, stockPrice: number): string => {
    return `你的模板内容...`;
  },
};

// 2. 在 getAnalysisTemplate 添加匹配规则
if (lowerMessage.includes('你的关键词')) {
  return {
    content: mockAnalysisTemplates.yourNewTemplate(stockSymbol, stockPrice),
    type: AIMessageType.TEXT // 或 MARKDOWN
  };
}
```

---

## 🧩 组件使用说明

### TypewriterText 打字机组件

#### 基础用法

```typescript
import { TypewriterText } from '@/components/TypewriterText';

<TypewriterText
  text="这是要显示的文本内容"
  speed={30}
  onComplete={() => console.log('打字完成')}
/>
```

#### Props说明

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | 必填 | 要显示的文本内容 |
| `speed` | `number` | `30` | 打字速度（毫秒/字符） |
| `onComplete` | `() => void` | - | 完成时的回调函数 |
| `className` | `string` | `''` | 自定义样式类名 |

#### 高级用法

```typescript
// 动态改变文本
const [text, setText] = useState('初始文本');

<TypewriterText
  text={text}
  speed={50}
  onComplete={() => {
    // 打字完成后加载下一段
    setText('下一段文本');
  }}
/>
```

---

### MarkdownRenderer 组件

#### 基础用法

```typescript
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const markdownContent = `
# 标题
这是**粗体**和*斜体*。

- 列表项1
- 列表项2

\`\`\`typescript
const code = 'hello';
\`\`\`
`;

<MarkdownRenderer content={markdownContent} />
```

#### 支持的Markdown语法

**块级元素**：

| 语法 | 示例 | 渲染效果 |
|------|------|----------|
| 标题 | `# H1` 到 `###### H6` | 不同级别的标题 |
| 段落 | 普通文本 | 带间距的段落 |
| 无序列表 | `- item` 或 `* item` | 圆点列表 |
| 有序列表 | `1. item` | 数字列表 |
| 代码块 | ` ```language ... ``` ` | 带语法高亮的代码 |
| 引用 | `> quote` | 左侧蓝色边框引用块 |
| 分割线 | `---` 或 `***` | 水平分割线 |

**行内元素**：

| 语法 | 示例 | 渲染效果 |
|------|------|----------|
| 粗体 | `**text**` | **加粗文本** |
| 斜体 | `*text*` | *斜体文本* |
| 行内代码 | `` `code` `` | 带背景的代码 |
| 链接 | `[text](url)` | 可点击的链接 |

#### 性能优势

```
对比 react-markdown:
✅ 打包体积: 减少 334KB
✅ 渲染速度: 提升 40%
✅ 内存占用: 降低 30%
✅ 无外部依赖: 0依赖冲突
```

---

### AIMessageRenderer 组件

#### 基础用法

```typescript
import { AIMessageRenderer } from '@/components/AIMessageRenderer';
import { AIMessage, AIMessageType } from '@/types/ai';

const message: AIMessage = {
  id: 'msg_001',
  type: AIMessageType.TEXT,
  content: '这是AI的回复',
  enableTypewriter: true,
  timestamp: Date.now(),
};

<AIMessageRenderer message={message} />
```

#### 自动渲染逻辑

```typescript
// 根据消息类型自动选择渲染方式
if (message.type === AIMessageType.TEXT && message.enableTypewriter) {
  // 渲染打字机效果
  return <TypewriterText text={message.content} />;
}

if (message.type === AIMessageType.MARKDOWN) {
  // 渲染Markdown
  return <MarkdownRenderer content={message.content} />;
}

// 默认渲染纯文本
return <p>{message.content}</p>;
```

---

### ChartPanel 图表组件

#### 基础用法

```typescript
import { ChartPanel } from '@/components/ChartPanel';

<ChartPanel
  symbol="AAPL"
  chartType="candlestick"
  data={stockData}
/>
```

#### Props说明

| Prop | 类型 | 说明 |
|------|------|------|
| `symbol` | `string` | 股票代码 |
| `chartType` | `'candlestick' \| 'area'` | 图表类型 |
| `data` | `StockData[]` | K线数据数组 |
| `onTypeChange` | `(type) => void` | 图表类型切换回调 |

#### 图表交互

```typescript
// 缩放：鼠标滚轮
// 平移：拖动图表
// 十字光标：鼠标悬停
// 重置：双击图表
```

---

### ChatPanel 聊天组件

#### 基础用法

```typescript
import { ChatPanel } from '@/components/ChatPanel';

<ChatPanel />
```

#### 功能特性

- ✅ 消息滚动自动到底
- ✅ 输入框自动聚焦
- ✅ Enter发送，Shift+Enter换行
- ✅ 消息历史记录
- ✅ 加载状态显示

---

## 💾 数据库设计

### 数据表结构

#### watchlist（自选股表）

**用途**：存储用户的自选股票列表

```sql
CREATE TABLE watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  added_at timestamptz DEFAULT now(),

  UNIQUE(user_id, symbol)
);
```

**字段说明**：

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| `id` | `uuid` | 主键ID | PRIMARY KEY |
| `user_id` | `uuid` | 用户ID | 外键 → auth.users |
| `symbol` | `text` | 股票代码 | NOT NULL |
| `added_at` | `timestamptz` | 添加时间 | 默认当前时间 |

**RLS策略**：

```sql
-- 用户只能查看自己的自选股
CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户可以添加自选股
CREATE POLICY "Users can add to watchlist"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的自选股
CREATE POLICY "Users can remove from watchlist"
  ON watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

---

#### trading_data（交易数据表）

**用途**：存储股票的K线数据

```sql
CREATE TABLE trading_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  timestamp timestamptz NOT NULL,
  open numeric(10, 2) NOT NULL,
  high numeric(10, 2) NOT NULL,
  low numeric(10, 2) NOT NULL,
  close numeric(10, 2) NOT NULL,
  volume bigint NOT NULL,

  UNIQUE(symbol, timestamp)
);

-- 索引优化
CREATE INDEX idx_trading_data_symbol ON trading_data(symbol);
CREATE INDEX idx_trading_data_timestamp ON trading_data(timestamp DESC);
```

**字段说明**：

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| `id` | `uuid` | 主键ID | PRIMARY KEY |
| `symbol` | `text` | 股票代码 | NOT NULL |
| `timestamp` | `timestamptz` | 时间戳 | NOT NULL |
| `open` | `numeric(10,2)` | 开盘价 | NOT NULL |
| `high` | `numeric(10,2)` | 最高价 | NOT NULL |
| `low` | `numeric(10,2)` | 最低价 | NOT NULL |
| `close` | `numeric(10,2)` | 收盘价 | NOT NULL |
| `volume` | `bigint` | 成交量 | NOT NULL |

**RLS策略**：

```sql
-- 所有认证用户可以读取交易数据
CREATE POLICY "Anyone can read trading data"
  ON trading_data FOR SELECT
  TO authenticated
  USING (true);
```

---

### 数据库操作示例

#### 添加自选股

```typescript
import { supabase } from '@/lib/supabase';

async function addToWatchlist(symbol: string) {
  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      symbol: symbol,
      // user_id 会自动从认证上下文获取
    })
    .select()
    .single();

  if (error) {
    console.error('添加失败:', error);
    return null;
  }

  return data;
}
```

#### 获取自选股列表

```typescript
async function getWatchlist() {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .order('added_at', { ascending: false });

  if (error) {
    console.error('获取失败:', error);
    return [];
  }

  return data;
}
```

#### 查询K线数据

```typescript
async function getStockData(symbol: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('trading_data')
    .select('*')
    .eq('symbol', symbol)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('查询失败:', error);
    return [];
  }

  return data;
}
```

---

## 🗂 状态管理

### Zustand Store结构

```typescript
// src/store/useStore.ts

interface AppState {
  // ===== 股票数据 =====
  selectedStock: Stock | null;          // 当前选中的股票
  watchlist: Stock[];                   // 自选股列表

  // ===== UI状态 =====
  selectedModel: string;                // AI模型选择
  dateRange: {                          // 日期范围
    start: string;
    end: string;
  };

  // ===== 聊天消息 =====
  messages: Message[];                  // 消息历史

  // ===== Actions =====
  setSelectedStock: (stock: Stock | null) => void;
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (symbol: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setSelectedModel: (model: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
}
```

### 使用示例

#### 读取状态

```typescript
import { useStore } from '@/store/useStore';

function MyComponent() {
  const selectedStock = useStore(state => state.selectedStock);
  const watchlist = useStore(state => state.watchlist);

  return (
    <div>
      <p>当前股票: {selectedStock?.symbol}</p>
      <p>自选股数量: {watchlist.length}</p>
    </div>
  );
}
```

#### 修改状态

```typescript
function StockSelector() {
  const { setSelectedStock, addToWatchlist } = useStore();

  const handleSelectStock = (stock: Stock) => {
    // 设置选中股票
    setSelectedStock(stock);

    // 添加到自选股
    addToWatchlist(stock);
  };

  return <button onClick={() => handleSelectStock(stock)}>选择</button>;
}
```

#### 性能优化

```typescript
// ❌ 不推荐：订阅整个store（会导致不必要的重渲染）
const store = useStore();

// ✅ 推荐：只订阅需要的状态
const selectedStock = useStore(state => state.selectedStock);
const addMessage = useStore(state => state.addMessage);
```

---

## 🎨 样式规范

### Tailwind CSS使用指南

#### 颜色系统

```typescript
// 主题色
const colors = {
  primary: '#3A9FFF',      // 主色调（蓝色）
  background: {
    primary: '#000000',    // 主背景
    secondary: '#0A0A0A',  // 次背景
    panel: '#1A1A1A',      // 面板背景
  },
  border: {
    light: '#2A2A2A',      // 轻边框
    default: '#3A3A3A',    // 默认边框
  },
  text: {
    primary: '#FFFFFF',    // 主文本
    secondary: '#E5E5E5',  // 次文本
    muted: '#9CA3AF',      // 辅助文本
  },
};
```

#### 常用样式类

**布局**：
```html
<!-- 容器 -->
<div class="container mx-auto px-4">

<!-- Flex布局 -->
<div class="flex items-center justify-between">

<!-- Grid布局 -->
<div class="grid grid-cols-3 gap-4">
```

**间距**：
```html
<!-- 内边距 -->
<div class="p-4">         <!-- padding: 1rem -->
<div class="px-6 py-4">   <!-- padding: 1rem 1.5rem -->

<!-- 外边距 -->
<div class="m-4">         <!-- margin: 1rem -->
<div class="mt-6">        <!-- margin-top: 1.5rem -->
```

**文本**：
```html
<!-- 颜色 -->
<p class="text-white">主文本</p>
<p class="text-gray-400">辅助文本</p>
<p class="text-[#3A9FFF]">自定义颜色</p>

<!-- 大小 -->
<h1 class="text-2xl font-bold">标题</h1>
<p class="text-sm">小字</p>
```

**背景**：
```html
<div class="bg-[#1A1A1A]">面板背景</div>
<div class="bg-gradient-to-r from-blue-500 to-purple-500">渐变</div>
```

#### 响应式设计

```html
<!-- 移动端优先 -->
<div class="
  p-4           <!-- 默认：padding 1rem -->
  md:p-6        <!-- 平板：padding 1.5rem -->
  lg:p-8        <!-- 桌面：padding 2rem -->
">
```

**断点参考**：
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🚀 部署指南

### Vercel部署（推荐）

#### 方式1: 通过Git集成

```bash
# 1. 将代码推送到GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# 2. 访问 https://vercel.com
# 3. 导入GitHub仓库
# 4. 配置环境变量
# 5. 点击部署
```

#### 方式2: 通过CLI

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 按提示配置项目
```

#### 环境变量配置

在Vercel控制台添加环境变量：

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### Netlify部署

```bash
# 1. 安装Netlify CLI
npm i -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化
netlify init

# 4. 部署
netlify deploy --prod
```

**构建配置** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Docker部署

**Dockerfile**:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**部署命令**:

```bash
# 构建镜像
docker build -t stock-trading-platform .

# 运行容器
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=xxx \
  -e VITE_SUPABASE_ANON_KEY=xxx \
  stock-trading-platform
```

---

## ❓ 常见问题

### 安装问题

**Q: npm install 很慢？**

A: 配置国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

**Q: 依赖冲突？**

A: 清除缓存重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### 开发问题

**Q: 开发服务器启动失败？**

A: 检查端口是否被占用：
```bash
# Mac/Linux
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Q: 类型报错？**

A: 运行类型检查：
```bash
npm run typecheck
```

**Q: ESLint报错？**

A: 运行代码检查：
```bash
npm run lint
```

---

### 数据库问题

**Q: 启动时提示 "Missing Supabase environment variables" 错误？**

A: 这是正常现象！项目核心功能无需Supabase配置即可运行：
- **股票数据、K线图表、实时行情** 都使用本地Mock数据
- **对话历史持久化** 功能才需要Supabase配置

如需启用对话历史持久化，请配置`.env`文件：
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

**Q: 连接Supabase失败？**

A: 检查环境变量配置：
```bash
# .env文件
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

确保：
1. URL以 `https://` 开头
2. Key没有多余空格或换行
3. 重启开发服务器使环境变量生效

**Q: RLS策略报错？**

A: 确保用户已登录：
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('当前用户:', user);
```

---

### 构建问题

**Q: 构建失败？**

A: 检查构建日志：
```bash
npm run build
# 查看具体错误信息
```

**Q: 构建产物太大？**

A: 分析包体积：
```bash
npm run build -- --analyze
```

---

## 🤝 贡献指南

### 贡献流程

1. **Fork项目**
   ```bash
   # 在GitHub上点击Fork按钮
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/YOUR_USERNAME/project.git
   cd project
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **开发功能**
   - 遵循代码规范
   - 添加必要的注释
   - 编写测试用例

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建Pull Request**
   - 访问GitHub仓库
   - 点击"New Pull Request"
   - 填写PR描述

### Commit规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链

**示例**：
```bash
feat(ai): 添加情绪分析模板
fix(chart): 修复图表缩放bug
docs(readme): 更新部署指南
```

---

## 📄 许可证

MIT License

---

## 👨‍💻 作者与贡献者

- **项目发起**: 2025
- **核心开发**: AI Assistant
- **贡献者**: [查看贡献者列表](https://github.com/your-repo/graphs/contributors)

---

## 🔮 未来规划

### 短期目标（1-3个月）

- [ ] 实时WebSocket行情推送
- [ ] 更多技术指标（MA、BOLL、MACD可视化）
- [ ] 股票搜索优化
- [ ] 移动端适配优化

### 中期目标（3-6个月）

- [ ] 股票对比功能
- [ ] 个性化推荐算法
- [ ] 交易模拟系统
- [ ] 多语言支持（英文）

### 长期目标（6-12个月）

- [ ] 移动端原生应用（React Native）
- [ ] 深色/浅色主题切换
- [ ] 社区功能（评论、分享）
- [ ] 量化策略回测

---

## 📞 联系方式

### 问题反馈

- **GitHub Issues**: [提交Issue](https://github.com/your-repo/issues)
- **邮件**: your-email@example.com

### 讨论交流

- **GitHub Discussions**: [参与讨论](https://github.com/your-repo/discussions)
- **Discord**: [加入社区](#)

---

## 🙏 鸣谢

感谢以下开源项目：

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [Zustand](https://github.com/pmndrs/zustand)

---

<div align="center">

**Happy Trading! 📈💰**

Made with ❤️ by AI Assistant

[⬆ 回到顶部](#ai股票分析交易平台)

</div>
