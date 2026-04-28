import { useEffect, useState } from 'react';
import { ClipboardList, ListChecks, Loader2, Sparkles } from 'lucide-react';
import type { PlanSuggestionEvent, PlannerDraft, PlannerQuestionCard, PlannerState } from '../../../types/conversation';

export type PlannerAction =
  | 'enter'
  | 'decline'
  | 'answer'
  | 'skip'
  | 'rewrite'
  | 'continue_refine'
  | 'approve'
  | 'cancel';

interface PlannerPanelProps {
  suggestion: PlanSuggestionEvent | null;
  plannerState: PlannerState | null;
  busy?: boolean;
  activeAction?: PlannerAction | null;
  onEnterPlan: () => void;
  onDeclineSuggestion: () => void;
  onAnswer: (payload: { questionId: string; choiceId: string; freeText?: string }) => void;
  onSkip: (payload: { questionId: string; freeText?: string }) => void;
  onRewrite: (payload: { rewriteText: string }) => void;
  onContinueRefine: () => void;
  onApprove: () => void;
  onCancel: () => void;
}

function SuggestionCard({
  suggestion,
  busy,
  onEnterPlan,
  onDeclineSuggestion,
  activeAction,
}: {
  suggestion: PlanSuggestionEvent;
  busy?: boolean;
  activeAction?: PlannerAction | null;
  onEnterPlan: () => void;
  onDeclineSuggestion: () => void;
}) {
  const isEntering = activeAction === 'enter';
  const isDeclining = activeAction === 'decline';

  return (
    <div
      className="mx-4 mt-4 rounded-xl border p-4"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
        <div className="space-y-2 min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {suggestion.suggestionTitle}
          </div>
          <p className="text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
            {suggestion.suggestionBody}
          </p>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {suggestion.reason}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onEnterPlan}
              disabled={busy}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
            >
              {isEntering && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
              {isEntering ? '进入中...' : '进入规划'}
            </button>
            <button
              type="button"
              onClick={onDeclineSuggestion}
              disabled={busy}
              className="px-3 py-1.5 rounded-md border text-xs"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
            >
              {isDeclining && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
              {isDeclining ? '处理中...' : '继续直接聊'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  busy,
  onAnswer,
  onSkip,
  onRewrite,
  activeAction,
}: {
  question: PlannerQuestionCard;
  busy?: boolean;
  activeAction?: PlannerAction | null;
  onAnswer: (payload: { questionId: string; choiceId: string; freeText?: string }) => void;
  onSkip: (payload: { questionId: string; freeText?: string }) => void;
  onRewrite: (payload: { rewriteText: string }) => void;
}) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>('');
  const [freeText, setFreeText] = useState('');
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteMode, setRewriteMode] = useState(false);

  useEffect(() => {
    setSelectedChoiceId('');
    setFreeText('');
    setRewriteText('');
    setRewriteMode(false);
  }, [question.questionId]);

  const isAnswering = activeAction === 'answer';
  const isSkipping = activeAction === 'skip';
  const isRewriting = activeAction === 'rewrite';

  return (
    <div
      className="mx-4 mt-4 rounded-xl border p-4 space-y-3"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
    >
      <div className="flex items-start gap-3">
        <ListChecks className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {question.title}
          </div>
          <p className="text-xs mt-1 leading-5" style={{ color: 'var(--text-secondary)' }}>
            {question.prompt}
          </p>
        </div>
      </div>

      {!rewriteMode && (
        <div className="grid gap-2">
          {question.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => setSelectedChoiceId(choice.id)}
              className="w-full rounded-lg border px-3 py-2 text-left transition-colors"
              style={{
                borderColor: selectedChoiceId === choice.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                background: selectedChoiceId === choice.id ? 'var(--bg-active)' : 'transparent',
                color: 'var(--text-primary)',
              }}
            >
              <div className="text-sm">{choice.label}</div>
              {choice.description && (
                <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {choice.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={rewriteMode ? rewriteText : freeText}
        onChange={(e) => rewriteMode ? setRewriteText(e.target.value) : setFreeText(e.target.value)}
        rows={3}
        placeholder={rewriteMode ? '直接重写你的需求，例如“我想围绕特斯拉做一份偏风险控制的波段交易计划”' : '可补充一句，例如关注的周期、风格或风险偏好'}
        className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        {!rewriteMode ? (
          <>
            <button
              type="button"
              disabled={busy || !selectedChoiceId}
              onClick={() => onAnswer({ questionId: question.questionId, choiceId: selectedChoiceId, freeText: freeText.trim() || undefined })}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
            >
              {isAnswering && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
              {isAnswering ? '提交中...' : '提交答案'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSkip({ questionId: question.questionId, freeText: freeText.trim() || undefined })}
              className="px-3 py-1.5 rounded-md border text-xs"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
            >
              {isSkipping && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
              {isSkipping ? '处理中...' : '跳过这题'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRewriteMode(true)}
              className="px-3 py-1.5 rounded-md border text-xs"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              改写需求
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busy || !rewriteText.trim()}
              onClick={() => onRewrite({ rewriteText: rewriteText.trim() })}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
            >
              {isRewriting && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
              {isRewriting ? '提交中...' : '用新需求继续'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRewriteMode(false)}
              className="px-3 py-1.5 rounded-md border text-xs"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
            >
              返回选项
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DraftCard({
  draft,
  busy,
  onContinueRefine,
  onApprove,
  onCancel,
  activeAction,
}: {
  draft: PlannerDraft;
  busy?: boolean;
  activeAction?: PlannerAction | null;
  onContinueRefine: () => void;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const isApproving = activeAction === 'approve';
  const isContinuing = activeAction === 'continue_refine';
  const isCancelling = activeAction === 'cancel';

  return (
    <div
      className="mx-4 mt-4 rounded-xl border p-4 space-y-3"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
    >
      <div className="flex items-start gap-3">
        <ClipboardList className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            规划草案已就绪
          </div>
          <p className="text-xs mt-1 leading-5" style={{ color: 'var(--text-secondary)' }}>
            {draft.goal}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {draft.steps.map((step, index) => (
          <div
            key={`${step.title}-${index}`}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}
          >
            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {index + 1}. {step.title}
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {step.focus}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
        最终输出：{draft.finalOutput}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="px-3 py-1.5 rounded-md text-xs font-medium"
          style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
        >
          {isApproving && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
          {isApproving ? '确认中...' : '确认执行'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onContinueRefine}
          className="px-3 py-1.5 rounded-md border text-xs"
          style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
        >
          {isContinuing && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
          {isContinuing ? '处理中...' : '继续细化'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md border text-xs"
          style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
        >
          {isCancelling && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
          {isCancelling ? '取消中...' : '取消规划'}
        </button>
      </div>
    </div>
  );
}

export function PlannerPanel({
  suggestion,
  plannerState,
  busy = false,
  activeAction = null,
  onEnterPlan,
  onDeclineSuggestion,
  onAnswer,
  onSkip,
  onRewrite,
  onContinueRefine,
  onApprove,
  onCancel,
}: PlannerPanelProps) {
  if (suggestion && plannerState?.mode === 'plan_suggested') {
    return (
      <SuggestionCard
        suggestion={suggestion}
        busy={busy}
        activeAction={activeAction}
        onEnterPlan={onEnterPlan}
        onDeclineSuggestion={onDeclineSuggestion}
      />
    );
  }

  if (plannerState?.mode === 'plan_clarifying' && plannerState.currentQuestion) {
    return (
      <QuestionCard
        question={plannerState.currentQuestion}
        busy={busy}
        activeAction={activeAction}
        onAnswer={onAnswer}
        onSkip={onSkip}
        onRewrite={onRewrite}
      />
    );
  }

  if (plannerState?.mode === 'plan_ready' && plannerState.draftPlan) {
    return (
      <DraftCard
        draft={plannerState.draftPlan}
        busy={busy}
        activeAction={activeAction}
        onContinueRefine={onContinueRefine}
        onApprove={onApprove}
        onCancel={onCancel}
      />
    );
  }

  return null;
}
