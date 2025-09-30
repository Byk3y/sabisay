import React from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  getRowKey: (item: T) => string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  getRowKey,
  onSort,
  sortKey,
  sortOrder,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-4 border-b border-sabi-border dark:border-sabi-border-dark"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-sabi-border dark:divide-sabi-border-dark">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark uppercase tracking-wider"
              >
                {column.sortable && onSort ? (
                  <button
                    onClick={() => onSort(column.key)}
                    className="flex items-center gap-1 hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
                  >
                    {column.label}
                    {sortKey === column.key && (
                      <span className="text-sabi-accent">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-sabi-card dark:bg-sabi-card-dark divide-y divide-sabi-border dark:divide-sabi-border-dark">
          {data.map(item => (
            <tr
              key={getRowKey(item)}
              className="hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark"
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
