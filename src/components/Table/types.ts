export interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  children?: ColumnConfig[];
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface TableProps {
  columns: ColumnConfig[];
  dataSource: any[];
  rowHeight?: number;
  headerHeight?: number;
  height?: number;
  rowKey?: string | ((record: any) => string);
  selectedRowKey?: string;
  onRowClick?: (record: any, index: number) => void;
  className?: string;
}

export interface VirtualScrollConfig {
  rowHeight: number;
  totalRows: number;
  visibleRows: number;
  scrollTop: number;
  containerHeight: number;
}

export interface FlattenColumn extends ColumnConfig {
  colSpan: number;
  rowSpan: number;
  level: number;
  parent?: FlattenColumn;
}
