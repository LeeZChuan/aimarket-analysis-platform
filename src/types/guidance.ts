/**
 * 需求澄清引导 — 前端展示用类型（与后端 guidance 协议对齐）
 */

export interface GuidanceChoice {
  id: string;
  label: string;
  hint?: string;
}

export interface GuidanceStep {
  id: string;
  title: string;
  prompt?: string;
  choices: GuidanceChoice[];
  allowSkip?: boolean;
  allowFreeText?: boolean;
}

export interface GuidanceFlow {
  flowId: string;
  version: string;
  title: string;
  description?: string;
  steps: GuidanceStep[];
}

export interface GuidanceStrategyMeta {
  flowId: string;
  title: string;
  description?: string;
  version: string;
}

export interface GuidanceAdvanceResult {
  completed: boolean;
  nextStep: GuidanceStep | null;
  summaryDraft?: string;
}
