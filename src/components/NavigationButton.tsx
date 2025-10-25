import { Menu } from 'lucide-react';

interface NavigationButtonProps {
  onClick: () => void;
}

export function NavigationButton({ onClick }: NavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-0 left-0 z-30 p-3 bg-[#1A1A1A] border-r border-b border-[#2A2A2A] rounded-br-xl transition-all duration-300 ease-out group -translate-x-8 -translate-y-8 hover:translate-x-0 hover:translate-y-0 hover:bg-[#2A2A2A]"
      title="导航菜单"
    >
      <Menu className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
    </button>
  );
}
