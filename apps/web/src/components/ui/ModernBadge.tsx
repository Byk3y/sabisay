'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ModernBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  animated?: boolean;
}

const badgeVariants = {
  default:
    'bg-admin-gray-100 text-admin-gray-800 dark:bg-admin-gray-800 dark:text-admin-gray-200',
  success:
    'bg-admin-success-100 text-admin-success-800 dark:bg-admin-success-900/20 dark:text-admin-success-400',
  warning:
    'bg-admin-warning-100 text-admin-warning-800 dark:bg-admin-warning-900/20 dark:text-admin-warning-400',
  error:
    'bg-admin-error-100 text-admin-error-800 dark:bg-admin-error-900/20 dark:text-admin-error-400',
  info: 'bg-admin-primary-100 text-admin-primary-800 dark:bg-admin-primary-900/20 dark:text-admin-primary-400',
  outline:
    'border border-admin-gray-300 text-admin-gray-700 dark:border-admin-gray-600 dark:text-admin-gray-300',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const ModernBadge = forwardRef<HTMLDivElement, ModernBadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      animated = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
          badgeVariants[variant],
          badgeSizes[size],
          animated && 'animate-pulse-slow',
          className
        )}
        ref={ref}
        {...props}
      >
        {dot && (
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'default' && 'bg-admin-gray-500',
              variant === 'success' && 'bg-admin-success-500',
              variant === 'warning' && 'bg-admin-warning-500',
              variant === 'error' && 'bg-admin-error-500',
              variant === 'info' && 'bg-admin-primary-500',
              variant === 'outline' && 'bg-admin-gray-500'
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

ModernBadge.displayName = 'ModernBadge';

// Status badge specifically for event statuses
export interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'onchain' | 'live' | 'closed' | 'resolved';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const statusConfig: Record<
  StatusBadgeProps['status'],
  { variant: ModernBadgeProps['variant']; label: string }
> = {
  draft: { variant: 'default', label: 'Draft' },
  pending: { variant: 'warning', label: 'Pending' },
  onchain: { variant: 'info', label: 'On Chain' },
  live: { variant: 'success', label: 'Live' },
  closed: { variant: 'error', label: 'Closed' },
  resolved: { variant: 'info', label: 'Resolved' },
};

export const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, size = 'md', animated = false, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <ModernBadge
        ref={ref}
        variant={config.variant}
        size={size}
        animated={animated}
        {...props}
      >
        {config.label}
      </ModernBadge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
