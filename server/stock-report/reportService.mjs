import crypto from 'node:crypto';
import { resolveStock } from './stockRecognition.mjs';

const TRAFFIC_LIGHTS = [
  {
    key: 'fx',
    title: '汇率波动',
    missingMessage: '暂未接入股票营收币种、汇率暴露和汇率时间序列数据源。',
  },
  {
    key: 'capital_flow',
    title: '主力资金流向',
    missingMessage: '暂未接入主力资金净流入、主动买卖盘和大单流向数据源。',
  },
  {
    key: 'institution_holding',
    title: '机构持仓变化',
    missingMessage: '暂未接入机构持仓比例、增减持和申报周期变化数据源。',
  },
];

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function validateRequest(payload) {
  const query = typeof payload?.query === 'string' ? payload.query.trim() : '';
  const symbol = typeof payload?.symbol === 'string' ? payload.symbol.trim().toUpperCase() : undefined;
  const horizon = payload?.horizon;
  const locale = payload?.locale || 'zh-CN';

  if (!query) {
    throw badRequest('query 不能为空');
  }

  if (horizon !== 'short' && horizon !== 'long') {
    throw badRequest('horizon 只能为 short 或 long');
  }

  if (locale !== 'zh-CN') {
    throw badRequest('locale 首版仅支持 zh-CN');
  }

  return {
    query,
    symbol,
    horizon,
    locale,
  };
}

function createMissingTrafficLights() {
  return TRAFFIC_LIGHTS.map((light) => ({
    key: light.key,
    status: 'yellow',
    title: light.title,
    value: '数据源暂缺',
    reason: `${light.missingMessage} 当前不输出方向性判断，建议保持关注。`,
  }));
}

function createDataQuality(horizon) {
  const common = [
    { key: 'stock_resolution', status: 'ok', message: '股票识别已完成。' },
    { key: 'fx', status: 'missing', message: TRAFFIC_LIGHTS[0].missingMessage },
    { key: 'capital_flow', status: 'missing', message: TRAFFIC_LIGHTS[1].missingMessage },
    { key: 'institution_holding', status: 'missing', message: TRAFFIC_LIGHTS[2].missingMessage },
  ];

  if (horizon === 'short') {
    return [
      ...common,
      { key: 'technical_kline', status: 'missing', message: '暂未接入后端聚合后的技术指标和 K 线信号读取器。' },
      { key: 'next_day_probability', status: 'partial', message: '数据不足，默认返回无倾向概率用于前端展示。' },
    ];
  }

  return [
    ...common,
    { key: 'valuation', status: 'missing', message: '暂未接入估值分位、PE/PB 和同业估值对比数据源。' },
    { key: 'earnings', status: 'missing', message: '暂未接入财报摘要、营收利润和业绩指引数据源。' },
    { key: 'industry_outlook', status: 'missing', message: '暂未接入行业景气度、竞争格局和宏观驱动数据源。' },
  ];
}

function createRecommendation(stock, confidence) {
  const displayName = stock.displayName || stock.name;
  return {
    action: 'neutral',
    title: `${displayName}：关键数据不足，建议先观望`,
    summary: '当前本地聚合服务已完成股票识别，但汇率、主力资金和机构持仓等关键数据源尚未接入。为避免误导，首版仅给出观望结论，并明确标注缺失数据。',
    confidence: Number(Math.min(0.55, Math.max(0.35, confidence * 0.55)).toFixed(2)),
    highlight: 'yellow',
  };
}

function createShortTermSection() {
  return {
    technical: '技术面聚合读取器尚未接入，暂不输出趋势突破、均线或量价方向性结论。',
    capitalFlow: '主力资金流向数据源暂缺，无法确认短线资金是否持续流入或流出。',
    nextDayProbability: {
      up: 0.5,
      down: 0.5,
    },
  };
}

function createLongTermSection() {
  return {
    valuation: '估值数据源暂缺，暂不判断估值是否处于高估、合理或低估区间。',
    earnings: '财报摘要数据源暂缺，暂不判断营收、利润和业绩指引变化。',
    industryOutlook: '行业前景数据源暂缺，暂不判断行业景气度和竞争格局变化。',
  };
}

export function buildStockOutlookReport(rawPayload) {
  const payload = validateRequest(rawPayload);
  const resolved = resolveStock(payload);

  if (!resolved) {
    throw notFound('未找到匹配股票');
  }

  const { stock, confidence } = resolved;
  const report = {
    reportId: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    resolvedStock: {
      symbol: stock.symbol,
      name: stock.displayName || stock.name,
      sector: stock.sector,
      region: stock.region,
      confidence,
    },
    recommendation: createRecommendation(stock, confidence),
    trafficLights: createMissingTrafficLights(),
    dataQuality: createDataQuality(payload.horizon),
  };

  if (payload.horizon === 'short') {
    report.shortTerm = createShortTermSection();
  } else {
    report.longTerm = createLongTermSection();
  }

  return report;
}
