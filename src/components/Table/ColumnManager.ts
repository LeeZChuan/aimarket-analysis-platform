import { ColumnConfig, FlattenColumn } from './types';

export class ColumnManager {
  private columns: ColumnConfig[];
  private flattenColumns: FlattenColumn[];
  private headerRows: FlattenColumn[][];
  private maxLevel: number;

  constructor(columns: ColumnConfig[]) {
    this.columns = columns;
    this.flattenColumns = [];
    this.headerRows = [];
    this.maxLevel = 0;
    this.initialize();
  }

  private initialize() {
    this.maxLevel = this.calculateMaxLevel(this.columns);
    this.flattenColumns = this.flattenColumnsWithSpan(this.columns);
    this.headerRows = this.generateHeaderRows();
  }

  private calculateMaxLevel(columns: ColumnConfig[], level = 1): number {
    let maxLevel = level;
    columns.forEach(col => {
      if (col.children && col.children.length > 0) {
        const childLevel = this.calculateMaxLevel(col.children, level + 1);
        maxLevel = Math.max(maxLevel, childLevel);
      }
    });
    return maxLevel;
  }

  private flattenColumnsWithSpan(
    columns: ColumnConfig[],
    level = 0,
    parent?: FlattenColumn
  ): FlattenColumn[] {
    const result: FlattenColumn[] = [];

    columns.forEach(col => {
      if (col.children && col.children.length > 0) {
        const parentCol: FlattenColumn = {
          ...col,
          colSpan: this.getLeafCount(col),
          rowSpan: 1,
          level,
          parent,
        };
        result.push(parentCol);
        result.push(...this.flattenColumnsWithSpan(col.children, level + 1, parentCol));
      } else {
        result.push({
          ...col,
          colSpan: 1,
          rowSpan: this.maxLevel - level,
          level,
          parent,
        });
      }
    });

    return result;
  }

  private getLeafCount(column: ColumnConfig): number {
    if (!column.children || column.children.length === 0) {
      return 1;
    }
    return column.children.reduce((sum, child) => sum + this.getLeafCount(child), 0);
  }

  private generateHeaderRows(): FlattenColumn[][] {
    const rows: FlattenColumn[][] = [];
    for (let i = 0; i < this.maxLevel; i++) {
      rows.push([]);
    }

    this.flattenColumns.forEach(col => {
      rows[col.level].push(col);
    });

    return rows;
  }

  getLeafColumns(): FlattenColumn[] {
    return this.flattenColumns.filter(col => !col.children || col.children.length === 0);
  }

  getHeaderRows(): FlattenColumn[][] {
    return this.headerRows;
  }

  getFixedLeftColumns(): FlattenColumn[] {
    return this.getLeafColumns().filter(col => col.fixed === 'left');
  }

  getFixedRightColumns(): FlattenColumn[] {
    return this.getLeafColumns().filter(col => col.fixed === 'right');
  }

  getNormalColumns(): FlattenColumn[] {
    return this.getLeafColumns().filter(col => !col.fixed);
  }

  getMaxLevel(): number {
    return this.maxLevel;
  }

  getTotalWidth(): number {
    return this.getLeafColumns().reduce((sum, col) => sum + col.width, 0);
  }

  getFixedLeftWidth(): number {
    return this.getFixedLeftColumns().reduce((sum, col) => sum + col.width, 0);
  }

  getFixedRightWidth(): number {
    return this.getFixedRightColumns().reduce((sum, col) => sum + col.width, 0);
  }
}
