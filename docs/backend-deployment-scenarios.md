# 后端部署场景说明

## 场景分析

根据你的问题，需要明确后端的部署位置，不同场景有不同的配置方式。

---

## 场景 1：后端在公网服务器（推荐）✅

### 适用情况
- 后端已部署在 `120.55.168.184:80`
- 可以通过公网 IP 访问
- **这是生产环境的标准配置**

### 前端配置
**无需修改**，当前配置已正确：

`.env.production`:
```env
VITE_API_BASE_URL=http://120.55.168.184/api
```

### Bolt 部署配置
环境变量设置：
```
VITE_API_BASE_URL=http://120.55.168.184/api
```

### 验证方法
```bash
# 测试后端是否可访问
curl http://120.55.168.184/api/health
# 或
curl http://120.55.168.184/api/stocks
```

### 架构图
```
┌─────────────────┐
│  Bolt 云端      │
│  (前端部署)     │──HTTP──┐
└─────────────────┘        │
                           ▼
                  ┌──────────────────┐
                  │ 120.55.168.184   │
                  │ (后端 API:80)    │
                  └──────────────────┘
```

---

## 场景 2：后端在本地 localhost（需要内网穿透）

### 适用情况
- 后端只在你的电脑上运行（`localhost:80`）
- 没有部署到公网服务器
- 需要让 Bolt 部署的前端访问

### ⚠️ 限制说明
**Bolt 部署的前端无法直接访问你电脑的 localhost**，因为：
1. Bolt 应用运行在云端服务器
2. 云端服务器的 localhost 是它自己，不是你的电脑
3. 你的电脑和云端服务器网络隔离

### 解决方案：使用内网穿透

#### 方案 A：ngrok（推荐）

**步骤 1：安装 ngrok**
```bash
# 访问 https://ngrok.com 注册账号
# 下载并安装 ngrok

# macOS
brew install ngrok

# Windows
# 下载 exe 文件并添加到 PATH

# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

**步骤 2：配置 token**
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

**步骤 3：启动穿透**
```bash
# 将本地 80 端口暴露到公网
ngrok http 80
```

**步骤 4：获取公网地址**
```
ngrok

Session Status                online
Account                       your@email.com
Version                       3.x.x
Region                        United States (us)
Latency                       30ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:80

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**步骤 5：修改前端配置**
```env
# .env.production
VITE_API_BASE_URL=https://abc123.ngrok-free.app/api
```

**步骤 6：在 Bolt 配置环境变量**
```
VITE_API_BASE_URL=https://abc123.ngrok-free.app/api
```

**步骤 7：重新构建部署**
```bash
npm run build
# 然后在 Bolt 重新部署
```

#### 方案 B：localtunnel（免费无需注册）

**步骤 1：安装**
```bash
npm install -g localtunnel
```

**步骤 2：启动**
```bash
lt --port 80 --subdomain my-stock-api
# 输出：your url is: https://my-stock-api.loca.lt
```

**步骤 3：修改配置**
```env
# .env.production
VITE_API_BASE_URL=https://my-stock-api.loca.lt/api
```

#### 方案 C：frp（自建穿透服务）

适合有自己的公网服务器的情况，配置较复杂。

### 架构图
```
┌─────────────────┐
│  Bolt 云端      │
│  (前端部署)     │──HTTPS──┐
└─────────────────┘         │
                            ▼
                   ┌──────────────────┐
                   │ ngrok 服务器     │
                   │ abc123.ngrok.io  │
                   └──────────────────┘
                            │
                            │ 穿透隧道
                            ▼
                   ┌──────────────────┐
                   │ 你的电脑         │
                   │ localhost:80     │
                   └──────────────────┘
```

### ⚠️ 内网穿透的限制
1. **不稳定**：依赖穿透服务可用性
2. **速度慢**：多一层转发
3. **免费版限制**：连接数、带宽限制
4. **安全性**：暴露本地服务到公网
5. **不适合生产**：仅用于开发测试

---

## 场景 3：完全本地开发

### 适用情况
- 开发阶段
- 前后端都在本地测试
- 不需要 Bolt 部署

### 配置

**前端（无需修改）**
```bash
npm run dev
# 运行在 http://localhost:5173
```

**后端**
```bash
# 在后端项目目录
npm start
# 运行在 http://localhost:80
```

**Vite 代理配置**（已配置）
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
    },
  },
});
```

### 工作原理
```
浏览器 → http://localhost:5173/api/stocks
         ↓ (Vite 代理)
         http://localhost:80/api/stocks
