import React from 'react';

export interface StateBannerProps {
  marketState: 'open' | 'closed' | 'paused' | 'resolved';
  message?: string;
  className?: string;
}

export function StateBanner({ marketState, message, className = "" }: StateBannerProps) {
  const getStateConfig = () => {
    switch (marketState) {
      case 'open':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200',
          icon: '✅',
          defaultMessage: 'Market is open for trading'
        };
      case 'closed':
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: '🔒',
          defaultMessage: 'Market is closed'
        };
      case 'paused':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          icon: '⏸️',
          defaultMessage: 'Market is temporarily paused'
        };
      case 'resolved':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: '🏁',
          defaultMessage: 'Market has been resolved'
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: 'ℹ️',
          defaultMessage: 'Market status unknown'
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{config.icon}</span>
        <span className={`font-medium ${config.textColor}`}>
          {message || config.defaultMessage}
        </span>
      </div>
    </div>
  );
}
