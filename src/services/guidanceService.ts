/**
 * 需求澄清 API（走统一 http 封装）
 */
import { http } from './request';
import { notifyError } from '../utils/notify';
import type { GuidanceFlow, GuidanceStrategyMeta, GuidanceAdvanceResult } from '../types/guidance';
import type { GuidanceStepAnswer } from '../types/conversation';

export async function fetchGuidanceStrategies(): Promise<GuidanceStrategyMeta[]> {
  const res = await http.get<{ strategies: GuidanceStrategyMeta[] }>('/guidance/strategies');
  if (!res.success) {
    notifyError(res.message || '获取引导策略失败');
    return [];
  }
  return res.data?.strategies ?? [];
}

export async function fetchGuidanceFlow(flowId: string): Promise<GuidanceFlow | null> {
  const res = await http.get<{ flow: GuidanceFlow }>(`/guidance/flows/${encodeURIComponent(flowId)}`);
  if (!res.success) {
    notifyError(res.message || '获取引导题目失败');
    return null;
  }
  return res.data?.flow ?? null;
}

export async function postGuidanceAdvance(
  conversationId: string,
  body: { flowId: string; answers: GuidanceStepAnswer[] },
): Promise<GuidanceAdvanceResult | null> {
  const res = await http.post<GuidanceAdvanceResult>(
    `/conversations/${conversationId}/guidance/advance`,
    body,
  );
  if (!res.success) {
    notifyError(res.message || '提交答案失败');
    return null;
  }
  return (res.data as GuidanceAdvanceResult) ?? null;
}