```

### 架构图
```
┌────────────────────────┐
│  你的电脑              │
│                        │
│  ┌──────────────────┐ │
│  │ 前端             │ │
│  │ localhost:5173   │ │
│  └──────────────────┘ │
│           │            │
│           │ Vite 代理  │
│           ▼            │
│  ┌──────────────────┐ │
│  │ 后端             │ │
│  │ localhost:80     │ │
│  └──────────────────┘ │
└────────────────────────┘
```

---

## 推荐部署方案

### 开发阶段
✅ **场景 3：完全本地开发**
- 前后端都在本地运行
- 使用 Vite 代理
- 快速迭代开发

### 测试阶段
✅ **场景 2：内网穿透**
- 后端在本地，使用 ngrok
- 前端部署到 Bolt 测试
- 验证部署流程

### 生产环境
✅ **场景 1：后端在公网服务器**
- 后端部署到 120.55.168.184
- 前端部署到 Bolt
- 稳定、高效、安全

---

## 快速决策表

| 问题 | 场景 1 | 场景 2 | 场景 3 |
|------|--------|--------|--------|
| 后端在哪？ | 公网服务器 | 本地 localhost | 本地 localhost |
| 前端在哪？ | Bolt 云端 | Bolt 云端 | 本地 |
| 适合环境 | 生产 | 测试 | 开发 |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 配置难度 | 简单 | 中等 | 简单 |
| 成本 | 服务器费用 | 免费（限制多） | 免费 |

---

## 常见问题

### Q1: 我的后端到底在哪？
**检查方法**：
```bash
# 尝试从其他设备访问
curl http://120.55.168.184/api/health

# 如果能访问 → 后端在公网（场景 1）
# 如果不能访问 → 后端在本地（场景 2）
```

### Q2: 为什么 Bolt 访问不到我的 localhost？
**原因**：
- Bolt 部署的应用在云端服务器上运行
- 云端的 localhost 是云端服务器自己，不是你的电脑
- 这是网络基本原理，无法直接访问

**解决方案**：
- 使用内网穿透（场景 2）
- 或者把后端也部署到公网（场景 1）

### Q3: ngrok 每次启动地址都变怎么办？
**方案 1**：使用固定子域名（需付费）
```bash
ngrok http 80 --subdomain=my-stock-api
```

**方案 2**：使用环境变量
- 每次启动 ngrok 后
- 在 Bolt 更新环境变量
- 重新部署

**方案 3**：使用自己的域名（需付费）
```bash
ngrok http 80 --domain=api.yourdomain.com
```

### Q4: 内网穿透安全吗？
**风险**：
- 本地服务暴露到公网
- 可能被扫描攻击

**安全建议**：
- 仅用于开发测试
- 设置访问密码/token
- 使用完立即关闭
- 生产环境使用场景 1

### Q5: 如何切换不同场景？
只需修改 `.env.production` 中的 `VITE_API_BASE_URL`：

```env
# 场景 1：公网服务器
VITE_API_BASE_URL=http://120.55.168.184/api

# 场景 2：ngrok 穿透
VITE_API_BASE_URL=https://abc123.ngrok-free.app/api

# 场景 3：本地开发（使用 npm run dev，不需要 .env.production）
```

---

## 下一步建议

### 如果你的后端已在 120.55.168.184
✅ **当前配置正确，无需修改**
- 直接在 Bolt 部署
- 配置环境变量：`VITE_API_BASE_URL=http://120.55.168.184/api`

### 如果你的后端只在本地
📌 **推荐方案**：
1. **短期**：使用 ngrok 进行测试
2. **长期**：将后端也部署到 120.55.168.184

---

## 配置文件模板

### 本地开发 (`.env`)
```env
# 开发环境不需要配置 API_BASE_URL
# Vite 会自动代理 /api 到 localhost:80
```

### 公网服务器 (`.env.production`)
```env
VITE_API_BASE_URL=http://120.55.168.184/api
VITE_SUPABASE_URL=https://zntydktkcvusgjaphpja.supabase.co
VITE_SUPABASE_ANON_KEY=（你的 key）
```

### ngrok 穿透 (`.env.production`)
```env
VITE_API_BASE_URL=https://YOUR_NGROK_URL.ngrok-free.app/api
VITE_SUPABASE_URL=https://zntydktkcvusgjaphpja.supabase.co
VITE_SUPABASE_ANON_KEY=（你的 key）
```

---

**最后更新**：2024-01-19
**文档版本**：1.0
