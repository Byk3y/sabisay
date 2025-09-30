'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { EventsListResponse, EventListItem, EventStatus } from '@/types/admin';
import { truncateAddress } from '@/lib/utils';
import { formatDate } from '@/lib/formattingUtils';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';

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
];

export function EventsListClient() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<EventStatus[]>([]);
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [sortBy, setSortBy] = useState<
    'created_at' | 'close_time' | 'status' | 'title'
  >('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      selectedStatuses.forEach(status => params.append('status[]', status));
      if (createdFrom) params.append('createdFrom', createdFrom);
      if (createdTo) params.append('createdTo', createdTo);
      params.append('sort', sortBy);
      params.append('order', sortOrder);
      params.append('page', page.toString());

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
  };

  // Handle action
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
        {
          id: toastId,
        }
      );

      // Refresh the list
      await fetchEvents();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Failed to ${action} event`;
      toast.error(message, { id: toastId });
    }
  };

  // Effects
  useEffect(() => {
    fetchEvents();
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    // Debounce search and filters
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset to first page when filters change
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedStatuses, createdFrom, createdTo]);

  const getExplorerLink = (address: string) => {
    return `https://amoy.polygonscan.com/address/${address}`;
  };

  const totalPages = Math.ceil(total / pageSize);

  // Define table columns
  const columns: Column<EventListItem>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: event => (
        <div>
          <Link
            href={`/event/${event.slug}`}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {event.title}
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
      render: event => <span className="text-sm capitalize">{event.type}</span>,
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
            href={getExplorerLink(event.market_address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {truncateAddress(event.market_address)}
          </a>
        ) : (
          <span className="text-sm text-sabi-text-muted dark:text-sabi-text-muted-dark">
            -
          </span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: event => (
        <div className="flex items-center gap-2">
          <Link
            href={`/event/${event.slug}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View
          </Link>
          <Link
            href={`/admin/events/${event.id}`}
            className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark"
          >
            Edit
          </Link>
          {event.status === 'draft' && event.market_address && (
            <button
              onClick={() => handleAction(event.id, 'publish')}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
            >
              Publish
            </button>
          )}
          {event.status === 'live' && (
            <button
              onClick={() => handleAction(event.id, 'close')}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Close
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters - Sticky */}
      <div className="sticky top-14 z-10 bg-sabi-card dark:bg-sabi-card-dark shadow-sm rounded-xl border border-sabi-border dark:border-sabi-border-dark p-6">
        <h2 className="text-lg font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark mb-4">
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full px-3 py-2 border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark mb-1">
              Status
            </label>
            <select
              multiple
              value={selectedStatuses}
              onChange={e => {
                const values = Array.from(
                  e.target.selectedOptions,
                  option => option.value as EventStatus
                );
                setSelectedStatuses(values);
              }}
              className="w-full px-3 py-2 border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark mb-1">
              Created From
            </label>
            <input
              type="date"
              value={createdFrom}
              onChange={e => setCreatedFrom(e.target.value)}
              className="w-full px-3 py-2 border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark mb-1">
              Created To
            </label>
            <input
              type="date"
              value={createdTo}
              onChange={e => setCreatedTo(e.target.value)}
              className="w-full px-3 py-2 border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(
                  e.target.value as
                    | 'created_at'
                    | 'close_time'
                    | 'status'
                    | 'title'
                )
              }
              className="px-3 py-1 border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
              Order:
            </label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-1 border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-sabi-card dark:bg-sabi-card-dark shadow-sm rounded-xl border border-sabi-border dark:border-sabi-border-dark">
        <div className="px-6 py-4 border-b border-sabi-border dark:border-sabi-border-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
              Events ({total})
            </h2>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sabi-accent hover:bg-sabi-accent/90 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabi-accent transition-colors"
            >
              Create New Event
            </Link>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={events}
            loading={loading}
            emptyMessage="No events found"
            getRowKey={event => event.id}
          />
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-sabi-border dark:divide-sabi-border-dark">
          {loading ? (
            <div className="p-4 animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                No events found
              </p>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/event/${event.slug}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block truncate"
                    >
                      {event.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark capitalize">
                        {event.type}
                      </span>
                      <StatusBadge status={event.status} size="sm" />
                    </div>
                    <div className="mt-2 text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                      <div>Close: {formatDate(new Date(event.close_time))}</div>
                      <div>
                        Created: {formatDate(new Date(event.created_at))}
                      </div>
                      {event.market_address && (
                        <div>
                          Market:{' '}
                          <a
                            href={getExplorerLink(event.market_address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {truncateAddress(event.market_address)}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <Link
                      href={`/event/${event.slug}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark"
                    >
                      Edit
                    </Link>
                    {event.status === 'draft' && event.market_address && (
                      <button
                        onClick={() => handleAction(event.id, 'publish')}
                        className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      >
                        Publish
                      </button>
                    )}
                    {event.status === 'live' && (
                      <button
                        onClick={() => handleAction(event.id, 'close')}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-sabi-border dark:border-sabi-border-dark">
            <div className="flex items-center justify-between">
              <div className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, total)} of {total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
