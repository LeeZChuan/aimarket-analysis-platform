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
      className="fixed top-0 left-0 z-30 p-4 bg-gradient-to-br from-[#3A9FFF] to-[#2B7FD9] border-r-2 border-b-2 border-[#3A9FFF]/50 rounded-br-3xl transition-all duration-300 ease-out group -translate-x-9 -translate-y-9 hover:translate-x-0 hover:translate-y-0 hover:shadow-xl hover:shadow-[#3A9FFF]/40 shadow-md shadow-[#3A9FFF]/20 animate-pulse hover:animate-none"
      title="导航菜单"
      style={{
        boxShadow: '0 0 20px rgba(58, 159, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
      }}
    >
      <Menu className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
    </button>
  );
}
