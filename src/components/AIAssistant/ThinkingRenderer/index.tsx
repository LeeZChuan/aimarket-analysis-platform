/**
 * Agent 思考过程展示组件
 *
 * 功能：
 * - 展示模型/Agent 返回的 `thinking` 文本（与最终回答分离）
 * - 默认折叠，点击展开，避免干扰主回答阅读
 *
 * 使用位置：
 * - /components/AIAssistant/ChatMessageList/index.tsx - 解析到 AgentMessageContent 且含 thinking 时渲染
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';

interface ThinkingRendererProps {
  content: string;
  /** 默认折叠 */
  defaultCollapsed?: boolean;
}

export function ThinkingRenderer({ content, defaultCollapsed = true }: ThinkingRendererProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!content) return null;

  return (
    <div className="my-2 rounded-lg border border-border/40 bg-muted/20 overflow-hidden text-xs">
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors text-left text-muted-foreground"
      >
        <Brain className="size-3.5 shrink-0 text-purple-400" />
        <span className="font-medium">思考过程</span>
        <span className="ml-auto">
          {collapsed ? (
            <ChevronRight className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </span>
      </button>

      {!collapsed && (
        <div className="border-t border-border/30 px-3 py-2">
          <pre className="whitespace-pre-wrap text-[11px] text-muted-foreground font-mono leading-relaxed">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
