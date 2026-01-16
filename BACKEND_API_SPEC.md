# 后端 API 接口规范

> 本文档定义了前端所需的后端 API 接口规范和数据格式

## 基础信息

- **服务器地址**: http://120.55.168.184:80
- **API 前缀**: `/api`
- **数据格式**: JSON
- **编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "Success",
  "data": { ... },
  "requestId": "req_1234567890_abc123",
  "timestamp": 1234567890000,
  "success": true
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息描述",
  "error": {
    "code": 400,
    "message": "详细错误信息"
  },
  "requestId": "req_1234567890_abc123",
  "timestamp": 1234567890000,
  "success": false
}
```

### 状态码说明
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权（未登录或 token 过期）
- `403` - 禁止访问（无权限）
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 1. 认证模块

### 1.1 用户登录
**接口**: `POST /api/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "张三"
    }
  },
  "success": true
}
```

---

### 1.2 获取当前用户信息
**接口**: `GET /api/auth/me`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "张三",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 1.3 退出登录
**接口**: `POST /api/auth/logout`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "退出成功",
  "success": true
}
```

---

## 2. 股票数据模块

### 2.1 获取股票列表
**接口**: `GET /api/stocks`

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 50）

**请求示例**:
```
GET /api/stocks?page=1&pageSize=50
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "stocks": [
      {
        "symbol": "600000",
        "name": "浦发银行",
        "price": 8.52,
        "change": 0.35,
        "volume": 12345678,
        "marketCap": 250000000000,
        "sector": "金融"
      },
      {
        "symbol": "000001",
        "name": "平安银行",
        "price": 12.34,
        "change": -0.52,
        "volume": 23456789,
        "marketCap": 238000000000,
        "sector": "金融"
      }
    ],
    "total": 4500,
    "page": 1,
    "pageSize": 50
  }
}
```

---

### 2.2 获取单只股票详情
**接口**: `GET /api/stocks/:symbol`

**路径参数**:
- `symbol`: 股票代码（如 600000）

**请求示例**:
```
GET /api/stocks/600000
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "symbol": "600000",
    "name": "浦发银行",
    "price": 8.52,
    "change": 0.35,
    "changePercent": 4.28,
    "volume": 12345678,
    "amount": 105234567.89,
    "open": 8.20,
    "high": 8.60,
    "low": 8.15,
    "close": 8.17,
    "marketCap": 250000000000,
    "pe": 5.23,
    "pb": 0.52,
    "sector": "金融",
    "updatedAt": "2024-01-01T15:00:00Z"
  }
}
```

---

### 2.3 获取分时数据
**接口**: `GET /api/stocks/:symbol/timeline`

**路径参数**:
- `symbol`: 股票代码

**查询参数**:
- `points`: 数据点数（可选，默认 240）

**请求示例**:
```
GET /api/stocks/600000/timeline?points=240
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "lineData": [
      { "time": "09:30", "value": 8.20, "timestamp": 1640995800000 },
      { "time": "09:31", "value": 8.22, "timestamp": 1640995860000 },
      { "time": "09:32", "value": 8.25, "timestamp": 1640995920000 }
    ],
    "volumeData": [
      { "time": "09:30", "value": 123456, "timestamp": 1640995800000 },
      { "time": "09:31", "value": 234567, "timestamp": 1640995860000 },
      { "time": "09:32", "value": 345678, "timestamp": 1640995920000 }
    ],
    "prevClose": 8.17
  }
}
```

---

### 2.4 获取 K 线数据
**接口**: `GET /api/stocks/:symbol/kline`

**路径参数**:
- `symbol`: 股票代码

**查询参数**:
- `period`: 时间周期（1D/5D/1W/1M/3M/1Y）
- `limit`: 数据条数（可选，默认 100）

**请求示例**:
```
GET /api/stocks/600000/kline?period=1D&limit=100
```

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "timestamp": 1640995800000,
      "open": 8.20,
      "high": 8.60,
      "low": 8.15,
      "close": 8.52,
      "volume": 12345678,
      "amount": 105234567.89
    },
    {
      "timestamp": 1641082200000,
      "open": 8.50,
      "high": 8.75,
      "low": 8.45,
      "close": 8.68,
      "volume": 13456789,
      "amount": 116345678.90
    }
  ]
}
```

---

## 3. 自选股模块

### 3.1 获取自选股列表
**接口**: `GET /api/watchlist`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "symbol": "600000",
      "name": "浦发银行",
      "price": 8.52,
      "change": 0.35,
      "changePercent": 4.28,
      "volume": 12345678,
      "marketCap": 250000000000,
      "addedAt": "2024-01-01T10:00:00Z"
    },
    {
      "symbol": "000001",
      "name": "平安银行",
      "price": 12.34,
      "change": -0.52,
      "changePercent": -4.05,
      "volume": 23456789,
      "marketCap": 238000000000,
      "addedAt": "2024-01-02T14:30:00Z"
    }
  ]
}
```

