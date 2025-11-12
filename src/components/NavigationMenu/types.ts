/**
 * NavigationMenu 组件属性
 */
export interface NavigationMenuProps {
  /** 菜单是否打开 */
  isOpen: boolean;
  /** 关闭菜单的回调函数 */
  onClose: () => void;
}

/**
 * 菜单项配置
 */
export interface MenuItem {
  /** 路由路径 */
  path: string;
  /** 菜单标签 */
  label: string;
  /** 图标组件 */
  icon: React.ComponentType<{ className?: string }>;
}
