import { Menu } from 'lucide-react';

interface NavigationButtonProps {
  onClick: () => void;
}

export function NavigationButton({ onClick }: NavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-0 left-0 z-30 p-3 bg-gradient-to-br from-[#3A9FFF] to-[#2B7FD9] border-r-2 border-b-2 border-[#3A9FFF]/30 rounded-br-2xl transition-all duration-300 ease-out group -translate-x-8 -translate-y-8 hover:translate-x-0 hover:translate-y-0 hover:shadow-lg hover:shadow-[#3A9FFF]/20"
      title="导航菜单"
    >
      <Menu className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
    </button>
  );
}
