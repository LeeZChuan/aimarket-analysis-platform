/**
 * 列配置
 */
export interface ColumnConfig {
  /** 列的唯一标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 数据字段名 */
  dataIndex: string;
  /** 列宽度（像素） */
  width: number;
  /** 列固定位置：左侧或右侧（注意：目前仅支持 'left'） */
  fixed?: 'left' | 'right';
  /** 列内容对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 子列配置（用于多级表头） */
  children?: ColumnConfig[];
  /** 自定义渲染函数 */
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

/**
 * Table 组件属性
 */
export interface TableProps {
  /** 列配置数组 */
  columns: ColumnConfig[];
  /** 数据源数组 */
  dataSource: any[];
  /** 行高度（像素），默认 48 */
  rowHeight?: number;
  /** 表头行高度（像素），默认 48 */
  headerHeight?: number;
  /** 表格总高度（像素），默认 600 */
  height?: number;
  /** 行数据的唯一标识字段名或函数，默认 'id' */
  rowKey?: string | ((record: any) => string);
  /** 当前选中行的 key */
  selectedRowKey?: string;
  /** 行点击事件回调 */
  onRowClick?: (record: any, index: number) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 每行高度（像素） */
  rowHeight: number;
  /** 总行数 */
  totalRows: number;
  /** 可见行数 */
  visibleRows: number;
  /** 当前滚动位置（垂直方向） */
  scrollTop: number;
  /** 容器高度（像素） */
  containerHeight: number;
}

/**
 * 扁平化后的列配置（内部使用）
 * 用于处理多级表头的列信息
 */
export interface FlattenColumn extends ColumnConfig {
  /** 列合并数（占据的列数） */
  colSpan: number;
  /** 行合并数（占据的行数） */
  rowSpan: number;
  /** 层级深度（从0开始） */
  level: number;
  /** 父列引用 */
  parent?: FlattenColumn;
}
