'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { EventsListResponse, EventListItem, EventStatus } from '@/types/admin';
import { truncateAddress } from '@/lib/utils';
import { formatDate } from '@/lib/formattingUtils';
import { EnhancedDataTable, Column } from '@/components/admin/EnhancedDataTable';
import { PillFilters, usePillFilters } from '@/components/admin/PillFilters';
import { BulkActionBar, BulkAction, useBulkSelection } from '@/components/admin/BulkActionBar';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/ModernCard';
import { StatusBadge } from '@/components/ui/ModernBadge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'onchain', label: 'On Chain' },
  { value: 'live', label: 'Live' },
  { value: 'closed', label: 'Closed' },
  { value: 'resolved', label: 'Resolved' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created' },
  { value: 'close_time', label: 'Close Time' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
  { value: 'volume', label: '24hr Volume' },
];

const STATUS_OPTIONS_PILLS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'onchain', label: 'On Chain' },
  { value: 'live', label: 'Live' },
  { value: 'closed', label: 'Closed' },
  { value: 'resolved', label: 'Resolved' },
];

const FREQUENCY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];


export function ModernEventsListClient() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Pill filter states
  const {
    filterValues,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  } = usePillFilters({
    sortBy: 'created_at',
    status: 'all',
    frequency: 'all',
  });

  // Bulk selection
  const {
    selectedItems,
    selectAll,
    clearSelection,
    toggleItem,
    isSelected,
    isAllSelected,
    isIndeterminate,
  } = useBulkSelection(events, event => event.id);


  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filterValues.status && filterValues.status !== 'all') {
        params.append('status[]', filterValues.status);
      }
      if (filterValues.sortBy) {
        params.append('sort', filterValues.sortBy);
      }
      if (filterValues.frequency && filterValues.frequency !== 'all') {
        // Add date range based on frequency
        const now = new Date();
        let fromDate = '';
        switch (filterValues.frequency) {
          case 'today':
            fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
            break;
          case 'week':
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'month':
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            break;
          case 'year':
            fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            break;
        }
        if (fromDate) {
          params.append('createdFrom', fromDate);
        }
      }
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await fetch(`/api/admin/events?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: EventsListResponse = await response.json();
      setEvents(data.items);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filterValues, page, pageSize]);

  // Handle pill filter changes
  const handlePillFilterChange = useCallback((key: string, value: string) => {
    updateFilter(key, value);
    setPage(1); // Reset to first page when filters change
  }, [updateFilter]);

  const handlePillFilterClear = useCallback((key: string) => {
    clearFilter(key);
    setPage(1);
  }, [clearFilter]);

  // Handle actions
  const handleAction = async (eventId: string, action: 'publish' | 'close') => {
    const toastId = toast.loading(
      `${action === 'publish' ? 'Publishing' : 'Closing'} event...`
    );

    try {
      const response = await fetch(`/api/admin/events/${eventId}/${action}`, {
        method: 'POST',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} event`);
      }

      toast.success(
        `Event ${action === 'publish' ? 'published' : 'closed'} successfully`,
        { id: toastId }
      );

      await fetchEvents();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Failed to ${action} event`;
      toast.error(message, { id: toastId });
    }
  };

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'publish',
      label: 'Publish',
      icon: <TrendingUp className="w-4 h-4" />,
      variant: 'success',
      onClick: (selectedIds) => {
        selectedIds.forEach(id => handleAction(id, 'publish'));
      },
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to publish the selected events?',
    },
    {
      id: 'close',
      label: 'Close',
      icon: <Calendar className="w-4 h-4" />,
      variant: 'warning',
      onClick: (selectedIds) => {
        selectedIds.forEach(id => handleAction(id, 'close'));
      },
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to close the selected events?',
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      variant: 'secondary',
      onClick: (selectedIds) => {
        // Export selected events
        console.log('Exporting events:', selectedIds);
      },
    },
  ];

  // Table columns
  const columns: Column<EventListItem>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: event => (
        <div>
          <Link
            href={`/event/${event.slug}`}
            className="text-sm font-medium text-admin-primary-600 dark:text-admin-primary-400 hover:text-admin-primary-800 dark:hover:text-admin-primary-300"
          >
            {event.question}
          </Link>
          <div className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
            {event.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: event => (
        <span className="text-sm capitalize">{event.type}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: event => <StatusBadge status={event.status} />,
    },
    {
      key: 'close_time',
      label: 'Close Time',
      sortable: true,
      render: event => (
        <span className="text-sm">
          {formatDate(new Date(event.close_time))}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: event => (
        <span className="text-sm">
          {formatDate(new Date(event.created_at))}
        </span>
      ),
    },
    {
      key: 'market_address',
      label: 'Market Address',
      render: event =>
        event.market_address ? (
          <a
            href={`https://amoy.polygonscan.com/address/${event.market_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-admin-primary-600 dark:text-admin-primary-400 hover:text-admin-primary-800 dark:hover:text-admin-primary-300 flex items-center gap-1"
          >
            {truncateAddress(event.market_address)}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-sm text-sabi-text-muted dark:text-sabi-text-muted-dark">
            -
          </span>
        ),
    },
  ];

  // Effects
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getExplorerLink = (address: string) => {
    return `https://amoy.polygonscan.com/address/${address}`;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
          Events Management
        </h1>
        <p className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
          Manage prediction market events
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Pill Filters */}
        <div className="flex items-center justify-between">
          <PillFilters
            filters={[
              {
                key: 'sortBy',
                label: 'Sort by',
                value: filterValues.sortBy,
                options: SORT_OPTIONS,
                onValueChange: (value) => handlePillFilterChange('sortBy', value),
                onClear: () => handlePillFilterClear('sortBy'),
              },
              {
                key: 'frequency',
                label: 'Frequency',
                value: filterValues.frequency,
                options: FREQUENCY_OPTIONS,
                onValueChange: (value) => handlePillFilterChange('frequency', value),
                onClear: () => handlePillFilterClear('frequency'),
              },
              {
                key: 'status',
                label: 'Status',
                value: filterValues.status,
                options: STATUS_OPTIONS_PILLS,
                onValueChange: (value) => handlePillFilterChange('status', value),
                onClear: () => handlePillFilterClear('status'),
              },
            ]}
            className="flex-1"
          />
          {hasActiveFilters && (
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All
            </ModernButton>
          )}
        </div>

        {/* Data Table */}
        <EnhancedDataTable
          columns={columns}
          data={events}
          loading={loading}
          emptyMessage="No events found"
          getRowKey={event => event.id}
          selectable={true}
          selectedRows={selectedItems}
          onSelectionChange={(keys) => {
            // Handle selection change
            keys.forEach(key => {
              if (!selectedItems.includes(key)) {
                toggleItem(key);
              }
            });
            selectedItems.forEach(key => {
              if (!keys.includes(key)) {
                toggleItem(key);
              }
            });
          }}
          actions={[
            {
              label: 'View',
              icon: <Eye className="w-4 h-4" />,
              onClick: (event) => {
                window.open(`/event/${event.slug}`, '_blank');
              },
            },
            {
              label: 'Edit',
              icon: <Edit className="w-4 h-4" />,
              onClick: (event) => {
                window.location.href = `/admin/events/${event.id}`;
              },
            },
          ]}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* Bulk Actions */}
      <BulkActionBar
        selectedItems={selectedItems}
        totalItems={events.length}
        actions={bulkActions}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
