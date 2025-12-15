/**
 * 自定义绘图工具图标
 * 
 * 这些图标与 lucide-react 风格保持一致
 * 24x24 viewBox, 2px stroke-width
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 水平直线（中间一个点）
export const HorizontalLine: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// 水平射线（左边点，右边箭头）
export const HorizontalRayLine: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="3" cy="12" r="1.5" fill="currentColor" />
    <line x1="5" y1="12" x2="18" y2="12" />
    <polyline points="15,9 18,12 15,15" />
  </svg>
);

// 水平线段（两端带点）
export const HorizontalSegment: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// 垂直直线
export const VerticalLine: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

// 垂直射线（上边点，下边箭头）
export const VerticalRayLine: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    <line x1="12" y1="5" x2="12" y2="18" />
    <polyline points="9,15 12,18 15,15" />
  </svg>
);

// 垂直线段（两端带点）
export const VerticalSegment: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <line x1="12" y1="7" x2="12" y2="17" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

// 斜线（中间两个点有间隔）
export const DiagonalLine: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="20" x2="20" y2="4" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

// 斜线射线（左下点，右上箭头）
export const DiagonalRayLine: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="4" cy="20" r="1.5" fill="currentColor" />
    <line x1="6" y1="18" x2="17" y2="7" />
    <polyline points="14,4 20,4 20,10" />
  </svg>
);

// 斜线线段（两端带点）
export const DiagonalSegment: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6" cy="18" r="1.5" fill="currentColor" />
    <line x1="8" y1="16" x2="16" y2="8" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

// 平行线（上面两个点，下面一个点）
export const ParallelLines: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="8" x2="21" y2="8" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    
    <line x1="3" y1="16" x2="21" y2="16" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

// 价格通道（三条平行斜线，中间两个点，底部一个点）
export const PriceChannel: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 上方线 */}
    <line x1="3" y1="6" x2="21" y2="6" />
    
    {/* 中间线 */}
    <line x1="3" y1="12" x2="21" y2="12" />
    {/* 中间线上的两个点 */}
    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
    
    {/* 底部线 */}
    <line x1="3" y1="18" x2="21" y2="18" />
    {/* 底部线上的一个点 */}
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

// 导出所有图标
export const CustomIcons = {
  HorizontalLine,
  HorizontalRayLine,
  HorizontalSegment,
  VerticalLine,
  VerticalRayLine,
  VerticalSegment,
  DiagonalLine,
  DiagonalRayLine,
  DiagonalSegment,
  ParallelLines,
  PriceChannel,
};

