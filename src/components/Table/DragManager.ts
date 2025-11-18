import { ColumnConfig } from './types';

export interface DragState {
  dragIndex: number | null;
  dropIndex: number | null;
  isDragging: boolean;
}

export class DragManager {
  private dragState: DragState = {
    dragIndex: null,
    dropIndex: null,
    isDragging: false,
  };

  private columns: ColumnConfig[] = [];

  setColumns(columns: ColumnConfig[]) {
    this.columns = columns;
  }

  getDragState(): DragState {
    return { ...this.dragState };
  }

  startDrag(columnIndex: number) {
    this.dragState = {
      dragIndex: columnIndex,
      dropIndex: null,
      isDragging: true,
    };
  }

  updateDropTarget(columnIndex: number) {
    if (this.dragState.isDragging) {
      this.dragState.dropIndex = columnIndex;
    }
  }

  endDrag(): ColumnConfig[] | null {
    const { dragIndex, dropIndex } = this.dragState;

    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) {
      this.resetDrag();
      return null;
    }

    const newColumns = [...this.columns];
    const [draggedColumn] = newColumns.splice(dragIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);

    this.resetDrag();
    return newColumns;
  }

  resetDrag() {
    this.dragState = {
      dragIndex: null,
      dropIndex: null,
      isDragging: false,
    };
  }

  isDraggable(column: ColumnConfig): boolean {
    return column.draggable === true && !column.fixed;
  }

  canDrop(sourceIndex: number, targetIndex: number): boolean {
    if (sourceIndex === targetIndex) return false;

    const sourceColumn = this.columns[sourceIndex];
    const targetColumn = this.columns[targetIndex];

    if (!sourceColumn || !targetColumn) return false;

    if (sourceColumn.fixed || targetColumn.fixed) {
      return false;
    }

    return true;
  }
}
