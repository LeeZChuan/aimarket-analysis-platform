/**
 * 导航菜单侧边栏组件
 *
 * 功能：
 * - 左侧滑出的全屏导航菜单
 * - 显示所有可导航页面（交易面板、个股列表等）
 * - 高亮当前活跃页面
 * - 显示当前用户信息（头像、姓名、邮箱）
 * - 退出登录功能
 * - 点击遮罩层或关闭按钮关闭菜单
 *
 * 使用位置：
 * - /views/Layout.tsx - 全局布局（通过NavigationButton触发显示）
 */

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
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-[84vw] max-w-xs transform flex-col transition-transform duration-200 sm:max-w-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <h2 className="text-base font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>导航</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <nav className="flex-1 p-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`mb-1.5 flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                  isActive
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="mb-3 flex items-center gap-3 px-1.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <User className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        </div>
      </div>
    </>
  );
}
