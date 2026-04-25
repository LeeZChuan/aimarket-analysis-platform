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
import { stockService } from '../../../services/stockService';
import { ConversationTabBar } from '../ConversationTabBar';
import { ChatMessageList } from '../ChatMessageList';
import { ChatInput } from '../ChatInput';
import { ConversationHistory } from '../ConversationHistory';
import { PlannerPanel } from '../PlannerPanel';
import {
  ConversationListItem,
  KLineContextData,
  PlannerDraft,
} from '../../../types/conversation';
import { notifyError } from '../../../utils/notify';

// ── 工作流状态 ──────────────────────────────────────────────────────────────

type WorkflowPhase =
  | 'idle'
  | 'executing'          // execute 阶段 streaming 中
  | 'verifying'          // verify 阶段 streaming 中
  | 'complete';          // 三阶段全部完成

// ── 组件 ────────────────────────────────────────────────────────────────────

export function ChatPanel() {
  const { selectedStock } = useStore();
  const { setConfirmedSelectionData, clearConfirmedSelectionData } = useChartStore();
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

  // 初始化 AI 配置
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    initializeDefaultConversation();
  }, [initializeDefaultConversation]);

  useEffect(() => {
    let cancelled = false;

    const restoreSelectionData = async () => {
      const klineContext = activeConversation?.klineContext;
      if (!klineContext) {
        clearConfirmedSelectionData();
        return;
      }

      const startDate = Date.parse(klineContext.startTime);
      const endDate = Date.parse(klineContext.endTime);
      if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
        setConfirmedSelectionData({
          stockSymbol: klineContext.stockSymbol,
          stockName: klineContext.stockName,
          timeframe: klineContext.timeframe,
          startTime: klineContext.startTime,
          endTime: klineContext.endTime,
          dataCount: 0,
          klineData: [],
        });
        return;
      }

      const start = new Date(startDate).toISOString().slice(0, 10);
      const end = new Date(endDate).toISOString().slice(0, 10);
      const klineData = await stockService.getKLineData(
        klineContext.stockSymbol,
        'day',
        start,
        end,
      );

      if (cancelled) return;
      setConfirmedSelectionData({
        stockSymbol: klineContext.stockSymbol,
        stockName: klineContext.stockName,
        timeframe: klineContext.timeframe,
        startTime: klineContext.startTime,
        endTime: klineContext.endTime,
        dataCount: klineData.length,
        klineData,
      });
    };

    restoreSelectionData();

    return () => {
      cancelled = true;
    };
  }, [activeConversation?.id, activeConversation?.klineContext, clearConfirmedSelectionData, setConfirmedSelectionData]);

  // ── 普通消息发送 ─────────────────────────────────────────────────────────

  const handleSend = async (message: string, images?: string[]) => {
    void images;
    if (isLoading || isStreaming) return;

    const {
      confirmedSelectionData: selectionSnapshot,
      clearConfirmedSelectionData,
    } = useChartStore.getState();

    let conversationId = activeConversationId;
    if (!conversationId) {
      await createNewConversation({
        title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
        stockSymbol: selectedStock?.symbol,
        stockName: selectedStock?.name,
        stockPrice: selectedStock?.price,
      });
      conversationId = useConversationStore.getState().activeConversationId;
    }

    if (!conversationId) return;

    let klineContext: KLineContextData | undefined;
    if (selectionSnapshot) {
      klineContext = {
        stockSymbol: selectionSnapshot.stockSymbol,
        stockName: selectionSnapshot.stockName,
        timeframe: selectionSnapshot.timeframe,
        startTime: selectionSnapshot.startTime,
        endTime: selectionSnapshot.endTime,
        data: selectionSnapshot.klineData,
      };
      clearConfirmedSelectionData();
    }

    await sendChatMessage({
      content: message,
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      expectedType: 'markdown',
      stream: true,
      klineContext,
    });
  };

  // ── 确保会话 ID ──────────────────────────────────────────────────────────

  const ensureConversationId = async () => {
    let conversationId = activeConversationId;
    if (!conversationId) {
      try {
        await createNewConversation({
          title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
          stockSymbol: selectedStock?.symbol,
          stockName: selectedStock?.name,
          stockPrice: selectedStock?.price,
        });
      } catch (e) {
        const detail = e instanceof Error ? e.message : '未知错误';
        notifyError('创建会话失败', detail);
        return null;
      }

      const state = useConversationStore.getState();
      conversationId = state.activeConversationId;

      if (!conversationId) {
        notifyError('创建会话失败', state.error || '请检查网络或稍后重试');
        return null;
      }
    }
    return conversationId;
  };

  const takeKLineContextSnapshot = () => {
    const {
      confirmedSelectionData: selectionSnapshot,
      clearConfirmedSelectionData,
    } = useChartStore.getState();

    let klineContext: KLineContextData | undefined;
    if (selectionSnapshot) {
      klineContext = {
        stockSymbol: selectionSnapshot.stockSymbol,
        stockName: selectionSnapshot.stockName,
        timeframe: selectionSnapshot.timeframe,
        startTime: selectionSnapshot.startTime,
        endTime: selectionSnapshot.endTime,
        data: selectionSnapshot.klineData,
      };
      clearConfirmedSelectionData();
    }

    return klineContext;
  };

  const buildPlanSystemPrompt = (draft: PlannerDraft, intentSummary?: string) => {
    const stepText = draft.steps.map((step, index) => `${index + 1}. ${step.title}：${step.focus}`).join('\n');
    const summaryBlock = intentSummary ? `\n[用户意图摘要]\n${intentSummary}\n` : '';
    return `[已确认分析计划]${summaryBlock}
目标：${draft.goal}

执行步骤：
${stepText}

最终输出：
${draft.finalOutput}

请严格基于以上已确认计划展开执行，并明确标注结论依据与风险提示。`;
  };

  const handleApprovePlan = async () => {
    if (isLoading || isStreaming) return;
    const approvedState = await respondPlanner({
      action: 'approve',
      modelId: selectedModelId,
      providerId: selectedProviderId,
    });

    const confirmedPlan = approvedState?.confirmedPlan;
    if (!confirmedPlan) return;

    const klineContext = takeKLineContextSnapshot();
    setWorkflowPhase('executing');

    await sendChatMessage({
      content: '请基于已确认的分析计划，开始执行完整的股票分析。',
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      expectedType: 'markdown',
      stream: true,
      klineContext,
      systemPrompt: buildPlanSystemPrompt(confirmedPlan, approvedState?.lastIntentSummary),
      workflowStage: 'execute',
    });

    setWorkflowPhase('verifying');
    await sendChatMessage({
      content: '请对以上分析结果进行质量审查与风险校验。',
      modelId: selectedModelId,
      providerId: selectedProviderId,
      sceneId: selectedSceneId,
      expectedType: 'markdown',
      stream: true,
      workflowStage: 'verify',
    });

    setWorkflowPhase('complete');
    // 3 秒后恢复 idle，避免遮挡
    setTimeout(() => {
      setWorkflowPhase('idle');
    }, 3000);
  };

  const handleEnterPlan = async () => {
    if (isBusy) return;
    const conversationId = activeConversationId ?? (await ensureConversationId());
    if (!conversationId) return;

    await enterPlannerMode({
      modelId: selectedModelId,
      providerId: selectedProviderId,
      seedMessage: plannerState?.lastIntentSummary || undefined,
    });
    setPlanSuggestion(null);
  };

  const handleDeclineSuggestion = async () => {
    if (!activeConversationId || isBusy) return;
    await respondPlanner({
      action: 'cancel',
      modelId: selectedModelId,
      providerId: selectedProviderId,
    });
    setPlanSuggestion(null);
  };

  const handleCancelPlan = async () => {
    if (!activeConversationId || isBusy) return;
    await respondPlanner({
      action: 'cancel',
      modelId: selectedModelId,
      providerId: selectedProviderId,
    });
    setPlanSuggestion(null);
  };

  // ── 会话管理 ─────────────────────────────────────────────────────────────

  const handleNewConversation = () => {
    createNewConversation({
      title: selectedStock ? `${selectedStock.symbol} 分析` : 'New Conversation',
      stockSymbol: selectedStock?.symbol,
      stockName: selectedStock?.name,
      stockPrice: selectedStock?.price,
    });
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

  const isBusy = isLoading || isStreaming;
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
          onEnterPlan={() => void handleEnterPlan()}
          onDeclineSuggestion={() => void handleDeclineSuggestion()}
          onAnswer={(payload) => {
            void respondPlanner({
              ...payload,
              action: 'answer',
              modelId: selectedModelId,
              providerId: selectedProviderId,
            });
            setPlanSuggestion(null);
          }}
          onSkip={(payload) => {
            void respondPlanner({
              ...payload,
              action: 'skip',
              modelId: selectedModelId,
              providerId: selectedProviderId,
            });
            setPlanSuggestion(null);
          }}
          onRewrite={(payload) => {
            void respondPlanner({
              ...payload,
              action: 'rewrite',
              modelId: selectedModelId,
              providerId: selectedProviderId,
            });
            setPlanSuggestion(null);
          }}
          onContinueRefine={() => {
            void respondPlanner({
              action: 'continue_refine',
              modelId: selectedModelId,
              providerId: selectedProviderId,
            });
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
          onStop={isBusy ? stopAgentRun : undefined}
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
