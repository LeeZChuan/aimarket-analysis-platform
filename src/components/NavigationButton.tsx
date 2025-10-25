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
      <Menu className="w-6 h-6 text-white transition-transform group-hover:scale-110 group-hover:rotate-90" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rounded-full animate-ping" />
    </button>
  );
}
