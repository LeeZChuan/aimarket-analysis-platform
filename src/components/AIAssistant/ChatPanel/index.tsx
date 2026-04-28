/**
 * AI聊天面板主组件
 *
 * 功能：
 * - 管理AI对话的整体交互流程
 * - 协调会话标签栏、消息列表、输入框等子组件
 * - 处理消息发送、模型选择、会话管理等核心逻辑
 * - 支持多会话标签切换和历史记录查看
 * - 支持 SSE 流式消息返回（打字机效果）
 * - 动态 Plan Mode：自动建议进入规划 → 多轮澄清 → draft 确认 → execute → auto verify
 *
 * 使用位置：
 * - /views/TradingView/index.tsx - 股票交易主视图（右侧AI助手面板）
 * - /views/StockDetailView/index.tsx - 股票详情页（右侧AI助手面板）
 */

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useChartStore } from '../../../store/useChartStore';
import { useAIConfigStore } from '../../../store/useAIConfigStore';
import { useConversationStore } from '../../../store/useConversationStore';
import { ConversationTabBar } from '../ConversationTabBar';
import { ChatMessageList } from '../ChatMessageList';
import { ChatInput } from '../ChatInput';
import { ConversationHistory } from '../ConversationHistory';
import { PlannerPanel, PlannerAction } from '../PlannerPanel';
import {
  ConversationListItem,
} from '../../../types/conversation';
import { notifyError } from '../../../utils/notify';
import {
  buildBaseChatRequest,
  buildPlanSystemPrompt,
  ensureConversationForChat,
  shouldEnterPlannerClarification,
  shouldRunVerify,
  takeKLineContextSnapshot,
} from '../chatRequestBuilder';

// ── 工作流状态 ──────────────────────────────────────────────────────────────

type WorkflowPhase =
  | 'idle'
  | 'executing'          // execute 阶段 streaming 中
  | 'verifying'          // verify 阶段 streaming 中
  | 'complete';          // 三阶段全部完成

// ── 组件 ────────────────────────────────────────────────────────────────────

