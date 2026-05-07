import assert from 'node:assert/strict';
import { createApiServer } from '../server/index.mjs';
import { buildStockOutlookReport } from '../server/stock-report/reportService.mjs';
import { resolveStock } from '../server/stock-report/stockRecognition.mjs';

function assertThrowsStatus(fn, statusCode, message) {
  try {
    fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    assert.equal(error.statusCode, statusCode, message);
  }
}

const appleBySymbol = resolveStock({ query: '随便分析一下', symbol: 'AAPL' });
assert.equal(appleBySymbol.stock.symbol, 'AAPL', 'symbol should resolve directly');
assert.equal(appleBySymbol.confidence, 1, 'direct symbol resolution should be full confidence');

const appleByChineseQuery = resolveStock({ query: '分析苹果走势' });
assert.equal(appleByChineseQuery.stock.symbol, 'AAPL', 'Chinese query should resolve Apple');
assert(appleByChineseQuery.confidence >= 0.7, 'known Chinese query should be high confidence');

const shortReport = buildStockOutlookReport({
  query: '分析苹果走势',
  horizon: 'short',
  locale: 'zh-CN',
});
assert.equal(shortReport.resolvedStock.symbol, 'AAPL', 'short report should resolve stock');
assert(shortReport.shortTerm, 'short report should include shortTerm');
assert.equal(shortReport.longTerm, undefined, 'short report should not include longTerm');
assert.deepEqual(
  shortReport.trafficLights.map((item) => item.key),
  ['fx', 'capital_flow', 'institution_holding'],
  'traffic lights should include fixed keys',
);
assert(
  shortReport.dataQuality.some((item) => item.key === 'capital_flow' && item.status === 'missing'),
  'missing capital flow data should be declared',
);

const longReport = buildStockOutlookReport({
  query: '特斯拉适合长期拿吗',
  horizon: 'long',
  locale: 'zh-CN',
});
assert.equal(longReport.resolvedStock.symbol, 'TSLA', 'long report should resolve stock');
assert(longReport.longTerm, 'long report should include longTerm');
assert.equal(longReport.shortTerm, undefined, 'long report should not include shortTerm');

assertThrowsStatus(
  () => buildStockOutlookReport({ query: '', horizon: 'short', locale: 'zh-CN' }),
  400,
  'empty query should fail with 400',
);
assertThrowsStatus(
  () => buildStockOutlookReport({ query: '苹果', horizon: 'mid', locale: 'zh-CN' }),
  400,
  'invalid horizon should fail with 400',
);
assertThrowsStatus(
  () => buildStockOutlookReport({ query: '完全不存在的股票', horizon: 'short', locale: 'zh-CN' }),
  404,
  'unknown stock should fail with 404',
);

const server = createApiServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const okResponse = await fetch(`${baseUrl}/api/stock-reports/outlook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '英伟达明天会涨吗',
      horizon: 'short',
      locale: 'zh-CN',
    }),
  });
  assert.equal(okResponse.status, 200, 'HTTP report endpoint should return 200');
  const okJson = await okResponse.json();
  assert.equal(okJson.success, true, 'HTTP report response should be successful');
  assert.equal(okJson.data.resolvedStock.symbol, 'NVDA', 'HTTP report should resolve NVDA');
  assert(okJson.data.shortTerm, 'HTTP short report should include shortTerm');

  const badResponse = await fetch(`${baseUrl}/api/stock-reports/outlook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '苹果',
      horizon: 'invalid',
      locale: 'zh-CN',
    }),
  });
  assert.equal(badResponse.status, 400, 'invalid HTTP request should return 400');

  const searchResponse = await fetch(`${baseUrl}/api/stocks/search?keyword=苹果&limit=3`);
  assert.equal(searchResponse.status, 200, 'stock search endpoint should return 200');
  const searchJson = await searchResponse.json();
  assert.equal(searchJson.data.stocks[0].symbol, 'AAPL', 'stock search should return Apple candidate');
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('stockReportApi tests passed');
