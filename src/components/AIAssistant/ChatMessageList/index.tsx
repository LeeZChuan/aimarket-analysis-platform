/**
 * AI聊天消息列表组件
 *
 * 功能：
 * - 展示用户与AI的对话消息列表
 * - 区分用户消息（右侧蓝色气泡）和AI消息（左侧深色气泡）
 * - 自动滚动到最新消息
 * - 显示加载动画（三个跳动的圆点）
 * - 空状态引导（提示用户开始对话）
 * - 消息时间戳显示
 *
 * 使用位置：
 * - /components/AIAssistant/ChatPanel/index.tsx - AI聊天面板（中间消息展示区域）
 */

import { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AIMessageRenderer } from '../AIMessageRenderer';
import { ConversationMessage } from '../../../types/conversation';
import { AIMessage } from '../../../types/ai';

interface ChatMessageListProps {
  messages: ConversationMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
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
            className={`max-w-[85%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-[#3A9FFF] text-white'
                : 'bg-[#0D0D0D] text-gray-200 border border-[#2A2A2A]'
            }`}
          >
            <div className="text-sm">
              {message.role === 'user' || typeof message.content === 'string' ? (
                <div className="whitespace-pre-wrap">{message.content as string}</div>
              ) : (
                <AIMessageRenderer message={message.content as AIMessage} />
              )}
            </div>
            <div className="text-xs opacity-50 mt-2">
              {message.createdAt.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-[#3A9FFF] rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}
