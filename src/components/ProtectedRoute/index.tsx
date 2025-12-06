/**
 * 路由守卫组件
 *
 * 功能：
 * - 保护需要登录的页面路由
 * - 检查用户认证状态
 * - 未登录时自动重定向到登录页
 * - 已登录时渲染子组件
 *
 * 使用位置：
 * - /router/index.tsx - 包裹所有需要登录的路由（交易视图、个股详情等）
 */

import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
