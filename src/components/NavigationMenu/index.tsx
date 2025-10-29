import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LogOut, User, X, BarChart3 } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const menuItems = [
    {
      path: '/trading',
      label: '交易面板',
      icon: TrendingUp,
    },
    {
      path: '/stocks',
      label: '个股列表',
      icon: BarChart3,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 top-0 h-full w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] transform transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-white">导航</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="p-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#3A9FFF] text-white'
                    : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#2A2A2A] p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#3A9FFF]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#3A9FFF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        </div>
      </div>
    </>
  );
}
