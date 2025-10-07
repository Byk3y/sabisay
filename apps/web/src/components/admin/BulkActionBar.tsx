'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernBadge } from '@/components/ui/ModernBadge';
import {
  Trash2,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'secondary' | 'danger' | 'success';
  onClick: (selectedItems: string[]) => void;
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface BulkActionBarProps {
  selectedItems: string[];
  totalItems: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
  showItemCount?: boolean;
  showActions?: boolean;
}

export function BulkActionBar({
  selectedItems,
  totalItems,
  actions,
  onClearSelection,
  className,
  showItemCount = true,
  showActions = true,
}: BulkActionBarProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);

  const selectedCount = selectedItems.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalItems;

  const handleAction = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmDialog(true);
    } else {
      action.onClick(selectedItems);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      pendingAction.onClick(selectedItems);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-sabi-card dark:bg-sabi-card-dark border-t border-sabi-border dark:border-sabi-border-dark shadow-lg z-40',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Selection Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-admin-primary-600" />
                <span className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {selectedCount} selected
                </span>
                {showItemCount && (
                  <span className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                    of {totalItems} total
                  </span>
                )}
              </div>

              {/* Selection Status */}
              <div className="flex items-center gap-2">
                {isAllSelected && (
                  <ModernBadge variant="success" size="sm">
                    All selected
                  </ModernBadge>
                )}
                {isIndeterminate && (
                  <ModernBadge variant="info" size="sm">
                    Partial selection
                  </ModernBadge>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2">
                {/* Primary Actions */}
                <div className="flex items-center gap-1">
                  {actions
                    .filter(action => !action.disabled)
                    .slice(0, 3) // Show first 3 actions
                    .map(action => (
                      <ModernButton
                        key={action.id}
                        variant={action.variant || 'secondary'}
                        size="sm"
                        leftIcon={action.icon}
                        onClick={() => handleAction(action)}
                        disabled={action.disabled}
                      >
                        {action.label}
                      </ModernButton>
                    ))}
                </div>

                {/* More Actions Dropdown */}
                {actions.length > 3 && (
                  <div className="relative">
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Toggle dropdown
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </ModernButton>
                    {/* Dropdown would go here */}
                  </div>
                )}

                {/* Clear Selection */}
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                >
                  <XCircle className="w-4 h-4" />
                  Clear
                </ModernButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-sabi-card dark:bg-sabi-card-dark rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-admin-warning-100 dark:bg-admin-warning-900/20">
                <AlertTriangle className="w-6 h-6 text-admin-warning-600 dark:text-admin-warning-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  Confirm Action
                </h3>
                <p className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  This action will affect {selectedCount} item
                  {selectedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sabi-text-primary dark:text-sabi-text-primary-dark">
                {pendingAction.confirmationMessage ||
                  `Are you sure you want to ${pendingAction.label.toLowerCase()} ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <ModernButton variant="secondary" onClick={cancelAction}>
                Cancel
              </ModernButton>
              <ModernButton
                variant={pendingAction.variant || 'danger'}
                onClick={confirmAction}
              >
                {pendingAction.label}
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for managing bulk selection state
export function useBulkSelection<T>(
  items: T[],
  getItemKey: (item: T) => string
) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const selectAll = React.useCallback(() => {
    setSelectedItems(items.map(getItemKey));
  }, [items, getItemKey]);

  const clearSelection = React.useCallback(() => {
    setSelectedItems([]);
  }, []);

  const toggleItem = React.useCallback((key: string) => {
    setSelectedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const isSelected = React.useCallback(
    (key: string) => {
      return selectedItems.includes(key);
    },
    [selectedItems]
  );

  const isAllSelected = React.useMemo(() => {
    return items.length > 0 && selectedItems.length === items.length;
  }, [items.length, selectedItems.length]);

  const isIndeterminate = React.useMemo(() => {
    return selectedItems.length > 0 && selectedItems.length < items.length;
  }, [selectedItems.length, items.length]);

  return {
    selectedItems,
    selectAll,
    clearSelection,
    toggleItem,
    isSelected,
    isAllSelected,
    isIndeterminate,
  };
}
