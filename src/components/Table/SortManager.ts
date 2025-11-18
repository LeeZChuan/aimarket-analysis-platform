import { ColumnConfig, SortOrder, SortConfig } from './types';

export class SortManager {
  private currentSortKey: string | null = null;
  private currentSortOrder: SortOrder = null;

  getSortState() {
    return {
      columnKey: this.currentSortKey,
      order: this.currentSortOrder,
    };
  }

  setSortState(columnKey: string | null, order: SortOrder) {
    this.currentSortKey = columnKey;
    this.currentSortOrder = order;
  }

  toggleSort(columnKey: string): SortOrder {
    if (this.currentSortKey !== columnKey) {
      this.currentSortKey = columnKey;
      this.currentSortOrder = 'ascend';
      return 'ascend';
    }

    if (this.currentSortOrder === 'ascend') {
      this.currentSortOrder = 'descend';
      return 'descend';
    }

    if (this.currentSortOrder === 'descend') {
      this.currentSortKey = null;
      this.currentSortOrder = null;
      return null;
    }

    this.currentSortOrder = 'ascend';
    return 'ascend';
  }

  getSortConfig(column: ColumnConfig): SortConfig | null {
    if (!column.sortable) {
      return null;
    }

    if (typeof column.sortable === 'boolean') {
      return {
        sortable: true,
      };
    }

    return column.sortable;
  }

  getSortOrder(columnKey: string): SortOrder {
    if (this.currentSortKey === columnKey) {
      return this.currentSortOrder;
    }
    return null;
  }

  sortData<T = any>(
    data: T[],
    column: ColumnConfig,
    order: SortOrder
  ): T[] {
    if (!order) {
      return data;
    }

    const sortConfig = this.getSortConfig(column);
    if (!sortConfig) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      if (sortConfig.sorter) {
        return sortConfig.sorter(a, b);
      }

      const aValue = a[column.dataIndex as keyof T];
      const bValue = b[column.dataIndex as keyof T];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return order === 'descend' ? sorted.reverse() : sorted;
  }
}
