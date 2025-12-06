/**
 * 打字机效果文本组件
 *
 * 功能：
 * - 逐字符显示文本，模拟打字机效果
 * - 可配置打字速度（毫秒/字符）
 * - 显示跳动的光标（▊）
 * - 支持完成回调函数
 * - 文本变化时自动重置动画
 *
 * 使用位置：
 * - /components/AIAssistant/AIMessageRenderer/index.tsx - 为AI文本回复添加打字机效果
 */

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 30,
  onComplete,
  className = ''
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">▊</span>
      )}
    </span>
  );
}
