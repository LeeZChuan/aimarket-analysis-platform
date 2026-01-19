# 项目部署文档

## 目录
- [项目概述](#项目概述)
- [前端配置变更](#前端配置变更)
- [构建步骤](#构建步骤)
- [部署流程](#部署流程)
- [验证部署](#验证部署)
- [常见问题](#常见问题)

---

## 项目概述

### 技术栈
- **前端框架**: React + TypeScript + Vite
- **UI 组件**: shadcn/ui + Tailwind CSS
- **数据库**: MySQL（由后端 Node.js 服务内部使用）
- **后端服务**: 120.55.168.184:80

### 架构说明
```
前端 (React SPA)  ←→  后端 API (120.55.168.184:80)  ←→  MySQL（后端内部）
```

---

## 前端配置变更

### 1. 环境变量配置

已创建 `.env.production` 文件，配置如下：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://120.55.168.184/api
```

### 2. API 请求说明

- 所有 API 请求会自动添加 `/api` 前缀
- 实际请求地址：`http://120.55.168.184/api/xxx`
- 示例：
  - 股票列表：`http://120.55.168.184/api/stocks`
  - 用户登录：`http://120.55.168.184/api/auth/login`

### 3. 跨域配置（重要）

⚠️ **后端服务器需要配置 CORS**，允许前端域名访问：

```javascript
// 后端需要添加的响应头
Access-Control-Allow-Origin: * (或具体的前端域名)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id
```

---

## 构建步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 构建生产版本
```bash
npm run build
```

构建产物会生成在 `dist/` 目录下，包含：
- `index.html` - 入口文件
- `assets/` - 静态资源（CSS、JS、字体等）

### 3. 预览构建结果（可选）
```bash
npm run preview
```

---

## 部署流程

### 方式一：使用 Bolt 平台部署（推荐）

#### 步骤 1：登录 Bolt 平台
访问 [bolt.new](https://bolt.new) 并登录

#### 步骤 2：创建新项目
1. 点击 "New Project" 或 "Import"
2. 选择 "GitHub" 或 "Local Upload"

#### 步骤 3：上传项目
- 如果使用 GitHub：授权并选择仓库
- 如果本地上传：上传整个项目目录

#### 步骤 4：配置环境变量
在 Bolt 项目设置中添加环境变量：
```
VITE_API_BASE_URL=http://120.55.168.184
```

#### 步骤 5：配置构建命令
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 步骤 6：部署
点击 "Deploy" 按钮，等待构建和部署完成

---

### 方式二：手动部署到服务器

#### 步骤 1：构建项目
```bash
npm run build
```

#### 步骤 2：上传到服务器
使用 SCP 或 FTP 工具上传 `dist/` 目录到服务器

```bash
# 示例：使用 SCP
scp -r dist/* user@your-server:/var/www/html/
```

#### 步骤 3：配置 Nginx（如果使用 Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # 所有路由都返回 index.html（支持前端路由）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 步骤 4：重启 Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 验证部署

### 1. 访问前端
在浏览器中访问部署的前端地址

### 2. 检查网络请求
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 刷新页面
4. 检查 API 请求是否正确指向 `http://120.55.168.184/api/xxx`

### 3. 功能测试清单
- [ ] 登录功能
- [ ] 股票列表加载
- [ ] 图表数据显示
- [ ] AI 对话功能
- [ ] 自选股管理
- [ ] 主题切换

---

## 常见问题

### Q1: API 请求失败，显示 CORS 错误
**原因**: 后端未配置跨域支持

**解决方案**:
在后端服务器（120.55.168.184）配置 CORS 响应头：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id
```

### Q2: 刷新页面出现 404
**原因**: 服务器未配置 SPA 路由支持

**解决方案**:
- Nginx: 使用 `try_files $uri $uri/ /index.html;`
- Bolt: 通常自动处理，如有问题检查部署配置

### Q3: 环境变量未生效
**原因**:
1. 环境变量名称错误（必须以 `VITE_` 开头）
2. 构建时未读取到环境变量
3. 部署平台未配置环境变量

**解决方案**:
- 确认 `.env.production` 文件存在
- 在部署平台手动配置环境变量
- 重新构建项目

### Q4: 白屏或资源加载失败
**原因**: 静态资源路径错误

**解决方案**:
检查 `vite.config.ts` 中的 `base` 配置：
```typescript
export default defineConfig({
  base: '/', // 根路径部署
  // 或
  base: '/your-app/', // 子路径部署
})
```

### Q5: 后端数据库相关错误（MySQL）
**说明**: 本项目数据库使用 MySQL，且数据库逻辑在后端 Node.js 服务内；**前端部署无需单独配置/部署数据库**。

**排查建议**:
- 确认后端服务已正确配置 MySQL 连接并可用（查看后端日志）
- 确认后端对外 API 正常返回数据（前端只依赖 API）

---

## 后端 API 要求

### 必需的端点
根据项目代码，后端需要提供以下 API：

#### 1. 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

#### 2. 股票数据
- `GET /api/stocks` - 获取股票列表
- `GET /api/stocks/:symbol` - 获取单只股票详情
- `GET /api/stocks/:symbol/timeline` - 获取分时数据
- `GET /api/stocks/:symbol/kline` - 获取 K 线数据

#### 3. 自选股
- `GET /api/watchlist` - 获取自选股列表
- `POST /api/watchlist` - 添加自选股
- `DELETE /api/watchlist/:symbol` - 删除自选股

#### 4. AI 服务
- `POST /api/ai/chat` - AI 对话
- `GET /api/conversations` - 获取会话列表
- `POST /api/conversations` - 创建新会话

### API 响应格式
```typescript
{
  "code": 200,          // 业务状态码
  "message": "Success", // 消息
  "data": {},           // 数据
  "requestId": "xxx",   // 请求 ID
  "timestamp": 1234567890
}
```

---

## 性能优化建议

### 1. 启用 Gzip 压缩
在服务器配置中启用 Gzip：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. 配置 CDN
将静态资源部署到 CDN，提升加载速度

### 3. 启用 HTTP/2
```nginx
listen 443 ssl http2;
```

---

## 监控与日志

### 前端错误监控
建议接入错误监控服务（如 Sentry）：

```bash
npm install @sentry/react
```

### 关键指标
- 首屏加载时间
- API 请求成功率
- 错误率
- 用户活跃度

---

## 联系与支持

如有问题，请检查：
1. 浏览器控制台错误日志
2. 网络请求状态
3. 后端服务器日志

**重要提醒**：
- 确保后端服务（120.55.168.184:80）正常运行
- 确保 CORS 已正确配置
- 确保所有必需的 API 端点已实现
