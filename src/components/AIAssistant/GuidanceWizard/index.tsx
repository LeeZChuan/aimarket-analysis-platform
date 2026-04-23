/**
 * 需求澄清向导（必须先选择一种答题策略 / flow）
 *
 * 流程：选策略 → 顺序选择题（可跳过/可补充）→ 编辑摘要 → 调用 onComplete 走 chat + guidanceAttachment
 */
import { useState, useEffect, useCallback } from 'react';
import { X, ListChecks, Sparkles, ChevronRight } from 'lucide-react';
import type { GuidanceFlow, GuidanceStrategyMeta } from '../../../types/guidance';
import type { GuidanceAttachment, GuidanceStepAnswer } from '../../../types/conversation';
import { fetchGuidanceStrategies, fetchGuidanceFlow, postGuidanceAdvance } from '../../../services/guidanceService';
import { notifyWarning } from '../../../utils/notify';

type Phase = 'strategy' | 'steps' | 'review';

interface GuidanceWizardModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  onEnsureConversationId: () => Promise<string | null>;
  onComplete: (summary: string, attachment: GuidanceAttachment) => void | Promise<void>;
  /** 流式进行中禁用打开内操作 */
  busy?: boolean;
}

export function GuidanceWizardModal({
  open,
  onClose,
  conversationId,
  onEnsureConversationId,
  onComplete,
  busy = false,
}: GuidanceWizardModalProps) {
  const [phase, setPhase] = useState<Phase>('strategy');
  const [strategies, setStrategies] = useState<GuidanceStrategyMeta[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [flow, setFlow] = useState<GuidanceFlow | null>(null);
  const [strategyTitle, setStrategyTitle] = useState('');
  const [answers, setAnswers] = useState<GuidanceStepAnswer[]>([]);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase('strategy');
    setFlow(null);
    setStrategyTitle('');
    setAnswers([]);
    setSummaryDraft('');
    setFreeText('');
    setSelectedChoiceId(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      const list = await fetchGuidanceStrategies();
      if (!cancelled) {
        setStrategies(list);
        setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, reset]);

  const currentStep = flow && answers.length < flow.steps.length ? flow.steps[answers.length] : null;

  const pickStrategy = async (meta: GuidanceStrategyMeta) => {
    const f = await fetchGuidanceFlow(meta.flowId);
    if (!f) return;
    setFlow(f);
    setStrategyTitle(meta.title);
    setAnswers([]);
    setFreeText('');
    setSelectedChoiceId(null);
    setPhase('steps');
  };

  const pushAnswer = async (ans: GuidanceStepAnswer) => {
    if (!flow) return;
    const cid = conversationId ?? (await onEnsureConversationId());
    if (!cid) {
      notifyWarning('需要有效会话才能答题，请稍后重试');
      return;
    }
    const nextAnswers = [...answers, ans];
    setSubmitting(true);
    try {
      const res = await postGuidanceAdvance(cid, { flowId: flow.flowId, answers: nextAnswers });
      if (!res) return;
      setAnswers(nextAnswers);
      setFreeText('');
      setSelectedChoiceId(null);
      if (res.completed) {
        setSummaryDraft(res.summaryDraft ?? '');
        setPhase('review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChoiceConfirm = () => {
    if (!currentStep || busy || submitting) return;
    if (!selectedChoiceId) {
      notifyWarning('请先选择一个选项');
      return;
    }
    void pushAnswer({
      stepId: currentStep.id,
      choiceId: selectedChoiceId,
      freeText: currentStep.allowFreeText && freeText.trim() ? freeText.trim() : undefined,
    });
  };

  const handleSkip = () => {
    if (!currentStep?.allowSkip || busy || submitting) return;
    void pushAnswer({ stepId: currentStep.id, skipped: true });
  };

  const handleSendToAi = async () => {
    if (!flow || !summaryDraft.trim() || busy || submitting) return;
    const attachment: GuidanceAttachment = {
      flowId: flow.flowId,
      version: flow.version,
      strategyTitle,
      answers,
      summary: summaryDraft.trim(),
    };
    setSubmitting(true);
    try {
      await onComplete(summaryDraft.trim(), attachment);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[20001]" style={{ background: 'rgba(0, 0, 0, 0.55)' }}>
      <div
        className="rounded-xl shadow-2xl w-[min(100%,440px)] max-h-[85vh] flex flex-col mx-3"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <ListChecks className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                需求澄清
              </h2>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {phase === 'strategy' ? '请先选择一种答题策略' : phase === 'steps' ? strategyTitle : '确认发给 AI 的摘要'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md shrink-0"
            style={{ color: 'var(--text-muted)' }}
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {phase === 'strategy' && (
            <>
              {loadingList ? (
                <div className="flex justify-center py-12 gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--accent-primary)' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ background: 'var(--accent-primary)' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ background: 'var(--accent-primary)' }} />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    选择一种模式后进入选择题；完成后会插入一条<strong style={{ color: 'var(--text-primary)' }}>你可见</strong>的需求摘要消息并请求 AI 分析。
                  </p>
                  <div className="grid gap-2">
                    {strategies.map(s => (
                      <button
                        key={s.flowId}
                        type="button"
                        disabled={busy || submitting}
                        onClick={() => void pickStrategy(s)}
                        className="text-left rounded-lg px-3 py-3 transition-colors border"
                        style={{
                          background: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{s.title}</span>
                          <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
                        </div>
                        {s.description && (
                          <p className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
                            {s.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {phase === 'steps' && currentStep && flow && (
            <div className="space-y-3">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  第 {answers.length + 1} / {flow.steps.length} 题
                </p>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {currentStep.title}
                </h3>
                {currentStep.prompt && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {currentStep.prompt}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {currentStep.choices.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={busy || submitting}
                    onClick={() => setSelectedChoiceId(c.id)}
                    className="rounded-lg px-3 py-2.5 text-left text-sm border transition-colors"
                    style={{
                      background: selectedChoiceId === c.id ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      borderColor: selectedChoiceId === c.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {c.label}
                    {c.hint && (
                      <span className="block text-[11px] mt-0.5 opacity-70">{c.hint}</span>
                    )}
                  </button>
                ))}
              </div>
              {currentStep.allowFreeText && (
                <div>
                  <label className="text-[11px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                    可选补充（一句即可）
                  </label>
                  <textarea
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-xs resize-none focus:outline-none"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="例如：更关心白酒板块…"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={busy || submitting}
                  onClick={() => handleChoiceConfirm()}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
                  style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {answers.length + 1 >= flow.steps.length ? '完成并生成摘要' : '下一题'}
                </button>
                {currentStep.allowSkip && (
                  <button
                    type="button"
                    disabled={busy || submitting}
                    onClick={() => handleSkip()}
                    className="rounded-lg px-3 py-2 text-xs border"
                    style={{
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    暂不确定
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'review' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                将以下内容作为<strong>你的消息</strong>展示在对话中，并附带结构化澄清字段供模型参考。可直接修改措辞。
              </p>
              <textarea
                value={summaryDraft}
                onChange={e => setSummaryDraft(e.target.value)}
                rows={10}
                className="w-full rounded-lg px-3 py-2 text-xs font-mono leading-relaxed resize-y min-h-[160px] focus:outline-none"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                disabled={busy || submitting || !summaryDraft.trim()}
                onClick={() => void handleSendToAi()}
                className="w-full rounded-lg py-2.5 text-sm font-medium"
                style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
              >
                插入摘要并请求 AI
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
