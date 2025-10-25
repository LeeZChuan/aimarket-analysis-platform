/**
 * AI分析Mock数据
 * 用于模拟AI分析接口返回的固定响应内容
 */

import { AIAnalysisResponse, AIMessageType, AIMessage } from '../types/ai';

/**
 * Mock分析响应模板
 * 根据不同的用户输入返回对应的分析内容
 */
export const mockAnalysisTemplates = {
  /**
   * 默认技术分析模板
   */
  technical: (stockSymbol: string, stockPrice: number): string => {
    const support = (stockPrice * 0.95).toFixed(2);
    const resistance = (stockPrice * 1.05).toFixed(2);

    return `📊 **${stockSymbol} 技术分析报告**

**一、趋势分析**
当前 ${stockSymbol} 处于上升通道中，短期均线（MA5、MA10）均在长期均线（MA30、MA60）之上，形成多头排列格局。价格在 $${stockPrice.toFixed(2)} 附近波动，整体趋势向好。

**二、关键价位**
• **支撑位**：$${support} - 这是近期重要支撑区域，多次测试未跌破
• **阻力位**：$${resistance} - 短期突破该位置后有望开启新一轮上涨

**三、技术指标**
• **RSI指标**：当前RSI为63，处于健康区间（30-70），未见超买或超卖
• **MACD指标**：MACD线在零轴上方运行，DIF与DEA呈金叉态势，短期看涨信号
• **KDJ指标**：K值68，D值65，J值74，处于强势区间但需警惕高位回调

**四、成交量分析**
近5个交易日成交量温和放大，显示资金持续流入。量价配合良好，后市有望继续上行。

**五、操作建议**
✅ **短期策略**：建议继续持有，关注 $${resistance} 阻力位突破情况
⚠️ **风险提示**：若跌破 $${support} 支撑位，需及时止损`;
  },

  /**
   * 基本面分析模板
   */
  fundamental: (stockSymbol: string, stockPrice: number): string => {
    return `📈 **${stockSymbol} 基本面分析**

**一、公司概况**
${stockSymbol} 作为行业龙头企业，在其所处领域拥有强大的市场地位和品牌影响力。

**二、财务数据**
• **营收增长**：最新季度营收同比增长15.8%，超市场预期
• **净利润率**：保持在行业平均水平之上，盈利能力稳健
• **现金流**：经营性现金流充沛，财务状况健康

**三、行业分析**
• 所处行业景气度持续提升
• 市场需求旺盛，供需关系良好
• 行业政策支持力度加大

**四、估值水平**
当前市盈率（P/E）约为26倍，处于历史中位数水平，估值合理。

**五、投资建议**
当前价格 $${stockPrice.toFixed(2)} 具有中长期投资价值，建议分批建仓，适合价值投资者持有。`;
  },

  /**
   * 市场情绪分析模板
   */
  sentiment: (stockSymbol: string, stockPrice: number): string => {
    const buyZone = (stockPrice * 0.98).toFixed(2);
    const sellZone = (stockPrice * 1.02).toFixed(2);

    return `💡 **${stockSymbol} 市场情绪分析**

**一、多空博弈**
当前多方占据主导地位，市场情绪偏向乐观。

**二、资金流向**
• 大单流入：主力资金持续流入
• 散户行为：跟随情绪明显
• 机构持仓：机构持仓比例稳步上升

**三、新闻舆情**
近期正面新闻较多，市场关注度高，媒体报道整体偏积极。

**四、市场热度**
• 搜索指数：近7日环比上升32%
• 讨论热度：社交媒体讨论量增加
• 板块联动：所在板块整体走强

**五、交易策略**
📍 **建议买入区间**：$${buyZone} - $${sellZone}
📍 **持仓建议**：适度参与，控制仓位在30%-50%
⚠️ **风险提醒**：市场情绪波动较大，注意短期回调风险`;
  },

  /**
   * 综合分析模板
   */
  comprehensive: (stockSymbol: string, stockPrice: number): string => {
    const support = (stockPrice * 0.95).toFixed(2);
    const resistance = (stockPrice * 1.05).toFixed(2);

    return `🎯 **${stockSymbol} 综合投资分析**

**【技术面】**
✓ 趋势：上升通道，多头排列
✓ 指标：MACD金叉，RSI健康区间
✓ 支撑/阻力：$${support} / $${resistance}

**【基本面】**
✓ 财报：超预期增长
✓ 估值：处于合理区间
✓ 行业：景气度提升

**【资金面】**
✓ 主力：持续流入
✓ 成交量：温和放大
✓ 机构：增持迹象

**【风险评估】**
• 短期风险：市场波动，情绪变化
• 中期风险：行业政策变动
• 风险等级：★★☆☆☆（中低）

**【投资建议】**
💰 **目标价位**：$${resistance}
📊 **买入策略**：$${support}-$${stockPrice.toFixed(2)} 区间分批买入
⏱️ **持有周期**：建议中长期持有（3-6个月）
⚖️ **仓位配置**：建议仓位30%-50%

*免责声明：以上分析仅供参考，不构成投资建议*`;
  },

  /**
   * 简短快速分析模板
   */
  quick: (stockSymbol: string, stockPrice: number): string => {
    return `⚡ **${stockSymbol} 快速分析**

**当前价格**：$${stockPrice.toFixed(2)}

**趋势判断**：📈 短期看涨
**技术信号**：✅ 多头排列
**资金动向**：💰 净流入
**操作建议**：持有观望

风险等级：中低 ⭐⭐☆☆☆`;
  },

  /**
   * 纯文本问候模板
   */
  greeting: (): string => {
    return `你好！我是AI投资助手，很高兴为你服务。我可以帮你分析股票走势、提供投资建议。你可以问我关于技术面、基本面或市场情绪的问题。`;
  },

  /**
   * 简短确认模板
   */
  confirm: (stockSymbol: string): string => {
    return `好的，我正在为你分析 ${stockSymbol} 的最新数据，请稍等...`;
  },

  /**
   * 价格播报模板
   */
  priceAlert: (stockSymbol: string, stockPrice: number): string => {
    const change = (Math.random() * 10 - 5).toFixed(2);
    const changePercent = ((parseFloat(change) / stockPrice) * 100).toFixed(2);
    const isUp = parseFloat(change) > 0;

    return `${stockSymbol} 当前价格 $${stockPrice.toFixed(2)}，${isUp ? '上涨' : '下跌'} $${Math.abs(parseFloat(change)).toFixed(2)}（${isUp ? '+' : ''}${changePercent}%）。${isUp ? '市场表现强劲，多头情绪高涨。' : '短期回调，建议观望或低吸。'}`;
  },

  /**
   * 风险提示模板
   */
  riskWarning: (stockSymbol: string): string => {
    return `关于 ${stockSymbol}，需要提醒你注意以下风险：市场波动加剧，短期可能出现较大幅度调整。建议控制仓位，设置止损点，避免追高。投资有风险，入市需谨慎。`;
  },

  /**
   * 简单回答模板
   */
  simpleAnswer: (stockSymbol: string, stockPrice: number): string => {
    return `根据当前数据，${stockSymbol} 价格 $${stockPrice.toFixed(2)}，整体趋势向好，建议持续关注。`;
  },
};

