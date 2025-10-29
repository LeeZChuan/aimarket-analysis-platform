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
  onRowClick,
  className = '',
}: TableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const columnManager = useMemo(() => new ColumnManager(columns), [columns]);

  const virtualScrollManager = useMemo(
    () =>
      new VirtualScrollManager({
        rowHeight,
        totalRows: dataSource.length,
        visibleRows: Math.ceil((height - headerHeight * columnManager.getMaxLevel()) / rowHeight),
        scrollTop: 0,
        containerHeight: height,
      }),
    [dataSource.length, rowHeight, height, headerHeight, columnManager]
  );

  useEffect(() => {
    virtualScrollManager.updateConfig({
      totalRows: dataSource.length,
      scrollTop,
    });
  }, [dataSource.length, scrollTop, virtualScrollManager]);

  const { start, end, offsetY } = virtualScrollManager.getVisibleRange();
  const totalHeight = virtualScrollManager.getTotalHeight();
  const visibleData = dataSource.slice(start, end);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
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

  const renderHeaderCell = (col: FlattenColumn) => {
    return (
      <th
        key={col.key}
        colSpan={col.colSpan}
        rowSpan={col.rowSpan}
        style={{
          width: col.colSpan === 1 ? col.width : col.colSpan * col.width,
          minWidth: col.colSpan === 1 ? col.width : col.colSpan * col.width,
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

  const renderFixedRightHeader = () => {
    const rightCols = columnManager.getFixedRightColumns();
    if (rightCols.length === 0) return null;

    const headerRows = columnManager.getHeaderRows();

    return (
      <div
        className="table-fixed-right"
        style={{ width: columnManager.getFixedRightWidth(), right: 0 }}
      >
        <table className="table-element">
          <thead className="table-thead">
            {headerRows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ height: headerHeight }}>
                {row
                  .filter(col => {
                    const leafCols = columnManager.getLeafColumns();
                    if (col.children) {
                      return leafCols.some(
                        leaf => leaf.parent === col && leaf.fixed === 'right'
                      );
                    }
                    return col.fixed === 'right';
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
    const key = getRowKey(record, rowIndex);

    return (
      <tr
        key={key}
        style={{ height: rowHeight }}
        onClick={() => onRowClick?.(record, start + rowIndex)}
        className="table-row"
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
                const key = getRowKey(record, index);
                return (
                  <tr
                    key={key}
                    style={{ height: rowHeight }}
                    onClick={() => onRowClick?.(record, start + index)}
                    className="table-row"
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

  const renderFixedRightBody = () => {
    const rightCols = columnManager.getFixedRightColumns();
    if (rightCols.length === 0) return null;

    return (
      <div
        className="table-fixed-right table-fixed-body"
        style={{
          width: columnManager.getFixedRightWidth(),
          right: 0,
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
                const key = getRowKey(record, index);
                return (
                  <tr
                    key={key}
                    style={{ height: rowHeight }}
                    onClick={() => onRowClick?.(record, start + index)}
                    className="table-row"
                  >
                    {rightCols.map(col => (
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
      {renderFixedRightHeader()}
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
      {renderFixedRightBody()}
    </div>
  );
}
