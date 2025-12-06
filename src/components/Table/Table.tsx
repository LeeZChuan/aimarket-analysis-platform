/**
 * 高性能虚拟滚动表格组件
 *
 * 功能：
 * - 虚拟滚动（仅渲染可见行，支持10万+数据）
 * - 列排序（支持自定义排序函数）
 * - 列拖拽调整顺序
 * - 行选中高亮
 * - 行悬停效果
 * - 横向滚动支持
 * - 固定表头
 * - 自定义单元格渲染
 *
 * 使用位置：
 * - 目前未在主要页面使用（可作为通用表格组件）
 * - 适合大数据量的股票列表、交易记录等场景
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { TableProps, FlattenColumn, ColumnConfig, SortOrder } from './types';
import { VirtualScrollManager } from './VirtualScrollManager';
import { ColumnManager } from './ColumnManager';
import { SortManager } from './SortManager';
import { DragManager } from './DragManager';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import './table.css';

export function Table({
  columns: initialColumns,
  dataSource,
  rowHeight = 48,
  headerHeight = 48,
  height = 600,
  rowKey = 'id',
  selectedRowKey,
  onRowClick,
  onSortChange,
  onColumnOrderChange,
  className = '',
}: TableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>(initialColumns);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [dragState, setDragState] = useState<{dragIndex: number | null; dropIndex: number | null}>({dragIndex: null, dropIndex: null});

  const sortManager = useRef(new SortManager());
  const dragManager = useRef(new DragManager());

  const columnManager = useMemo(() => {
    dragManager.current.setColumns(columns);
    return new ColumnManager(columns);
  }, [columns]);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) {
      return dataSource;
    }
    const column = columns.find(col => col.key === sortKey);
    if (!column) {
      return dataSource;
    }
    return sortManager.current.sortData(dataSource, column, sortOrder);
  }, [dataSource, sortKey, sortOrder, columns]);

  const visibleRows = useMemo(
    () => Math.ceil((height - headerHeight * columnManager.getMaxLevel()) / rowHeight),
    [height, headerHeight, columnManager, rowHeight]
  );

  const visibleRange = useMemo(() => {
    const bufferRows = Math.ceil(visibleRows * 0.5);
    const startIndex = Math.floor(scrollTop / rowHeight);
    const start = Math.max(0, startIndex - bufferRows);
    const end = Math.min(sortedData.length, startIndex + visibleRows + bufferRows);
    const offsetY = start * rowHeight;
    return { start, end, offsetY };
  }, [scrollTop, rowHeight, visibleRows, sortedData.length]);

  const { start, end, offsetY } = visibleRange;

  const totalHeight = useMemo(() => sortedData.length * rowHeight, [sortedData.length, rowHeight]);

  const visibleData = useMemo(() => {
    return sortedData.slice(start, end);
  }, [sortedData, start, end]);

  const handleSort = (column: FlattenColumn) => {
    const sortConfig = sortManager.current.getSortConfig(column);
    if (!sortConfig) return;

    const newOrder = sortManager.current.toggleSort(column.key);
    setSortKey(newOrder ? column.key : null);
    setSortOrder(newOrder);

    if (onSortChange) {
      onSortChange(newOrder ? { columnKey: column.key, order: newOrder } : null);
    }
  };

  const handleDragStart = (e: React.DragEvent, columnIndex: number) => {
    const leafColumns = columnManager.getLeafColumns();
    if (!dragManager.current.isDraggable(columns[columnIndex])) return;

    dragManager.current.startDrag(columnIndex);
    setDragState({ dragIndex: columnIndex, dropIndex: null });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    if (dragState.dragIndex === null) return;

    dragManager.current.updateDropTarget(columnIndex);
    setDragState(prev => ({ ...prev, dropIndex: columnIndex }));
  };

  const handleDrop = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    const newColumns = dragManager.current.endDrag();

    if (newColumns) {
      setColumns(newColumns);
      if (onColumnOrderChange) {
        onColumnOrderChange(newColumns);
      }
    }

    setDragState({ dragIndex: null, dropIndex: null });
  };

  const handleDragEnd = () => {
    dragManager.current.resetDrag();
    setDragState({ dragIndex: null, dropIndex: null });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    const newScrollLeft = target.scrollLeft;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(newScrollTop);
      setScrollLeft(newScrollLeft);
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleRowClick = (record: any, index: number) => {
    onRowClick?.(record, index);
  };

  const getRowKey = (record: any, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] ?? index.toString();
  };

  const renderCell = (col: FlattenColumn, record: any, rowIndex: number) => {
    const value = record[col.dataIndex];
    if (col.render) {
      return col.render(value, record, start + rowIndex);
    }
    return value;
  };

  const getColumnActualWidth = (col: FlattenColumn): number => {
    if (col.colSpan === 1) {
      return col.width;
    }
    if (col.children && col.children.length > 0) {
      return col.children.reduce((sum, child) => {
        return sum + (child.children ? getColumnActualWidth(child as FlattenColumn) : child.width);
      }, 0);
    }
    return col.width * col.colSpan;
  };

  const renderSortIcon = (col: FlattenColumn) => {
    const sortConfig = sortManager.current.getSortConfig(col);
    if (!sortConfig) return null;

    const currentOrder = sortManager.current.getSortOrder(col.key);

    if (!currentOrder) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }

    if (currentOrder === 'ascend') {
      return <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-400" />;
    }

    return <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-400" />;
  };

  const renderHeaderCell = (col: FlattenColumn, columnIndex?: number) => {
    const actualWidth = getColumnActualWidth(col);
    const sortConfig = sortManager.current.getSortConfig(col);
    const isSortable = !!sortConfig;
    const isDraggable = col.draggable && !col.fixed;
    const isDragging = dragState.dragIndex === columnIndex;
    const isDropTarget = dragState.dropIndex === columnIndex;

    return (
      <th
        key={col.key}
        colSpan={col.colSpan}
        rowSpan={col.rowSpan}
        draggable={isDraggable}
        onDragStart={(e) => columnIndex !== undefined && handleDragStart(e, columnIndex)}
        onDragOver={(e) => columnIndex !== undefined && handleDragOver(e, columnIndex)}
        onDrop={(e) => columnIndex !== undefined && handleDrop(e, columnIndex)}
        onDragEnd={handleDragEnd}
        style={{
          width: actualWidth,
          minWidth: actualWidth,
          textAlign: col.align || 'left',
        }}
        className={`table-th group ${
          isSortable ? 'cursor-pointer hover:bg-[#2A2A2A]' : ''
        } ${
          isDraggable ? 'cursor-move' : ''
        } ${
          isDragging ? 'opacity-50' : ''
        } ${
          isDropTarget ? 'border-l-2 border-blue-400' : ''
        }`}
        onClick={() => isSortable && handleSort(col)}
      >
        <div className="flex items-center justify-between">
          <span>{col.title}</span>
          {isSortable && renderSortIcon(col)}
        </div>
      </th>
    );
  };

  const renderHeader = () => {
    const headerRows = columnManager.getHeaderRows();
    const leafColumns = columnManager.getLeafColumns();

    return (
      <thead className="table-thead">
        {headerRows.map((row, rowIndex) => (
          <tr key={rowIndex} style={{ height: headerHeight }}>
            {row.map((col) => {
              const leafIndex = leafColumns.findIndex(leaf => leaf.key === col.key);
              return renderHeaderCell(col, leafIndex >= 0 ? leafIndex : undefined);
            })}
          </tr>
        ))}
      </thead>
    );
  };

  const renderFixedLeftHeader = () => {
    const leftCols = columnManager.getFixedLeftColumns();
    if (leftCols.length === 0) return null;

    const headerRows = columnManager.getHeaderRows();

    return (
      <div className="table-fixed-left" style={{ width: columnManager.getFixedLeftWidth() }}>
        <table className="table-element">
          <thead className="table-thead">
            {headerRows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ height: headerHeight }}>
                {row
                  .filter(col => {
                    const leafCols = columnManager.getLeafColumns();
                    if (col.children) {
                      return leafCols.some(
                        leaf => leaf.parent === col && leaf.fixed === 'left'
                      );
                    }
                    return col.fixed === 'left';
                  })
                  .map((col) => {
                    const leafCols = columnManager.getLeafColumns();
                    const leafIndex = leafCols.findIndex(leaf => leaf.key === col.key);
                    return renderHeaderCell(col, leafIndex >= 0 ? leafIndex : undefined);
                  })}
              </tr>
            ))}
          </thead>
        </table>
      </div>
    );
  };


  const renderRow = (record: any, rowIndex: number) => {
    const leafColumns = columnManager.getLeafColumns();
    const key = getRowKey(record, start + rowIndex);
    const isSelected = selectedRowKey === key;
    const isHovered = hoveredRowKey === key;

    return (
      <tr
        key={key}
        style={{ height: rowHeight }}
        onClick={() => handleRowClick(record, start + rowIndex)}
        onMouseEnter={() => setHoveredRowKey(key)}
        onMouseLeave={() => setHoveredRowKey(null)}
        className={`table-row ${isSelected ? 'table-row-selected' : ''} ${isHovered ? 'table-row-hovered' : ''}`}
      >
        {leafColumns.map(col => (
          <td
            key={col.key}
            style={{
              width: col.width,
              minWidth: col.width,
              textAlign: col.align || 'left',
            }}
            className="table-td"
          >
            {renderCell(col, record, rowIndex)}
          </td>
        ))}
      </tr>
    );
  };

  const renderFixedLeftBody = () => {
    const leftCols = columnManager.getFixedLeftColumns();
    if (leftCols.length === 0) return null;

    return (
      <div
        className="table-fixed-left table-fixed-body"
        style={{
          width: columnManager.getFixedLeftWidth(),
          top: headerHeight * columnManager.getMaxLevel(),
          height: height - headerHeight * columnManager.getMaxLevel(),
          overflow: 'hidden',
        }}
      >
        <div style={{ transform: `translateY(-${scrollTop}px)` }}>
          <table className="table-element">
            <tbody>
              <tr style={{ height: offsetY }}>
                <td />
              </tr>
              {visibleData.map((record, index) => {
                const key = getRowKey(record, start + index);
                const isSelected = selectedRowKey === key;
                const isHovered = hoveredRowKey === key;
                return (
                  <tr
                    key={key}
                    style={{ height: rowHeight }}
                    onClick={() => handleRowClick(record, start + index)}
                    onMouseEnter={() => setHoveredRowKey(key)}
                    onMouseLeave={() => setHoveredRowKey(null)}
                    className={`table-row ${isSelected ? 'table-row-selected' : ''} ${isHovered ? 'table-row-hovered' : ''}`}
                  >
                    {leftCols.map(col => (
                      <td
                        key={col.key}
                        style={{
                          width: col.width,
                          minWidth: col.width,
                          textAlign: col.align || 'left',
                        }}
                        className="table-td"
                      >
                        {renderCell(col, record, index)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr style={{ height: totalHeight - offsetY - visibleData.length * rowHeight }}>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  return (
    <div ref={containerRef} className={`table-container ${className}`} style={{ height }}>
      {renderFixedLeftHeader()}
      <div
        ref={bodyRef}
        className="table-body"
        style={{ height }}
        onScroll={handleScroll}
      >
        <table className="table-element" style={{ width: columnManager.getTotalWidth() }}>
          {renderHeader()}
          <tbody>
            <tr style={{ height: offsetY }}>
              <td />
            </tr>
            {visibleData.map((record, index) => renderRow(record, index))}
            <tr style={{ height: totalHeight - offsetY - visibleData.length * rowHeight }}>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      {renderFixedLeftBody()}
    </div>
  );
}