/**
 * 根据用户消息内容返回对应的分析模板
 */
export const getAnalysisTemplate = (
  message: string,
  stockSymbol: string,
  stockPrice: number
): { content: string; type: AIMessageType } => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return { content: mockAnalysisTemplates.greeting(), type: AIMessageType.TEXT };
  }

  if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱') || lowerMessage.includes('报价')) {
    return { content: mockAnalysisTemplates.priceAlert(stockSymbol, stockPrice), type: AIMessageType.TEXT };
  }

  if (lowerMessage.includes('风险') || lowerMessage.includes('危险') || lowerMessage.includes('注意')) {
    return { content: mockAnalysisTemplates.riskWarning(stockSymbol), type: AIMessageType.TEXT };
  }

  if (lowerMessage.includes('确认') || lowerMessage.includes('好的') || lowerMessage.includes('开始')) {
    return { content: mockAnalysisTemplates.confirm(stockSymbol), type: AIMessageType.TEXT };
  }

  if (lowerMessage.includes('基本面') || lowerMessage.includes('财报') || lowerMessage.includes('估值')) {
    return { content: mockAnalysisTemplates.fundamental(stockSymbol, stockPrice), type: AIMessageType.MARKDOWN };
  }

  if (lowerMessage.includes('情绪') || lowerMessage.includes('资金') || lowerMessage.includes('市场')) {
    return { content: mockAnalysisTemplates.sentiment(stockSymbol, stockPrice), type: AIMessageType.MARKDOWN };
  }

  if (lowerMessage.includes('综合') || lowerMessage.includes('全面') || lowerMessage.includes('详细')) {
    return { content: mockAnalysisTemplates.comprehensive(stockSymbol, stockPrice), type: AIMessageType.MARKDOWN };
  }

  if (lowerMessage.includes('快速') || lowerMessage.includes('简单')) {
    return { content: mockAnalysisTemplates.quick(stockSymbol, stockPrice), type: AIMessageType.MARKDOWN };
  }

  if (lowerMessage.length < 15) {
    return { content: mockAnalysisTemplates.simpleAnswer(stockSymbol, stockPrice), type: AIMessageType.TEXT };
  }

  return { content: mockAnalysisTemplates.technical(stockSymbol, stockPrice), type: AIMessageType.MARKDOWN };
};

/**
 * 生成Mock响应数据
 */
export const generateMockResponse = (
  message: string,
  stockSymbol: string,
  stockPrice: number,
  modelId: string,
  expectedType?: AIMessageType
): AIAnalysisResponse => {
  const { content, type: detectedType } = getAnalysisTemplate(message, stockSymbol, stockPrice);
  const timestamp = Date.now();

  const type = expectedType || detectedType;

  const enableTypewriter = type === AIMessageType.TEXT;

  const aiMessage: AIMessage = {
    id: `msg_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    content: content,
    enableTypewriter: enableTypewriter,
    timestamp: timestamp,
  };

  return {
    message: aiMessage,
    status: 'success',
    modelId,
  };
};
