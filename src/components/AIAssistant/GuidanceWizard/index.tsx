/**
 * 需求澄清向导（三阶段工作流入口）
 *
 * 流程：
 *  1. intent_setup  — 选主场景 + 偏好标签
 *  2. strategy      — 选答题策略（flow）
 *  3. steps         — 顺序选择题
 *  4. review        — 编辑摘要 → 调用 onComplete 进入 plan 阶段
 */
import { useState, useEffect, useCallback } from 'react';
import { X, ListChecks, Sparkles, ChevronRight, Check } from 'lucide-react';
import type { GuidanceFlow, GuidanceStrategyMeta } from '../../../types/guidance';
import type { GuidanceAttachment, GuidanceStepAnswer, AnalysisIntent } from '../../../types/conversation';
import { fetchGuidanceStrategies, fetchGuidanceFlow, postGuidanceAdvance } from '../../../services/guidanceService';
import { useAIConfigStore } from '../../../store/useAIConfigStore';
import { notifyWarning } from '../../../utils/notify';

type Phase = 'intent_setup' | 'strategy' | 'steps' | 'review';

const PREFERENCE_TAGS = [
  '短线（数天内）',
  '中线（数周到月）',
  '长线（季度以上）',
  '风控优先',
  '低波动偏好',
  '成长股',
  '价值股',
  '行业轮动',
];

interface GuidanceWizardModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  onEnsureConversationId: () => Promise<string | null>;
  onComplete: (
    summary: string,
    attachment: GuidanceAttachment,
    intent: AnalysisIntent,
  ) => void | Promise<void>;
  /** 流式进行中禁用弹窗内操作 */
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
  const { scenes, setSelectedScene } = useAIConfigStore();

  const [phase, setPhase] = useState<Phase>('intent_setup');
  const [strategies, setStrategies] = useState<GuidanceStrategyMeta[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [flow, setFlow] = useState<GuidanceFlow | null>(null);
  const [strategyTitle, setStrategyTitle] = useState('');
  const [answers, setAnswers] = useState<GuidanceStepAnswer[]>([]);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Intent setup state
  const [selectedPrimarySceneId, setSelectedPrimarySceneId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const reset = useCallback(() => {
    setPhase('intent_setup');
    setFlow(null);
    setStrategyTitle('');
    setAnswers([]);
    setSummaryDraft('');
    setFreeText('');
    setSelectedChoiceId(null);
    setSelectedPrimarySceneId('');
    setSelectedTags([]);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    // Load strategies in background so they're ready when user reaches strategy phase
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

  // Default scene pre-selection to current store value on open
  useEffect(() => {
    if (open && !selectedPrimarySceneId && scenes.length > 0) {
      const { selectedSceneId } = useAIConfigStore.getState();
      setSelectedPrimarySceneId(selectedSceneId || scenes[0]?.id || '');
    }
  }, [open, scenes, selectedPrimarySceneId]);

  const currentStep = flow && answers.length < flow.steps.length ? flow.steps[answers.length] : null;

  const handleIntentNext = () => {
    if (!selectedPrimarySceneId) {
      notifyWarning('请先选择一个主分析场景');
      return;
    }
    // Sync to global store so ChatPanel picks up the right sceneId
    setSelectedScene(selectedPrimarySceneId);
    setPhase('strategy');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

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

    const intent: AnalysisIntent = {
      primarySceneId: selectedPrimarySceneId || 'general',
      preferenceTags: selectedTags,
      summary: summaryDraft.trim(),
    };

    setSubmitting(true);
    try {
      await onComplete(summaryDraft.trim(), attachment, intent);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const phaseSubtitle = () => {
    if (phase === 'intent_setup') return '选择主场景与偏好标签';
    if (phase === 'strategy') return '选择答题策略';
    if (phase === 'steps') return strategyTitle;
    return '确认发给 AI 的摘要';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[20001]" style={{ background: 'rgba(0, 0, 0, 0.55)' }}>
      <div
        className="rounded-xl shadow-2xl w-[min(100%,460px)] max-h-[88vh] flex flex-col mx-3"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <ListChecks className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                需求澄清
              </h2>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {phaseSubtitle()}
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mx-2">
            {(['intent_setup', 'strategy', 'steps', 'review'] as Phase[]).map((p, i) => (
              <div
                key={p}
                className="rounded-full transition-all"
                style={{
                  width: phase === p ? 16 : 6,
                  height: 6,
                  background: phase === p
                    ? 'var(--accent-primary)'
                    : (['intent_setup', 'strategy', 'steps', 'review'].indexOf(phase) > i
                      ? 'var(--accent-primary)'
                      : 'var(--border-primary)'),
                  opacity: ['intent_setup', 'strategy', 'steps', 'review'].indexOf(phase) > i ? 0.4 : 1,
                }}
              />
            ))}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Phase 1: Intent Setup */}
          {phase === 'intent_setup' && (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                先告诉我你的分析偏好，AI 将据此制定专属的分析计划供你确认。
              </p>

              {/* Primary scene */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  主分析场景 <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </p>
                <div className="grid gap-1.5">
                  {scenes.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={busy}
                      onClick={() => setSelectedPrimarySceneId(s.id)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm border transition-colors"
                      style={{
                        background: selectedPrimarySceneId === s.id ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                        borderColor: selectedPrimarySceneId === s.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span className="font-medium">{s.name}</span>
                      {selectedPrimarySceneId === s.id && (
                        <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preference tags */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  偏好标签 <span className="font-normal" style={{ color: 'var(--text-disabled)' }}>（可多选）</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      disabled={busy}
                      onClick={() => toggleTag(tag)}
                      className="rounded-full px-3 py-1 text-xs border transition-colors"
                      style={{
                        background: selectedTags.includes(tag) ? 'var(--accent-primary)' : 'var(--bg-primary)',
                        borderColor: selectedTags.includes(tag) ? 'var(--accent-primary)' : 'var(--border-primary)',
                        color: selectedTags.includes(tag) ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={busy || !selectedPrimarySceneId}
                onClick={handleIntentNext}
                className="w-full rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-1.5"
                style={{
                  background: selectedPrimarySceneId ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: selectedPrimarySceneId ? 'var(--bg-primary)' : 'var(--text-disabled)',
                }}
              >
                下一步：选择答题策略
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Phase 2: Strategy */}
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
                    选择一种模式后进入选择题；完成后 AI 会先生成<strong style={{ color: 'var(--text-primary)' }}>分析计划</strong>供你确认，再执行分析。
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
                  <button
                    type="button"
                    onClick={() => setPhase('intent_setup')}
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ← 返回修改场景/标签
                  </button>
                </div>
              )}
            </>
          )}

          {/* Phase 3: Steps */}
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

          {/* Phase 4: Review */}
          {phase === 'review' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                以下内容将作为<strong>你的消息</strong>展示在对话中，同时 AI 会先生成一份<strong style={{ color: 'var(--text-primary)' }}>分析计划</strong>供你确认后再执行。可直接修改措辞。
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
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map(t => (
                    <span
                      key={t}
                      className="rounded-full px-2.5 py-0.5 text-[11px]"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                disabled={busy || submitting || !summaryDraft.trim()}
                onClick={() => void handleSendToAi()}
                className="w-full rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-1.5"
                style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
              >
                <Sparkles className="w-4 h-4" />
                生成分析计划
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
