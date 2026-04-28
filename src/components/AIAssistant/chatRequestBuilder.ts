import type {
  ChatRequest,
  ChatRunResult,
  CreateConversationParams,
  KLineContextData,
  PlannerDraft,
} from '../../types/conversation';

export type ChatRequestMode = 'normal' | 'template' | 'plan_execute' | 'plan_verify';

export interface ChatRequestContext {
  modelId: string;
  providerId: string;
  sceneId: string;
  klineContext?: KLineContextData;
}

export interface EnsureConversationForChatOptions {
  activeConversationId: string | null;
  createNewConversation: (params?: CreateConversationParams) => Promise<void>;
  getActiveConversationId: () => string | null;
  conversationParams?: CreateConversationParams;
}

export interface BuildBaseChatRequestOptions extends ChatRequestContext {
  mode: ChatRequestMode;
  content: string;
  systemPrompt?: string;
}

export interface ChartContextSnapshotSource {
  confirmedSelectionData?: {
    source?: 'selection' | 'chart';
    stockSymbol: string;
    stockName: string;
    timeframe: string;
    startTime: string;
    endTime: string;
    dataCount?: number;
    klineData: KLineContextData['data'];
  } | null;
  currentChartContext?: {
    source?: 'selection' | 'chart';
    stockSymbol: string;
    stockName: string;
    timeframe: string;
    startTime: string;
    endTime: string;
    dataCount?: number;
    klineData: KLineContextData['data'];
  } | null;
  clearConfirmedSelectionData?: () => void;
}

export function takeKLineContextSnapshot(source: ChartContextSnapshotSource): KLineContextData | undefined {
  const selection = source.confirmedSelectionData;
  const chart = source.currentChartContext;
  const snapshot = selection ?? chart;

  if (!snapshot) return undefined;
  if (selection) source.clearConfirmedSelectionData?.();

  return {
    source: snapshot.source,
    stockSymbol: snapshot.stockSymbol,
    stockName: snapshot.stockName,
    timeframe: snapshot.timeframe,
    startTime: snapshot.startTime,
    endTime: snapshot.endTime,
    dataCount: snapshot.dataCount,
    data: snapshot.klineData,
  };
}

export function buildPlanSystemPrompt(draft: PlannerDraft, intentSummary?: string): string {
  const stepText = draft.steps
    .map((step, index) => `${index + 1}. ${step.title}：${step.focus}`)
    .join('\n');
  const summaryBlock = intentSummary ? `\n[用户意图摘要]\n${intentSummary}\n` : '';

  return `[已确认分析计划]${summaryBlock}
目标：${draft.goal}

执行步骤：
${stepText}

最终输出：
${draft.finalOutput}

请严格基于以上已确认计划展开执行，并明确标注结论依据与风险提示。`;
}

export function buildBaseChatRequest(options: BuildBaseChatRequestOptions): ChatRequest {
  const request: ChatRequest = {
    content: options.content,
    modelId: options.modelId,
    providerId: options.providerId,
    sceneId: options.sceneId,
    expectedType: 'markdown',
    stream: true,
  };

  if (options.klineContext) request.klineContext = options.klineContext;
  if (options.systemPrompt) request.systemPrompt = options.systemPrompt;

  if (options.mode === 'plan_execute') {
    request.workflowStage = 'execute';
  }

  if (options.mode === 'plan_verify') {
    request.workflowStage = 'verify';
  }

  return request;
}

export async function ensureConversationForChat(
  options: EnsureConversationForChatOptions,
): Promise<string | null> {
  if (options.activeConversationId) return options.activeConversationId;

  await options.createNewConversation(options.conversationParams);
  return options.getActiveConversationId();
}

export function shouldRunVerify(result: ChatRunResult): boolean {
  return result.status === 'done';
}
