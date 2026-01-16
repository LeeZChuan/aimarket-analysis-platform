# 部署检查清单

## 部署前准备

### 前端检查
- [ ] 已安装依赖 (`npm install`)
- [ ] 本地构建成功 (`npm run build`)
- [ ] 已创建 `.env.production` 文件
- [ ] 环境变量配置正确（后端 API 地址：`http://120.55.168.184`）

### 后端检查（120.55.168.184:80）
- [ ] 后端服务正常运行
- [ ] 能通过 `http://120.55.168.184/api/health` 访问（如果有健康检查接口）
- [ ] CORS 响应头已配置：
  ```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id
  ```
- [ ] 所有必需的 API 端点已实现（见下方清单）

### 数据库检查（Supabase）
- [ ] Supabase 项目正常运行
- [ ] 数据库表已创建
- [ ] RLS 策略已配置
- [ ] 环境变量中的 Supabase URL 和 Key 正确

---

## 后端 API 端点清单

### 认证模块
- [ ] `POST /api/auth/login` - 用户登录
  - 请求体：`{ email, password }`
  - 响应：`{ token, user: { id, email, name } }`

- [ ] `POST /api/auth/logout` - 用户登出

- [ ] `GET /api/auth/me` - 获取当前用户信息
  - Header: `Authorization: Bearer {token}`
  - 响应：`{ id, email, name }`

### 股票数据模块
- [ ] `GET /api/stocks` - 获取股票列表
  - 参数：`page, pageSize`
  - 响应：`{ stocks: [...], total, page, pageSize }`

- [ ] `GET /api/stocks/:symbol` - 获取单只股票详情
  - 响应：`{ symbol, name, price, change, volume, ... }`

- [ ] `GET /api/stocks/:symbol/timeline` - 获取分时数据
  - 参数：`points` (可选)
  - 响应：`{ lineData: [...], volumeData: [...] }`

- [ ] `GET /api/stocks/:symbol/kline` - 获取 K 线数据
  - 参数：`period` (1D, 5D, 1W, 1M, 3M, 1Y)
  - 响应：`[{ timestamp, open, high, low, close, volume }, ...]`

### 自选股模块
- [ ] `GET /api/watchlist` - 获取自选股列表
  - Header: `Authorization: Bearer {token}`
  - 响应：`[{ symbol, name, price, change, ... }, ...]`

- [ ] `POST /api/watchlist` - 添加自选股
  - 请求体：`{ symbol }`
  - 响应：`{ success: true }`

- [ ] `DELETE /api/watchlist/:symbol` - 删除自选股
  - 响应：`{ success: true }`

### AI 对话模块
- [ ] `POST /api/ai/chat` - AI 对话
  - 请求体：`{ message, conversationId?, context? }`
  - 响应：`{ reply, conversationId }`

- [ ] `GET /api/conversations` - 获取会话列表
  - Header: `Authorization: Bearer {token}`
  - 响应：`[{ id, title, createdAt, updatedAt }, ...]`

- [ ] `POST /api/conversations` - 创建新会话
  - 请求体：`{ title }`
  - 响应：`{ id, title, createdAt }`

- [ ] `DELETE /api/conversations/:id` - 删除会话
  - 响应：`{ success: true }`

---

## 部署步骤

### 1. Bolt 平台配置
- [ ] 已注册/登录 Bolt.new
- [ ] 已创建新项目
- [ ] 已上传/连接代码仓库

### 2. 环境变量配置
在 Bolt 项目设置中添加：
- [ ] `VITE_API_BASE_URL=http://120.55.168.184`
- [ ] `VITE_SUPABASE_URL=https://zntydktkcvusgjaphpja.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY=（完整的 key）`

### 3. 构建配置
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Node Version: 18 或更高

### 4. 部署
- [ ] 点击 "Deploy" 按钮
- [ ] 等待构建完成（约 1-2 分钟）
- [ ] 获取部署 URL

---

## 部署后验证

### 基础检查
- [ ] 能正常访问前端页面（无白屏）
- [ ] 页面样式正常显示
- [ ] 无 JavaScript 错误（F12 控制台）

### 网络请求检查
打开浏览器开发者工具（F12）→ Network 标签：
- [ ] API 请求地址正确（`http://120.55.168.184/api/xxx`）
- [ ] 无 CORS 错误
- [ ] 请求返回正确的数据格式
- [ ] 响应状态码正常（200/201）

