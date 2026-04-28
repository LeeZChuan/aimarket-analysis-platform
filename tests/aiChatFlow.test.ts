import {
  buildBaseChatRequest,
  shouldEnterPlannerClarification,
  shouldRunVerify,
  takeKLineContextSnapshot,
} from '../src/components/AIAssistant/chatRequestBuilder';
import { parseConversationMessageContent } from '../src/services/messageContentParser';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const klineData = [{
  timestamp: 1710000000000,
  open: 10,
  high: 11,
  low: 9,
  close: 10.5,
  volume: 1000,
}];

let cleared = false;
const klineContext = takeKLineContextSnapshot({
  confirmedSelectionData: {
    source: 'selection',
    stockSymbol: 'AAPL',
    stockName: 'Apple',
    timeframe: '1D',
    startTime: '2026-01-01T00:00:00.000Z',
    endTime: '2026-01-02T00:00:00.000Z',
    dataCount: 1,
    klineData,
  },
  currentChartContext: null,
  clearConfirmedSelectionData: () => {
    cleared = true;
  },
});

assert(klineContext, 'selection kline context should be returned');
assertEqual(klineContext?.stockSymbol, 'AAPL', 'selection stock symbol should be preserved');
assertEqual(klineContext?.source, 'selection', 'selection source should be preserved');
assertEqual(cleared, true, 'confirmed selection should be cleared after snapshot');

const normalRequest = buildBaseChatRequest({
  mode: 'normal',
  content: '分析当前走势',
  modelId: 'deepseek-chat',
  providerId: 'deepseek',
  sceneId: 'general',
  klineContext,
});

assertEqual(normalRequest.content, '分析当前走势', 'normal request content should be preserved');
assertEqual(normalRequest.modelId, 'deepseek-chat', 'normal request model should be preserved');
assertEqual(normalRequest.providerId, 'deepseek', 'normal request provider should be preserved');
assertEqual(normalRequest.sceneId, 'general', 'normal request scene should be preserved');
assertEqual(normalRequest.expectedType, 'markdown', 'normal request should request markdown output');
assertEqual(normalRequest.klineContext?.stockSymbol, 'AAPL', 'normal request should include kline context');

const templateRequest = buildBaseChatRequest({
  mode: 'template',
  content: '按模板分析',
  modelId: 'gpt-4o',
  providerId: 'openai',
  sceneId: 'technical',
});

assertEqual(templateRequest.sceneId, 'technical', 'template request should use selected scene');
assertEqual(templateRequest.workflowStage, undefined, 'template request should not set workflow stage');
assertEqual(
  shouldEnterPlannerClarification('general'),
  true,
  'general scene should enter planner clarification',
);
assertEqual(
  shouldEnterPlannerClarification('technical'),
  false,
  'non-general scenes should keep template chat flow',
);

const executeRequest = buildBaseChatRequest({
  mode: 'plan_execute',
  content: '执行计划',
  modelId: 'deepseek-chat',
  providerId: 'deepseek',
  sceneId: 'technical',
  systemPrompt: 'plan',
});

assertEqual(executeRequest.workflowStage, 'execute', 'plan execute should set execute stage');
assertEqual(executeRequest.systemPrompt, 'plan', 'plan execute should include system prompt');

const verifyRequest = buildBaseChatRequest({
  mode: 'plan_verify',
  content: '校验结果',
  modelId: 'deepseek-chat',
  providerId: 'deepseek',
  sceneId: 'technical',
});

assertEqual(verifyRequest.workflowStage, 'verify', 'plan verify should set verify stage');
assertEqual(shouldRunVerify({ status: 'done' }), true, 'done execute result should continue to verify');
assertEqual(shouldRunVerify({ status: 'stopped' }), false, 'stopped execute result should not verify');
assertEqual(shouldRunVerify({ status: 'error', error: 'failed' }), false, 'error execute result should not verify');

const userJson = '{"a":1}';
assertEqual(
  parseConversationMessageContent('user', userJson),
  userJson,
  'user JSON message should remain plain text',
);

const assistantJson = '{"a":1}';
assertEqual(
  parseConversationMessageContent('assistant', assistantJson),
  assistantJson,
  'assistant non-agent JSON should remain plain text',
);

const agentEnvelope = '{"text":"done","toolCalls":[]}';
const parsedAgent = parseConversationMessageContent('assistant', agentEnvelope);
assert(
  typeof parsedAgent === 'object' && parsedAgent !== null && 'text' in parsedAgent,
  'assistant agent envelope should be parsed',
);

const legacyAssistantBlocks = '[{"type":"text","text":"### 标题\\n\\n"},{"type":"text","text":"正文"}]';
assertEqual(
  parseConversationMessageContent('assistant', legacyAssistantBlocks),
  '### 标题\n\n正文',
  'assistant legacy text blocks should be joined as markdown text',
);

assertEqual(
  parseConversationMessageContent('user', legacyAssistantBlocks),
  legacyAssistantBlocks,
  'user JSON array message should remain plain text',
);

const assistantArrayJson = '[{"type":"image","text":"not supported"}]';
assertEqual(
  parseConversationMessageContent('assistant', assistantArrayJson),
  assistantArrayJson,
  'assistant non-text JSON arrays should remain plain text',
);

console.log('aiChatFlow tests passed');
