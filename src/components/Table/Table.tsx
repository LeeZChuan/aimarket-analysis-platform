import { useEffect, useRef, useState, useMemo } from 'react';
import { TableProps, FlattenColumn } from './types';
import { VirtualScrollManager } from './VirtualScrollManager';
import { ColumnManager } from './ColumnManager';
import './table.css';

export function Table({
  columns,
  dataSource,
  rowHeight = 48,
  headerHeight = 48,
  height = 600,
  rowKey = 'id',
  selectedRowKey,
  onRowClick,
  className = '',
}: TableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);

  const columnManager = useMemo(() => new ColumnManager(columns), [columns]);

  const visibleRows = useMemo(
    () => Math.ceil((height - headerHeight * columnManager.getMaxLevel()) / rowHeight),
    [height, headerHeight, columnManager, rowHeight]
  );

  const visibleRange = useMemo(() => {
    const bufferRows = Math.ceil(visibleRows * 0.5);
    const startIndex = Math.floor(scrollTop / rowHeight);
    const start = Math.max(0, startIndex - bufferRows);
    const end = Math.min(dataSource.length, startIndex + visibleRows + bufferRows);
    const offsetY = start * rowHeight;
    return { start, end, offsetY };
  }, [scrollTop, rowHeight, visibleRows, dataSource.length]);

  const { start, end, offsetY } = visibleRange;

  const totalHeight = useMemo(() => dataSource.length * rowHeight, [dataSource.length, rowHeight]);

  const visibleData = useMemo(() => {
    return dataSource.slice(start, end);
  }, [dataSource, start, end]);

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

  const renderHeaderCell = (col: FlattenColumn) => {
    const actualWidth = getColumnActualWidth(col);
    return (
      <th
        key={col.key}
        colSpan={col.colSpan}
        rowSpan={col.rowSpan}
        style={{
          width: actualWidth,
          minWidth: actualWidth,
          textAlign: col.align || 'left',
        }}
        className="table-th"
      >
        {col.title}
      </th>
    );
  };

  const renderHeader = () => {
    const headerRows = columnManager.getHeaderRows();
    return (
      <thead className="table-thead">
        {headerRows.map((row, rowIndex) => (
          <tr key={rowIndex} style={{ height: headerHeight }}>
            {row.map(col => renderHeaderCell(col))}
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
                  .map(col => renderHeaderCell(col))}
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
