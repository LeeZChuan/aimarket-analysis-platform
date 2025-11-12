/**
 * 侧边栏标签页类型
 * - watchlist: 自选股列表
 * - stocks: 股票列表
 * - funds: 基金列表
 */
export type TabType = 'watchlist' | 'stocks' | 'funds';

/**
 * Sidebar 组件属性
 */
export interface SidebarProps {
  /** 自定义类名 */
  className?: string;
  /** 默认激活的标签页 */
  defaultTab?: TabType;
}
