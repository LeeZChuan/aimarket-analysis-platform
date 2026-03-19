/**
 * 导航按钮组件（左上角圆角按钮）
 *
 * 功能：
 * - 固定在屏幕左上角的导航触发按钮
 * - 初始状态部分隐藏，鼠标悬停时展开
 * - 脉冲动画提示（悬停时取消）
 * - 渐变背景和发光效果
 * - 点击打开侧边导航菜单
 *
 * 使用位置：
 * - /views/Layout.tsx - 全局布局（左上角固定位置）
 */

import { Menu } from 'lucide-react';

interface NavigationButtonProps {
  onClick: () => void;
}

export function NavigationButton({ onClick }: NavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed left-3 top-3 z-40 h-11 w-11 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] active:scale-95 sm:left-4 sm:top-4"
      title="导航菜单"
      style={{
        background: 'color-mix(in oklab, var(--bg-secondary) 86%, var(--accent-primary) 14%)',
        borderColor: 'color-mix(in oklab, var(--border-primary) 60%, var(--accent-primary) 40%)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'color-mix(in oklab, var(--bg-secondary) 74%, var(--accent-primary) 26%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'color-mix(in oklab, var(--bg-secondary) 86%, var(--accent-primary) 14%)';
      }}
    >
      <Menu className="mx-auto h-5 w-5 transition-transform duration-200" />
    </button>
  );
}
