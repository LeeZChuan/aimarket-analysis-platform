# 本地开发指南

## 🎯 快速开始

### 前提条件
- ✅ Node.js 已安装
- ✅ 后端服务可以在 `localhost:80` 运行
- ✅ 前端依赖已安装（`npm install`）

---

## 🚀 启动步骤

### 步骤 1：启动后端服务

在你的后端项目目录中：

```bash
cd /path/to/your/backend
npm start  # 或你的后端启动命令

# 确保后端运行在 http://localhost:80
# 如果后端运行在其他端口，需要修改 vite.config.ts
```

**验证后端是否正常运行**：
```bash
# 在浏览器或终端测试
curl http://localhost:80/api/health
# 或
curl http://localhost:80/api/stocks
```

### 步骤 2：启动前端开发服务器

在当前前端项目目录：

```bash
npm run dev
```

你会看到类似输出：
```
  VITE v5.4.21  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 步骤 3：访问应用

打开浏览器访问：
```
http://localhost:5173
```

---

## 🔧 配置说明

### Vite 代理配置

项目已配置 Vite 代理（`vite.config.ts`）：

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:80',
      changeOrigin: true,
    },
  },
}
```

**这意味着**：
- 前端运行在：`http://localhost:5173`
- 所有 `/api/*` 请求会自动代理到：`http://localhost:80/api/*`
- 无需配置 `VITE_API_BASE_URL` 环境变量

### 环境变量

**本地开发**（`.env`）：
```env
# 本地开发不需要配置 VITE_API_BASE_URL
# Vite 代理会自动处理

# 只需要配置 Supabase（如果使用）
VITE_SUPABASE_URL=https://zntydktkcvusgjaphpja.supabase.co
VITE_SUPABASE_ANON_KEY=（你的 key）
```

**生产环境**（`.env.production`）：
```env
# 生产环境需要指定后端地址
VITE_API_BASE_URL=http://120.55.168.184/api
```

---

## 🌐 请求流程

### 本地开发时的请求流程

```
┌────────────────────────────────────────┐
│  浏览器                                │
│  http://localhost:5173                 │
└────────────────────────────────────────┘
              │
              │ 发起请求：fetch('/api/stocks')
              ▼
┌────────────────────────────────────────┐
│  Vite Dev Server (localhost:5173)     │
│  - 检测到 /api 开头的请求              │
│  - 自动代理到 localhost:80             │
└────────────────────────────────────────┘
              │
              │ 代理转发
              ▼
┌────────────────────────────────────────┐
│  后端服务 (localhost:80)               │
│  - 处理 /api/stocks 请求               │
│  - 返回数据                            │
└────────────────────────────────────────┘
              │
              │ 响应返回
              ▼
┌────────────────────────────────────────┐
│  浏览器接收数据                        │
└────────────────────────────────────────┘
```

### 生产环境时的请求流程

```
┌────────────────────────────────────────┐
│  浏览器                                │
│  https://your-app.bolt.new             │
└────────────────────────────────────────┘
              │
              │ 发起请求
              ▼
┌────────────────────────────────────────┐
│  直接请求后端                          │
│  http://120.55.168.184/api/stocks      │
└────────────────────────────────────────┘
```

---

## 🛠️ 常见问题

### Q1: 后端运行在其他端口怎么办？

如果你的后端运行在 `localhost:3000` 或其他端口，修改 `vite.config.ts`：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // 改成你的端口
      changeOrigin: true,
    },
  },
}
```

### Q2: CORS 跨域错误？

本地开发时，由于使用了 Vite 代理，**不会**遇到 CORS 问题。

如果还是报 CORS 错误，检查：
1. ✅ 后端是否真的运行在 `localhost:80`
2. ✅ Vite 代理配置是否正确
3. ✅ 后端是否有自己的 CORS 限制

### Q3: 请求 404 Not Found？

检查清单：
1. ✅ 后端服务是否启动？
   ```bash
   curl http://localhost:80/api/health
   ```

2. ✅ API 路径是否正确？
   - 前端请求：`fetch('/api/stocks')`
   - 代理到：`http://localhost:80/api/stocks`

