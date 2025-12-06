/**
 * AI消息渲染器组件
 *
 * 功能：
 * - 根据不同消息类型渲染对应格式（文本/Markdown/代码/图片/图表）
 * - 支持混合类型消息（一条消息包含多种内容块）
 * - 可扩展的自定义渲染器注册机制
 * - 支持打字机效果的文本渲染
 * - 代码块语法高亮和语言标识
 * - Markdown内容格式化展示
 *
 * 使用位置：
 * - /components/AIAssistant/ChatMessageList/index.tsx - 消息列表中的AI回复渲染
 */

import { AIMessage, AIMessageType, AIMessageBlock, AIMessageRenderer as AIMessageRendererType } from '../../../types/ai';
import { MarkdownRenderer } from '../../MarkdownRenderer';
import { TypewriterText } from '../../TypewriterText';
import { Image as ImageIcon } from 'lucide-react';

interface AIMessageRendererProps {
  message: AIMessage;
  customRenderers?: AIMessageRendererType[];
}

const registeredRenderers: Map<AIMessageType, AIMessageRendererType> = new Map();

export function registerMessageRenderer(renderer: AIMessageRendererType): void {
  registeredRenderers.set(renderer.type, renderer);
}

function renderBlock(block: AIMessageBlock, customRenderers?: AIMessageRendererType[]): React.ReactNode {
  const allRenderers = [
    ...(customRenderers || []),
    ...(Array.from(registeredRenderers.values())),
  ].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const renderer = allRenderers.find(r => r.type === block.type);
  if (renderer) {
    return renderer.render(block);
  }

  switch (block.type) {
    case AIMessageType.TEXT:
      return (
        <div className="text-gray-200 whitespace-pre-wrap">
          {block.content}
        </div>
      );

    case AIMessageType.MARKDOWN:
      return <MarkdownRenderer content={block.content} />;

    case AIMessageType.IMAGE:
      return (
        <div className="my-2">
          <img
            src={block.metadata?.imageUrl || block.content}
            alt="AI generated"
            className="max-w-full rounded-lg border border-[#2A2A2A]"
          />
        </div>
      );

    case AIMessageType.CODE:
      return (
        <div className="my-2">
          <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
            {block.metadata?.language && (
              <div className="bg-[#2A2A2A] px-3 py-1 text-xs text-gray-400">
                {block.metadata.language}
              </div>
            )}
            <pre className="p-3 overflow-x-auto">
              <code className="text-sm text-gray-300 font-mono">
                {block.content}
              </code>
            </pre>
          </div>
        </div>
      );

    case AIMessageType.CHART:
      return (
        <div className="my-2 p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
          <div className="text-gray-400 text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>图表渲染功能开发中...</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-gray-400 text-sm">
          不支持的消息类型: {block.type}
        </div>
      );
  }
}

export function AIMessageRenderer({ message, customRenderers }: AIMessageRendererProps) {
  if (message.type === AIMessageType.MIXED && Array.isArray(message.content)) {
    return (
      <div className="space-y-2">
        {message.content.map((block, index) => (
          <div key={index}>
            {renderBlock(block, customRenderers)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof message.content === 'string') {
    if (message.type === AIMessageType.TEXT && message.enableTypewriter) {
      return (
        <TypewriterText
          text={message.content}
          speed={30}
          className="text-gray-200 whitespace-pre-wrap"
        />
      );
    }

    if (message.type === AIMessageType.MARKDOWN) {
      return <MarkdownRenderer content={message.content} />;
    }

    return (
      <div className="text-gray-200 whitespace-pre-wrap">
        {message.content}
      </div>
    );
  }

  return (
    <div className="text-gray-400 text-sm">
      无效的消息格式
    </div>
  );
}
