import {
  RECOMMENDATION_LABEL,
  TRAFFIC_LIGHT_LABEL,
  buildStockOutlookRequest,
  getVisibleFocusLabels,
  normalizeProbability,
  shouldShowCandidates,
} from '../src/views/AIReportView/reportUtils';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertArrayEqual(actual: string[], expected: string[], message: string): void {
  assertEqual(actual.join('|'), expected.join('|'), message);
}

const shortRequest = buildStockOutlookRequest(' 分析苹果走势 ', 'short');
assertEqual(shortRequest.query, '分析苹果走势', 'request query should be trimmed');
assertEqual(shortRequest.horizon, 'short', 'request horizon should be preserved');
assertEqual(shortRequest.locale, 'zh-CN', 'request locale should be zh-CN');
assertEqual(shortRequest.symbol, undefined, 'request symbol should be optional');

const longRequest = buildStockOutlookRequest('AAPL Apple', 'long', 'AAPL');
assertEqual(longRequest.symbol, 'AAPL', 'request symbol should be included when selected');
assertEqual(longRequest.horizon, 'long', 'long request horizon should be preserved');

assertEqual(shouldShowCandidates(0.69), true, 'low confidence should show candidates');
assertEqual(shouldShowCandidates(0.7), false, 'threshold confidence should not show candidates');
assertEqual(TRAFFIC_LIGHT_LABEL.green, '安全', 'green status should map to safe label');
assertEqual(TRAFFIC_LIGHT_LABEL.red, '危险', 'red status should map to danger label');
assertEqual(RECOMMENDATION_LABEL.bullish, '看涨', 'bullish action should map to bullish label');
assertEqual(RECOMMENDATION_LABEL.avoid, '回避', 'avoid action should map to avoid label');

assertEqual(normalizeProbability(0.63), 63, 'fraction probability should convert to percent');
assertEqual(normalizeProbability(63), 63, 'percent probability should remain percent');
assertEqual(normalizeProbability(121), 100, 'probability should be capped at 100');
assertEqual(normalizeProbability(-1), 0, 'probability should not go below 0');

assertArrayEqual(
  getVisibleFocusLabels('short'),
  ['技术面', '资金动向', '明日涨跌概率'],
  'short horizon should expose short-only labels',
);
assertArrayEqual(
  getVisibleFocusLabels('long'),
  ['估值', '财报', '行业前景'],
  'long horizon should expose long-only labels',
);

assert(
  !getVisibleFocusLabels('short').includes('估值'),
  'short horizon should not include long-term labels',
);
assert(
  !getVisibleFocusLabels('long').includes('明日涨跌概率'),
  'long horizon should not include short-term labels',
);

console.log('stockReportFlow tests passed');
