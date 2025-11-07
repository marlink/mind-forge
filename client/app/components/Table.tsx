'use client';

import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  striped?: boolean;
  hover?: boolean;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  striped = true,
  hover = true,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.className || ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y' : ''}`}>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              onClick={() => onRowClick?.(item)}
              className={`
                ${hover && onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                ${striped && index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                    column.className || ''
                  }`}
                >
                  {column.render
                    ? column.render(item, index)
                    : (item as any)[column.key]?.toString() || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SortableTableProps<T> extends TableProps<T> {
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function SortableTable<T>({
  data,
  columns,
  keyExtractor,
  sortKey,
  sortDirection = 'asc',
  onSort,
  ...tableProps
}: SortableTableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                } ${column.className || ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${tableProps.striped ? 'divide-y' : ''}`}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {tableProps.emptyMessage || 'No data available'}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => tableProps.onRowClick?.(item)}
                className={`
                  ${tableProps.hover && tableProps.onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  ${tableProps.striped && index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.className || ''
                    }`}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item as any)[column.key]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

