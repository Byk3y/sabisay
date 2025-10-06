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
  Square
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
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'default' | 'danger';
  }>;
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

  const handleSort = useCallback((key: string) => {
    if (!onSort) return;
    
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  }, [onSort, sortKey, sortOrder]);

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

  const handleSelectRow = useCallback((key: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedRows.includes(key)
      ? selectedRows.filter(k => k !== key)
      : [...selectedRows, key];
    
    onSelectionChange(newSelection);
  }, [selectedRows, onSelectionChange]);

  const handleRowClick = useCallback((item: T) => {
    onRowClick?.(item);
  }, [onRowClick]);

  const handleAction = useCallback((action: string, item: T) => {
    onRowAction?.(action, item);
  }, [onRowAction]);

  const isAllSelected = data.length > 0 && data.every(item => selectedRows.includes(getRowKey(item)));
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

  if (loading) {
    return (
      <ModernCard className={className}>
        <div className="animate-pulse">
          <div className="h-12 bg-admin-gray-200 dark:bg-admin-gray-700 rounded-t-xl" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-sabi-border dark:border-sabi-border-dark">
              <div className="flex items-center gap-4 p-4">
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/4" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/6" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/6" />
                <div className="h-4 bg-admin-gray-200 dark:bg-admin-gray-700 rounded flex-1" />
              </div>
            </div>
          ))}
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
    <ModernCard className={className}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-sabi-border dark:border-sabi-border-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
              Results ({data.length})
            </h3>
            {selectable && selectedRows.length > 0 && (
              <span className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
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
                >
                  Export
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

      {/* Table */}
      <div className="overflow-x-auto">
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
              {actions.length > 0 && (
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
                    isSelected && 'bg-admin-primary-50 dark:bg-admin-primary-900/10',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => handleRowClick(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
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
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions.map((action, index) => (
                          <ModernButton
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(action.label.toLowerCase(), item);
                            }}
                            className={cn(
                              action.variant === 'danger' && 'text-admin-error-600 hover:text-admin-error-700'
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
        <div className="px-6 py-4 border-t border-sabi-border dark:border-sabi-border-dark">
          <div className="flex items-center justify-between">
            <div className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md bg-white dark:bg-admin-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <div className="flex items-center gap-1">
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </ModernButton>
                <span className="px-3 py-1 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
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



