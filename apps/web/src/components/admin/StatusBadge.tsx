import { EventStatus } from '@/types/admin';

interface StatusBadgeProps {
  status: EventStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<EventStatus, { label: string; className: string }> =
  {
    draft: {
      label: 'Draft',
      className:
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    },
    pending: {
      label: 'Pending',
      className:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    onchain: {
      label: 'On Chain',
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    },
    live: {
      label: 'Live',
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    },
    closed: {
      label: 'Closed',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    },
    resolved: {
      label: 'Resolved',
      className:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    },
  };

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
