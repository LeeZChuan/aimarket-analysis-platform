# 快速部署指南

## 一、前端需要做的变更

✅ **已完成**：创建了 `.env.production` 文件，配置了后端 API 地址

```env
VITE_API_BASE_URL=http://120.55.168.184
```

## 二、部署步骤（Bolt 平台）

### 1️⃣ 构建项目
```bash
npm install
npm run build
```

### 2️⃣ 登录 Bolt.new
访问 https://bolt.new 并登录账户

### 3️⃣ 创建/导入项目
- 点击 "New Project"
- 选择 GitHub 仓库或上传本地项目

### 4️⃣ 配置环境变量
在 Bolt 项目设置中添加：
```
VITE_API_BASE_URL=http://120.55.168.184/api
```

### 5️⃣ 配置构建设置
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 6️⃣ 部署
点击 "Deploy" 按钮，等待部署完成

---

## 三、后端必须配置 CORS

⚠️ **重要**：在 120.55.168.184 服务器上配置响应头：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id
```

---

## 四、验证清单

部署完成后，检查以下功能：

- [ ] 能否正常访问前端页面
- [ ] 打开 F12 检查 API 请求地址是否为 `http://120.55.168.184/api/xxx`
- [ ] 登录功能是否正常
- [ ] 股票数据是否能正常加载
- [ ] 无 CORS 错误

---

## 五、后端 API 端点要求

确保后端已实现以下接口：

**认证**
- POST /api/auth/login
- GET /api/auth/me

**股票**
- GET /api/stocks
- GET /api/stocks/:symbol/timeline
- GET /api/stocks/:symbol/kline

**自选股**
- GET /api/watchlist
- POST /api/watchlist
- DELETE /api/watchlist/:symbol

**AI**
- POST /api/ai/chat

---

## 常见问题速查

**Q: CORS 错误？**
→ 后端需要配置跨域响应头

**Q: 刷新页面 404？**
→ 服务器需要配置 SPA 路由回退

**Q: 环境变量不生效？**
→ 确认在部署平台配置了环境变量并重新构建

**Q: 白屏？**
→ 检查浏览器控制台错误日志

---

详细文档请查看：[DEPLOYMENT.md](./DEPLOYMENT.md)

---

更多文档：
- [后端 API 规格说明](./BACKEND_API_SPEC.md)
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [本地开发指南](./LOCAL_DEVELOPMENT.md)
