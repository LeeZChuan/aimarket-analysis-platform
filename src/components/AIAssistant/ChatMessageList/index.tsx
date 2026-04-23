/**
 * AI 聊天消息列表组件
 *
 * 功能：
 * - 渲染用户气泡与助手气泡，助手侧支持 Markdown
 * - 兼容纯文本、旧版 AIMessage、历史「文本块数组」格式
 * - Agent 模式：流式时展示 ToolCallRenderer + 文本流；完成后展示 ThinkingRenderer、工具卡片、正文与轮次提示
 * - 空状态与全局 loading（非流式）占位
 *
 * 使用位置：
 * - /components/AIAssistant/ChatPanel/index.tsx - 面板中部消息区域
 */
import { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AIMessageRenderer } from '../AIMessageRenderer';
import { ToolCallRenderer } from '../ToolCallRenderer';
import { ThinkingRenderer } from '../ThinkingRenderer';
import { ConversationMessage, AgentMessageContent } from '../../../types/conversation';
import { AIMessage } from '../../../types/ai';
import { useConversationStore } from '../../../store/useConversationStore';
import { MarkdownRenderer } from '../../MarkdownRenderer';

interface ChatMessageListProps {
  messages: ConversationMessage[];
  isLoading: boolean;
}

type LegacyTextBlock = {
  type: 'text';
  text: string;
};

/** 尝试将消息内容解析为 AgentMessageContent（兼容 string/object） */
function tryParseAgentContent(content: unknown): AgentMessageContent | null {
  let parsed: unknown = content;

  if (typeof content === 'string') {
    if (!content.startsWith('{')) return null;
    try {
      parsed = JSON.parse(content);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== 'object') return null;
  if (!('text' in parsed) || !('toolCalls' in parsed)) return null;

  const candidate = parsed as Record<string, unknown>;
  return {
    text: typeof candidate.text === 'string' ? candidate.text : '',
    toolCalls: Array.isArray(candidate.toolCalls) ? candidate.toolCalls as AgentMessageContent['toolCalls'] : [],
    thinking: typeof candidate.thinking === 'string' ? candidate.thinking : undefined,
    isStreaming: Boolean(candidate.isStreaming),
    totalTurns: typeof candidate.totalTurns === 'number' ? candidate.totalTurns : undefined,
  };
}

function isLegacyTextBlock(block: unknown): block is LegacyTextBlock {
  return Boolean(
    block
    && typeof block === 'object'
    && 'type' in block
    && 'text' in block
    && (block as LegacyTextBlock).type === 'text'
    && typeof (block as LegacyTextBlock).text === 'string'
  );
}

/** 兼容历史格式：[{ type: "text", text: "..." }] */
function tryParseLegacyTextBlocks(content: unknown): string | null {
  if (!Array.isArray(content)) return null;
  if (content.length === 0) return '';

  const text = content
    .map((block) => {
      if (typeof block === 'string') return block;
      if (isLegacyTextBlock(block)) return block.text;
      if (block && typeof block === 'object' && 'content' in block) {
        const candidate = block as Record<string, unknown>;
        if (typeof candidate.content === 'string') {
          return candidate.content;
        }
      }
      return '';
    })
    .join('');

  return text.trim() ? text : null;
}

/** 渲染单条 assistant 消息内容 */
function AssistantContent({ message }: { message: ConversationMessage }) {
  const { streamingMessageId, streamingContent, activeToolCalls, isStreaming } = useConversationStore();
  const isCurrentStreaming = streamingMessageId === message.id || message.id.startsWith('temp_');

  // 正在流式输出的消息
  if (isCurrentStreaming && isStreaming) {
    return (
      <div>
        {/* 工具调用进度（实时） */}
        {activeToolCalls.length > 0 && (
          <ToolCallRenderer toolCalls={activeToolCalls} isActive />
        )}
        {/* 文本流 */}
        {streamingContent && (
          <MarkdownRenderer content={streamingContent} />
        )}
        {/* 仍在等待（还没有文本输出） */}
        {!streamingContent && activeToolCalls.length === 0 && (
          <div className="flex gap-1 py-1">
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce delay-100" style={{ background: 'var(--text-tertiary)' }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce delay-200" style={{ background: 'var(--text-tertiary)' }} />
          </div>
        )}
      </div>
    );
  }

  // Agent 模式已完成消息
  const agentContent = tryParseAgentContent(message.content);
  if (agentContent) {
    return (
      <div>
        {agentContent.thinking && <ThinkingRenderer content={agentContent.thinking} />}
        {agentContent.toolCalls.length > 0 && (
          <ToolCallRenderer toolCalls={agentContent.toolCalls} isActive={false} />
        )}
        {agentContent.text && <MarkdownRenderer content={agentContent.text} />}
        {agentContent.totalTurns != null && agentContent.totalTurns > 0 && (
          <div className="mt-2 text-xs text-muted-foreground opacity-60">
            共 {agentContent.totalTurns} 轮工具调用
          </div>
        )}
      </div>
    );
  }

  const legacyTextContent = tryParseLegacyTextBlocks(message.content);
  if (legacyTextContent !== null) {
    return <MarkdownRenderer content={legacyTextContent} />;
  }

  // 旧格式 AIMessage 对象
  if (typeof message.content !== 'string') {
    return <AIMessageRenderer message={message.content as AIMessage} />;
  }

  // 纯文本（markdown 渲染）
  return <MarkdownRenderer content={message.content} />;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isStreaming } = useConversationStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center" style={{ color: 'var(--text-muted)' }}>
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">开始对话分析市场趋势</p>
          <p className="text-xs mt-2">试试：分析当前走势</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className="max-w-[85%] rounded-lg p-3"
            style={
              message.role === 'user'
                ? {
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }
                : {
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                }
            }
          >
            <div className="text-sm">
              {message.role === 'user' ? (
                <div className="whitespace-pre-wrap">{message.content as string}</div>
              ) : (
                <AssistantContent message={message} />
              )}
            </div>
            <div className="text-xs opacity-50 mt-2">
              {message.createdAt.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {/* 全局 loading 指示（非流式 / agent 未开始流式时显示） */}
      {isLoading && !isStreaming && (
        <div className="flex justify-start">
          <div
            className="rounded-lg p-3"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)' }} />
              <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ background: 'var(--text-tertiary)' }} />
              <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ background: 'var(--text-tertiary)' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}