3. ✅ 后端路由是否正确？
   - 检查后端是否有 `/api/stocks` 路由

### Q4: 修改后端代码后前端没更新？

- 后端代码修改需要**重启后端服务**
- 前端代码修改会**自动热更新**（HMR）

### Q5: Cannot GET /api/xxx 错误？

这通常意味着：
1. ❌ 后端服务没有启动
2. ❌ 后端端口不是 80
3. ❌ 后端没有对应的路由

**解决方法**：
```bash
# 检查后端是否运行
curl http://localhost:80/api/stocks

# 如果无响应，启动后端
cd /path/to/backend
npm start
```

### Q6: 需要调试代理？

启动 Vite 时查看代理日志：

```bash
DEBUG=vite:* npm run dev
```

---

## 📊 开发工作流

### 典型的开发流程

1. **启动后端**
   ```bash
   cd backend-project
   npm start
   ```

2. **启动前端**（新终端窗口）
   ```bash
   cd frontend-project
   npm run dev
   ```

3. **开发**
   - 修改前端代码 → 自动刷新
   - 修改后端代码 → 重启后端服务
   - 浏览器访问：`http://localhost:5173`

4. **测试**
   - 在浏览器开发者工具查看网络请求
   - 检查 Console 是否有错误

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

---

## 🎨 推荐的开发工具

### 浏览器扩展
- **React Developer Tools** - React 组件调试
- **Redux DevTools** - 状态管理调试（如果使用 Redux）
- **Network Tab** - 查看 API 请求

### VS Code 扩展
- **ESLint** - 代码规范检查
- **Prettier** - 代码格式化
- **TypeScript** - TS 类型提示
- **Tailwind CSS IntelliSense** - Tailwind 提示

### 终端工具
- **同时启动前后端**：使用 `concurrently`
  ```bash
  npm install -g concurrently

  # 在 package.json 添加脚本
  "dev:all": "concurrently \"cd ../backend && npm start\" \"npm run dev\""
  ```

---

## 🔄 切换到生产环境

当你准备部署时：

### 步骤 1：确保后端部署到公网

```bash
# 后端部署到 120.55.168.184:80
# 或使用云服务商（阿里云、腾讯云等）
```

### 步骤 2：验证后端可访问

```bash
curl http://120.55.168.184/api/stocks
```

### 步骤 3：构建前端

```bash
npm run build
```

### 步骤 4：部署到 Bolt

在 Bolt 平台配置环境变量：
```
VITE_API_BASE_URL=http://120.55.168.184/api
```

---

## ✅ 快速检查清单

启动前检查：
- [ ] Node.js 已安装
- [ ] 依赖已安装（`npm install`）
- [ ] 后端服务可以启动
- [ ] 端口 5173 和 80 没有被占用

启动后检查：
- [ ] 后端运行在 `http://localhost:80`
- [ ] 前端运行在 `http://localhost:5173`
- [ ] 浏览器可以访问前端
- [ ] API 请求能正常返回数据

---

## 🆘 获取帮助

如果遇到问题：

1. **检查控制台输出**
   - 后端终端是否有错误？
   - 前端终端是否有错误？
   - 浏览器 Console 是否有错误？

2. **检查网络请求**
   - 打开浏览器开发者工具
   - 切换到 Network 标签
   - 查看 API 请求的状态码和响应

3. **重启服务**
   ```bash
   # 按 Ctrl+C 停止服务
   # 重新启动
   npm run dev
   ```

4. **清除缓存**
   ```bash
   # 删除 node_modules 和重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

---

**最后更新**：2024-01-19
**适用版本**：Vite 5.x + React 18.x
