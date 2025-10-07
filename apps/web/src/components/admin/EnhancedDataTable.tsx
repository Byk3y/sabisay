'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernCard } from '@/components/ui/ModernCard';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

export interface EnhancedDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  getRowKey: (item: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onRowClick?: (item: T) => void;
  onRowAction?: (action: string, item: T) => void;
  actions?:
    | Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'default' | 'danger';
        disabled?: boolean;
      }>
    | ((item: T) => Array<{
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
        variant?: 'default' | 'danger';
        disabled?: boolean;
      }>);
  exportable?: boolean;
  onExport?: (format: 'csv' | 'json') => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  className?: string;
}

export function EnhancedDataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  getRowKey,
  onSort,
  sortKey,
  sortOrder,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onRowAction,
  actions = [],
  exportable = false,
  onExport,
  pagination,
  className,
}: EnhancedDataTableProps<T>) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map(col => ({ key: col.key, visible: !col.hidden }))
  );

  const filteredColumns = useMemo(() => {
    return columns.filter(col => {
      const columnState = visibleColumns.find(vc => vc.key === col.key);
      return columnState?.visible !== false;
    });
  }, [columns, visibleColumns]);

  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;

      const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(key, newOrder);
    },
    [onSort, sortKey, sortOrder]
  );

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const allKeys = data.map(getRowKey);
    const isAllSelected = allKeys.every(key => selectedRows.includes(key));

    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allKeys);
    }
  }, [data, getRowKey, selectedRows, onSelectionChange]);

  const handleSelectRow = useCallback(
    (key: string) => {
      if (!onSelectionChange) return;

      const newSelection = selectedRows.includes(key)
        ? selectedRows.filter(k => k !== key)
        : [...selectedRows, key];

      onSelectionChange(newSelection);
    },
    [selectedRows, onSelectionChange]
  );

  const handleRowClick = useCallback(
    (item: T) => {
      onRowClick?.(item);
    },
    [onRowClick]
  );

  const handleAction = useCallback(
    (action: string, item: T) => {
      onRowAction?.(action, item);
    },
    [onRowAction]
  );

  const isAllSelected =
    data.length > 0 &&
    data.every(item => selectedRows.includes(getRowKey(item)));
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

  if (loading) {
    return (
      <ModernCard className={className}>
        <div className="animate-pulse">
          <div className="h-10 sm:h-12 bg-admin-gray-200 dark:bg-admin-gray-700 rounded-t-xl" />
          {/* Mobile loading */}
          <div className="md:hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 border-b border-sabi-border dark:border-sabi-border-dark space-y-3"
              >
                <div className="h-5 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-3/4" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/2" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-2/3" />
                <div className="flex gap-2 mt-3">
                  <div className="h-10 bg-admin-gray-200 dark:bg-admin-gray-700 rounded flex-1" />
                  <div className="h-10 bg-admin-gray-200 dark:bg-admin-gray-700 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
          {/* Desktop loading */}
          <div className="hidden md:block">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 border-b border-sabi-border dark:border-sabi-border-dark"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/4" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/6" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/6" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded flex-1" />
              </div>
            </div>
          ))}
          </div>
        </div>
      </ModernCard>
    );
  }

  if (data.length === 0) {
    return (
      <ModernCard className={className}>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-admin-gray-100 dark:bg-admin-gray-800 flex items-center justify-center">
            <Filter className="w-8 h-8 text-admin-gray-400" />
          </div>
          <p className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
            {emptyMessage}
          </p>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard padding="none" className={className}>
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-sabi-border dark:border-sabi-border-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
              Results ({data.length})
            </h3>
            {selectable && selectedRows.length > 0 && (
              <span className="text-xs sm:text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                {selectedRows.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {exportable && onExport && (
              <div className="relative">
                <ModernButton
                  variant="secondary"
                  size="sm"
                  rightIcon={<ChevronDown className="w-4 h-4" />}
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="hidden sm:inline-flex"
                >
                  Export
                </ModernButton>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="sm:hidden"
                >
                  <Download className="w-4 h-4" />
                </ModernButton>
                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        onExport('csv');
                        setShowColumnMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={() => {
                        onExport('json');
                        setShowColumnMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      JSON
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        {data.map(item => {
          const key = getRowKey(item);
          const isSelected = selectedRows.includes(key);
          const itemActions = typeof actions === 'function' ? actions(item) : actions;

          return (
            <div
              key={key}
              className={cn(
                'border-b border-sabi-border dark:border-sabi-border-dark px-4 py-3 transition-colors',
                isSelected && 'bg-admin-primary-50 dark:bg-admin-primary-900/10',
                onRowClick && 'active:bg-sabi-bg dark:active:bg-sabi-bg-dark'
              )}
              onClick={() => handleRowClick(item)}
            >
              {/* Selection checkbox + Main content */}
              <div className="flex items-start gap-3">
                {selectable && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleSelectRow(key);
                    }}
                    className="flex items-center justify-center min-w-[24px] w-6 h-6 rounded border-2 border-admin-gray-300 dark:border-admin-gray-600 hover:bg-admin-gray-100 dark:hover:bg-admin-gray-700 transition-colors mt-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-admin-primary-600" />
                    ) : (
                      <Square className="w-5 h-5 text-admin-gray-400" />
                    )}
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Top row: title + compact meta on the right (status + type) */}
                  {(() => {
                    const first = filteredColumns[0];
                    const second = filteredColumns[1];
                    const third = filteredColumns[2];
                    return (
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex-1 min-w-0 text-base font-medium">
                          {first && first.render(item)}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {third && <div className="leading-none">{third.render(item)}</div>}
                          {second && (
                            <div className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark leading-none">
                              {second.render(item)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Remaining columns in a compact grid */}
                  {filteredColumns.length > 3 && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 text-xs">
                      {filteredColumns.slice(3).map(column => (
                        <div key={column.key}>
                          <span className="text-sabi-text-muted dark:text-sabi-text-muted-dark uppercase tracking-wide">
                            {column.label}:
                          </span>
                          <div className="mt-0.5">{column.render(item)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons - Full width, touch-friendly */}
              {itemActions && itemActions.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-sabi-border dark:border-sabi-border-dark">
                  {itemActions.map((action, index) => (
                    <ModernButton
                      key={index}
                      variant={action.variant === 'danger' ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        (action as any).onClick(item);
                      }}
                      disabled={action.disabled}
                      className="w-full min-h-[40px]"
                    >
                      <span className="flex items-center justify-center gap-2 text-sm">
                        {action.icon}
                        <span className="hidden xs:inline">{action.label}</span>
                      </span>
                    </ModernButton>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-sabi-border dark:divide-sabi-border-dark">
          <thead className="bg-admin-gray-50 dark:bg-admin-gray-800/50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-4 h-4 rounded border border-admin-gray-300 dark:border-admin-gray-600 hover:bg-admin-gray-100 dark:hover:bg-admin-gray-700 transition-colors"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-admin-primary-600" />
                    ) : isIndeterminate ? (
                      <div className="w-2 h-2 bg-admin-primary-600 rounded" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              {filteredColumns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors group"
                    >
                      {column.label}
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            'w-3 h-3 transition-colors',
                            sortKey === column.key && sortOrder === 'asc'
                              ? 'text-admin-primary-600'
                              : 'text-admin-gray-400 group-hover:text-admin-gray-600'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3 -mt-1 transition-colors',
                            sortKey === column.key && sortOrder === 'desc'
                              ? 'text-admin-primary-600'
                              : 'text-admin-gray-400 group-hover:text-admin-gray-600'
                          )}
                        />
                      </div>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-sabi-card dark:bg-sabi-card-dark divide-y divide-sabi-border dark:divide-sabi-border-dark">
            {data.map(item => {
              const key = getRowKey(item);
              const isSelected = selectedRows.includes(key);

              return (
                <tr
                  key={key}
                  className={cn(
                    'hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors',
                    isSelected &&
                      'bg-admin-primary-50 dark:bg-admin-primary-900/10',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => handleRowClick(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectRow(key);
                        }}
                        className="flex items-center justify-center w-4 h-4 rounded border border-admin-gray-300 dark:border-admin-gray-600 hover:bg-admin-gray-100 dark:hover:bg-admin-gray-700 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-admin-primary-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  )}
                  {filteredColumns.map(column => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(typeof actions === 'function'
                          ? actions(item)
                          : actions
                        ).map((action, index) => (
                          <ModernButton
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              (action as any).onClick(item);
                            }}
                            disabled={action.disabled}
                            className={cn(
                              action.variant === 'danger' &&
                                'text-admin-error-600 hover:text-admin-error-700'
                            )}
                          >
                            {action.icon}
                          </ModernButton>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-sabi-border dark:border-sabi-border-dark">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark text-center sm:text-left">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{' '}
              of {pagination.total}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 w-full sm:w-auto">
              <select
                value={pagination.pageSize}
                onChange={e =>
                  pagination.onPageSizeChange(Number(e.target.value))
                }
                className="w-full sm:w-auto px-3 py-2 sm:py-1 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md bg-white dark:bg-admin-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex-1 sm:flex-none min-h-[40px] sm:min-h-0"
                >
                  <span className="sm:inline">Previous</span>
                  <span className="hidden sm:inline">Previous</span>
                </ModernButton>
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark whitespace-nowrap">
                  {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={
                    pagination.page >=
                    Math.ceil(pagination.total / pagination.pageSize)
                  }
                  className="flex-1 sm:flex-none min-h-[40px] sm:min-h-0"
                >
                  Next
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModernCard>
  );
}