---

### 3.2 添加自选股
**接口**: `POST /api/watchlist`

**请求头**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "symbol": "600000"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "添加成功",
  "data": {
    "symbol": "600000",
    "name": "浦发银行",
    "addedAt": "2024-01-01T10:00:00Z"
  },
  "success": true
}
```

---

### 3.3 删除自选股
**接口**: `DELETE /api/watchlist/:symbol`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `symbol`: 股票代码

**请求示例**:
```
DELETE /api/watchlist/600000
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "success": true
}
```

---

## 4. AI 对话模块

### 4.1 AI 对话
**接口**: `POST /api/ai/chat`

**请求头**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "message": "分析一下浦发银行的走势",
  "conversationId": "conv_123",
  "context": {
    "stockSymbol": "600000",
    "timeRange": "1M"
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "reply": "根据近一个月的走势分析，浦发银行...",
    "conversationId": "conv_123",
    "messageId": "msg_456",
    "timestamp": 1640995800000
  }
}
```

---

### 4.2 获取会话列表
**接口**: `GET /api/conversations`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "title": "浦发银行走势分析",
        "messageCount": 15,
        "createdAt": "2024-01-01T10:00:00Z",
        "updatedAt": "2024-01-01T15:30:00Z"
      },
      {
        "id": "conv_124",
        "title": "科技股投资建议",
        "messageCount": 8,
        "createdAt": "2024-01-02T09:00:00Z",
        "updatedAt": "2024-01-02T11:20:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 4.3 创建新会话
**接口**: `POST /api/conversations`

**请求头**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "title": "新会话"
}
```

**响应示例**:
```json
{
  "code": 201,
  "data": {
    "id": "conv_125",
    "title": "新会话",
    "messageCount": 0,
    "createdAt": "2024-01-03T10:00:00Z",
    "updatedAt": "2024-01-03T10:00:00Z"
  }
}
```

---

### 4.4 删除会话
**接口**: `DELETE /api/conversations/:id`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `id`: 会话 ID

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "success": true
}
```

---

## 5. CORS 配置（重要）

### 必需的响应头
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id
Access-Control-Max-Age: 3600
```

### Nginx 配置示例
```nginx
server {
    listen 80;

    location /api {
        # CORS 配置
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Request-Id' always;

        # OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        # 代理到后端服务
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 6. 认证机制

### Token 格式
使用 JWT (JSON Web Token)

### 请求头
```
Authorization: Bearer {token}
```

### Token 过期处理
- Token 过期时返回 `401` 状态码
- 前端收到 `401` 自动跳转登录页
- 前端会清除本地 token

---

## 7. 错误处理

### 常见错误码
- `400` - 请求参数错误
- `401` - 未授权（token 无效或过期）
- `403` - 禁止访问（权限不足）
- `404` - 资源不存在
- `429` - 请求过于频繁
- `500` - 服务器内部错误

### 错误响应示例
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "code": "INVALID_PARAMS",
    "message": "股票代码格式不正确",
    "details": {
      "field": "symbol",
      "value": "abc",
      "expected": "6位数字"
    }
  },
  "requestId": "req_1234567890_abc123",
  "timestamp": 1640995800000,
  "success": false
}
```

---

## 8. 数据验证

### 股票代码格式
- A 股：6 位数字（如 600000, 000001）
- 长度：6 位
- 字符：仅数字

### 邮箱格式
- 标准邮箱格式
- 示例：`user@example.com`

### 密码要求
- 最小长度：8 位
- 建议包含：大小写字母、数字、特殊字符

---

## 9. 性能要求

### 响应时间
- 列表查询：< 500ms
- 详情查询：< 300ms
- 数据写入：< 1s
- AI 对话：< 3s

### 并发支持
- 建议支持至少 100 并发请求

### 数据缓存
- 股票列表：缓存 1 分钟
- 股票详情：缓存 30 秒
- K 线数据：缓存 5 分钟

---

## 10. 测试建议

### 单元测试
- 每个 API 接口
- 参数验证
- 错误处理

### 集成测试
- 完整业务流程
- 跨模块交互

### 压力测试
- 并发请求
- 大数据量处理

---

## 附录：快速测试脚本

### 使用 curl 测试

#### 登录
```bash
curl -X POST http://120.55.168.184/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### 获取股票列表
```bash
curl http://120.55.168.184/api/stocks?page=1&pageSize=10
```

#### 获取 K 线数据
```bash
curl http://120.55.168.184/api/stocks/600000/kline?period=1D
```

---

**文档版本**: 1.0
**最后更新**: 2024-01-16
**维护人员**: 开发团队
