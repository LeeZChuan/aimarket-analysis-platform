import http from 'node:http';
import { URL } from 'node:url';
import { STOCK_CATALOG, toPublicStock } from './stock-report/catalog.mjs';
import { buildStockOutlookReport } from './stock-report/reportService.mjs';
import { findStockBySymbol, searchStocks } from './stock-report/stockRecognition.mjs';

const DEFAULT_PORT = 8080;

function createRequestId() {
  return `api_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sendJson(res, statusCode, payload, requestId = createRequestId()) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  });
  res.end(JSON.stringify({
    requestId,
    timestamp: Date.now(),
    ...payload,
  }));
}

function sendSuccess(res, data, requestId) {
  sendJson(res, 200, {
    success: true,
    code: 0,
    message: 'Success',
    data,
  }, requestId);
}

function sendError(res, statusCode, message, requestId) {
  sendJson(res, statusCode, {
    success: false,
    code: statusCode,
    message,
    data: null,
  }, requestId);
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      const error = new Error('请求体过大');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('请求体必须是合法 JSON');
    error.statusCode = 400;
    throw error;
  }
}

function getQueryNumber(url, key, fallback) {
  const value = Number(url.searchParams.get(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function handleAuthLogin(req, res, requestId) {
  const body = await readJsonBody(req);
  if (!body.email || !body.password) {
    sendError(res, 400, '邮箱和密码不能为空', requestId);
    return;
  }

  if (body.email !== 'demo@example.com' || body.password !== 'test123') {
    sendError(res, 401, '测试账号或密码错误', requestId);
    return;
  }

  sendSuccess(res, {
    token: 'local-dev-token',
    user: {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
      status: 'active',
    },
  }, requestId);
}

function handleStocks(url, res, requestId) {
  const page = getQueryNumber(url, 'page', 1);
  const limit = getQueryNumber(url, 'limit', 50);
  const start = (page - 1) * limit;
  const stocks = STOCK_CATALOG.slice(start, start + limit).map(toPublicStock);
  sendSuccess(res, {
    stocks,
    total: STOCK_CATALOG.length,
    timestamp: Date.now(),
  }, requestId);
}

function handleStockSearch(url, res, requestId) {
  const keyword = url.searchParams.get('keyword') || '';
  const limit = getQueryNumber(url, 'limit', 20);
  const matches = searchStocks(keyword, limit).map(toPublicStock);
  sendSuccess(res, {
    stocks: matches,
    total: matches.length,
    timestamp: Date.now(),
  }, requestId);
}

function handleStockBySymbol(symbol, res, requestId) {
  const stock = findStockBySymbol(symbol);
  if (!stock) {
    sendError(res, 404, '未找到匹配股票', requestId);
    return;
  }

  sendSuccess(res, {
    stock: toPublicStock(stock),
  }, requestId);
}

async function handleStockReport(req, res, requestId) {
  const body = await readJsonBody(req);
  const report = buildStockOutlookReport(body);
  sendSuccess(res, report, requestId);
}

export function createApiServer() {
  return http.createServer(async (req, res) => {
    const requestId = req.headers['x-request-id'] || createRequestId();
    const url = new URL(req.url || '/', 'http://localhost');

    try {
      if (req.method === 'OPTIONS') {
        sendJson(res, 204, { success: true, code: 0, message: 'No Content', data: null }, requestId);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/login') {
        await handleAuthLogin(req, res, requestId);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/auth/me') {
        sendSuccess(res, {
          user: {
            id: 1,
            username: 'demo',
            email: 'demo@example.com',
            status: 'active',
          },
        }, requestId);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
        sendSuccess(res, { success: true }, requestId);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/stocks/search') {
        handleStockSearch(url, res, requestId);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/stocks') {
        handleStocks(url, res, requestId);
        return;
      }

      const stockMatch = url.pathname.match(/^\/api\/stocks\/([^/]+)$/);
      if (req.method === 'GET' && stockMatch) {
        handleStockBySymbol(decodeURIComponent(stockMatch[1]), res, requestId);
        return;
      }

      if (
        req.method === 'POST' &&
        (url.pathname === '/api/stock-reports/outlook' || url.pathname === '/stock-reports/outlook')
      ) {
        await handleStockReport(req, res, requestId);
        return;
      }

      sendError(res, 404, '接口不存在', requestId);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? '聚合服务内部异常' : error.message;
      sendError(res, statusCode, message, requestId);
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  const server = createApiServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`AstraTrade local API server listening on http://127.0.0.1:${port}`);
  });
}