export function ChatPanel() {
  const { selectedStock } = useStore();
  const { clearConfirmedSelectionData } = useChartStore();
  const {
    initialize,
    selectedSceneId,
    selectedProviderId,
    selectedModelId,
    scenes,
    providers,
    setSelectedScene,
    setProviderAndModel,
  } = useAIConfigStore();

  const {
    activeConversationId,
    activeConversation,
    openTabs,
    isLoading,
    isStreaming,
    setActiveConversation,
    createNewConversation,
    updateConversationTitle,
    closeTab,
    openTab,
    initializeDefaultConversation,
    sendChatMessage,
    stopAgentRun,
    plannerState,
    planSuggestion,
    enterPlannerMode,
    respondPlanner,
    setPlanSuggestion,
  } = useConversationStore();

  const [showHistory, setShowHistory] = useState(false);

  // ── 三阶段工作流状态 ────────────────────────────────────────────────────
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>('idle');
  const [plannerAction, setPlannerAction] = useState<PlannerAction | null>(null);

  // 初始化 AI 配置
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    initializeDefaultConversation();
  }, [initializeDefaultConversation]);

  useEffect(() => {
    clearConfirmedSelectionData();
  }, [activeConversation?.id, clearConfirmedSelectionData]);

  const getConversationCreateParams = () => ({
    title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
    stockSymbol: selectedStock?.symbol,
    stockName: selectedStock?.name,
    stockPrice: selectedStock?.price,
  });

  const ensureActiveConversationId = async () => {
    try {
      const conversationId = await ensureConversationForChat({
        activeConversationId,
        createNewConversation,
        getActiveConversationId: () => useConversationStore.getState().activeConversationId,
        conversationParams: getConversationCreateParams(),
      });

      if (!conversationId) {
        const state = useConversationStore.getState();
        notifyError('创建会话失败', state.error || '请检查网络或稍后重试');
      }

      return conversationId;
    } catch (e) {
      const detail = e instanceof Error ? e.message : '未知错误';
      notifyError('创建会话失败', detail);
      return null;
    }
  };

  const takeCurrentKLineContext = () => {
    const chartState = useChartStore.getState();
    return takeKLineContextSnapshot({
      confirmedSelectionData: chartState.confirmedSelectionData,
      currentChartContext: chartState.currentChartContext,
      clearConfirmedSelectionData: chartState.clearConfirmedSelectionData,
    });
  };

  // ── 普通/模板消息发送 ─────────────────────────────────────────────────────

  const handleSend = async (message: string) => {
    if (isLoading || isStreaming || plannerAction) return;

    const conversationId = await ensureActiveConversationId();
    if (!conversationId) return;

    if (shouldEnterPlannerClarification(selectedSceneId)) {
      try {
        setPlannerAction('enter');
        await enterPlannerMode({
          modelId: selectedModelId,
          providerId: selectedProviderId,
          seedMessage: message,
        });
        setPlanSuggestion(null);
      } catch (e) {
        const detail = e instanceof Error ? e.message : '未知错误';
        notifyError('进入规划澄清失败', detail);
      } finally {
        setPlannerAction(null);
      }
      return;
    }

    await sendChatMessage(buildBaseChatRequest({
      mode: 'template',
      content: message,
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      klineContext: takeCurrentKLineContext(),
    }));
  };

  const handleApprovePlan = async () => {
    if (isLoading || isStreaming || plannerAction) return;
    setPlannerAction('approve');
    const approvedState = await respondPlanner({
        action: 'approve',
        modelId: selectedModelId,
        providerId: selectedProviderId,
      })
      .finally(() => setPlannerAction(null));

    const confirmedPlan = approvedState?.confirmedPlan;
    if (!confirmedPlan) return;

    setWorkflowPhase('executing');

    const executeResult = await sendChatMessage(buildBaseChatRequest({
      mode: 'plan_execute',
      content: '请基于已确认的分析计划，开始执行完整的股票分析。',
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      klineContext: takeCurrentKLineContext(),
      systemPrompt: buildPlanSystemPrompt(confirmedPlan, approvedState?.lastIntentSummary),
    }));

    if (!shouldRunVerify(executeResult)) {
      setWorkflowPhase('idle');
      return;
    }

    setWorkflowPhase('verifying');
    const verifyResult = await sendChatMessage(buildBaseChatRequest({
      mode: 'plan_verify',
      content: '请对以上分析结果进行质量审查与风险校验。',
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
    }));

    if (!shouldRunVerify(verifyResult)) {
      setWorkflowPhase('idle');
      return;
    }

    setWorkflowPhase('complete');
    // 3 秒后恢复 idle，避免遮挡
    setTimeout(() => {
      setWorkflowPhase('idle');
    }, 3000);
  };

  const handleEnterPlan = async () => {
    if (isBusy) return;
    const conversationId = activeConversationId ?? (await ensureActiveConversationId());
    if (!conversationId) return;

    try {
      setPlannerAction('enter');
      await enterPlannerMode({
        modelId: selectedModelId,
        providerId: selectedProviderId,
        seedMessage: plannerState?.lastIntentSummary || undefined,
      });
      setPlanSuggestion(null);
    } finally {
      setPlannerAction(null);
    }
  };

  const handleDeclineSuggestion = async () => {
    if (!activeConversationId || isBusy) return;
    try {
      setPlannerAction('decline');
      await respondPlanner({
        action: 'cancel',
        modelId: selectedModelId,
        providerId: selectedProviderId,
      });
      setPlanSuggestion(null);
    } finally {
      setPlannerAction(null);
    }
  };

  const handleCancelPlan = async () => {
    if (!activeConversationId || isBusy) return;
    try {
      setPlannerAction('cancel');
      await respondPlanner({
        action: 'cancel',
        modelId: selectedModelId,
        providerId: selectedProviderId,
      });
      setPlanSuggestion(null);
    } finally {
      setPlannerAction(null);
    }
  };

  const handlePlannerResponse = async (
    action: Exclude<PlannerAction, 'enter' | 'decline' | 'approve' | 'cancel'>,
    payload: Record<string, string | undefined> = {},
  ) => {
    if (!activeConversationId || isBusy) return;
    try {
      setPlannerAction(action);
      await respondPlanner({
        ...payload,
        action,
        modelId: selectedModelId,
        providerId: selectedProviderId,
      });
      setPlanSuggestion(null);
    } finally {
      setPlannerAction(null);
    }
  };

  // ── 会话管理 ─────────────────────────────────────────────────────────────

  const handleNewConversation = () => {
    createNewConversation(getConversationCreateParams());
  };

  const handleSelectConversation = (conversation: ConversationListItem) => {
    openTab(conversation);
  };

  // 格式化供应商和模型选项供 ChatInput 使用
  const modelOptions = providers.flatMap(p =>
    p.models.map(m => ({
      id: `${p.provider.id}/${m.id}`,
      name: `${p.provider.name} - ${m.name}`,
      description: m.description,
      disabled: !!m.disabled,
      providerId: p.provider.id,
      modelId: m.id,
    }))
  );

  const currentModelOption = modelOptions.find(
    m => m.providerId === selectedProviderId && m.modelId === selectedModelId
  );

  const isBusy = isLoading || isStreaming || plannerAction !== null;
  const isExecutionWorkflowActive = workflowPhase !== 'idle';

  return (
    <>
      <div className="flex flex-col h-full w-full" style={{ background: 'var(--bg-secondary)' }}>
        {/* Header */}
        <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>AI 分析助手</h2>
            </div>
            <button
              type="button"
              onClick={() => void handleEnterPlan()}
              disabled={isBusy}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-md border transition-colors"
              style={{
                borderColor: 'var(--border-primary)',
                color: isBusy ? 'var(--text-disabled)' : 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                cursor: isBusy ? 'not-allowed' : 'pointer',
              }}
              title="手动进入规划模式"
            >
              进入规划
            </button>
          </div>
        </div>

        <ConversationTabBar
          openTabs={openTabs}
          activeTabId={activeConversationId}
          onTabClick={setActiveConversation}
          onTabClose={closeTab}
          onNewConversation={handleNewConversation}
          onShowHistory={() => setShowHistory(true)}
          onRenameTab={updateConversationTitle}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ChatMessageList
            messages={activeConversation?.messages || []}
            isLoading={isLoading || isStreaming}
          />
        </div>

        <PlannerPanel
          suggestion={planSuggestion}
          plannerState={plannerState}
          busy={isBusy}
          activeAction={plannerAction}
          onEnterPlan={() => void handleEnterPlan()}
          onDeclineSuggestion={() => void handleDeclineSuggestion()}
          onAnswer={(payload) => {
            void handlePlannerResponse('answer', payload);
          }}
          onSkip={(payload) => {
            void handlePlannerResponse('skip', payload);
          }}
          onRewrite={(payload) => {
            void handlePlannerResponse('rewrite', payload);
          }}
          onContinueRefine={() => {
            void handlePlannerResponse('continue_refine');
          }}
          onApprove={() => void handleApprovePlan()}
          onCancel={() => void handleCancelPlan()}
        />

        {/* 工作流状态栏 */}
        {isExecutionWorkflowActive && (
          <div
            className="px-4 py-2.5"
            style={{ borderTop: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}
          >
            {workflowPhase === 'executing' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <span>正在执行完整股票分析…</span>
              </div>
            )}

            {workflowPhase === 'verifying' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <span>正在校验分析结果与风险评估…</span>
              </div>
            )}

            {workflowPhase === 'complete' && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent-primary)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>三阶段分析已完成</span>
              </div>
            )}
          </div>
        )}

        <ChatInput
          onSend={handleSend}
          onStop={isLoading || isStreaming ? stopAgentRun : undefined}
          isLoading={isBusy}
          // 场景选择
          selectedSceneId={selectedSceneId}
          availableScenes={scenes}
          onSceneChange={setSelectedScene}
          // 模型选择
          selectedModel={currentModelOption?.id || ''}
          availableModels={modelOptions}
          onModelChange={(id) => {
            const option = modelOptions.find(m => m.id === id);
            if (option) {
              setProviderAndModel(option.providerId, option.modelId);
            }
          }}
        />
      </div>

      {showHistory && (
        <ConversationHistory
          onClose={() => setShowHistory(false)}
          onSelectConversation={handleSelectConversation}
        />
      )}
    </>
  );
}
