import { Menu } from 'lucide-react';

interface NavigationButtonProps {
  onClick: () => void;
}

export function NavigationButton({ onClick }: NavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-30 p-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-colors group"
      title="导航菜单"
    >
      <Menu className="w-5 h-5 text-gray-400 group-hover:text-white" />
    </button>
  );
}