### 功能测试
#### 登录与认证
- [ ] 能打开登录页面
- [ ] 能成功登录（输入正确的邮箱密码）
- [ ] 登录失败显示错误提示
- [ ] 登录成功后跳转到交易面板
- [ ] 能正常退出登录

#### 股票列表
- [ ] 左侧股票列表正常加载
- [ ] 能切换"自选股"和"股票列表" tab
- [ ] 搜索功能正常工作
- [ ] 点击股票能切换选中状态

#### 图表功能
- [ ] K 线图正常显示
- [ ] 能切换时间周期（1D/5D/1W/1M/3M/1Y）
- [ ] 分时图正常显示
- [ ] 图表交互功能正常（缩放、拖拽、十字光标）

#### 自选股功能
- [ ] 能添加自选股（点击星标按钮）
- [ ] 能删除自选股
- [ ] 自选股列表实时更新
- [ ] 刷新页面后自选股数据保持

#### AI 对话功能
- [ ] 能打开 AI 对话面板
- [ ] 能发送消息
- [ ] AI 正常回复
- [ ] 能创建新会话
- [ ] 能查看历史会话
- [ ] 能切换会话

#### 主题切换
- [ ] 能切换亮色/暗色主题
- [ ] 主题切换后界面正常显示
- [ ] 刷新后主题设置保持

### 性能检查
- [ ] 首屏加载时间 < 3 秒
- [ ] 图表渲染流畅（无卡顿）
- [ ] 大列表滚动流畅（虚拟滚动）
- [ ] 无内存泄漏（长时间使用）

### 移动端检查（可选）
- [ ] 响应式布局正常
- [ ] 触摸交互正常
- [ ] 无水平滚动条

---

## 常见问题排查

### 问题 1: 白屏
**检查步骤**：
1. F12 查看控制台错误
2. 检查 Network 标签，确认资源加载成功
3. 检查路由配置是否正确

**可能原因**：
- JavaScript 加载失败
- 路由配置错误
- 环境变量未正确设置

### 问题 2: CORS 错误
**检查步骤**：
1. F12 → Network → 查看失败的请求
2. 检查 Response Headers 是否包含 CORS 头

**解决方案**：
在后端服务器添加 CORS 响应头

### 问题 3: API 请求 404
**检查步骤**：
1. 确认请求 URL 是否正确
2. 确认后端服务已启动
3. 确认后端路由已配置

**可能原因**：
- 后端接口未实现
- 请求路径错误
- 后端服务未启动

### 问题 4: 登录失败
**检查步骤**：
1. 检查用户名密码是否正确
2. 检查后端日志
3. 检查数据库连接

**可能原因**：
- 用户不存在
- 密码错误
- 数据库连接失败
- Token 生成失败

### 问题 5: 数据不显示
**检查步骤**：
1. F12 → Network → 检查 API 响应
2. 检查响应数据格式是否正确
3. 检查前端数据处理逻辑

**可能原因**：
- API 返回数据格式不正确
- 前端数据处理错误
- 后端数据为空

---

## 性能优化建议

### 已实现的优化
- ✅ 虚拟滚动（大列表性能优化）
- ✅ 组件懒加载（路由级别）
- ✅ 图表数据缓存
- ✅ 请求防抖/节流

### 可选优化
- [ ] 启用 CDN 加速静态资源
- [ ] 配置 Service Worker（PWA）
- [ ] 启用 HTTP/2
- [ ] 图片懒加载
- [ ] 代码分割优化

---

## 监控与维护

### 建议监控指标
- [ ] 页面加载时间
- [ ] API 请求成功率
- [ ] 错误发生率
- [ ] 用户活跃度
- [ ] 核心功能使用率

### 日志收集
- [ ] 前端错误日志
- [ ] API 请求日志
- [ ] 用户行为日志

### 定期检查
- [ ] 每日：检查服务可用性
- [ ] 每周：检查性能指标
- [ ] 每月：检查用户反馈

---

## 回滚计划

如果部署出现问题，执行以下步骤：

1. **立即回滚**
   - Bolt 平台：切换到上一个成功的部署版本
   - 手动部署：恢复备份的 dist 目录

2. **问题排查**
   - 查看部署日志
   - 检查环境变量配置
   - 验证后端服务状态

3. **修复后重新部署**
   - 在本地验证修复
   - 重新构建并部署
   - 完整验证功能

---

**部署完成时间**: ___________

**部署人员**: ___________

**验证人员**: ___________

**备注**: ___________
