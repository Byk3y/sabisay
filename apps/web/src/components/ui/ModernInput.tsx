'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const inputVariants = {
  default:
    'bg-white dark:bg-admin-gray-800 border border-admin-gray-300 dark:border-admin-gray-600',
  filled: 'bg-admin-gray-50 dark:bg-admin-gray-800 border-0',
  outlined:
    'bg-transparent border-2 border-admin-gray-300 dark:border-admin-gray-600',
};

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-lg px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-admin-gray-400 focus:outline-none focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-admin-error-500 focus:ring-admin-error-500',
              inputVariants[variant],
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-admin-error-600 dark:text-admin-error-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-admin-gray-500 dark:text-admin-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';

// Search input variant
export interface ModernSearchInputProps extends Omit<ModernInputProps, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const ModernSearchInput = forwardRef<
  HTMLInputElement,
  ModernSearchInputProps
>(({ onClear, showClearButton = true, value, onChange, ...props }, ref) => {
  const hasValue = value && value.toString().length > 0;

  return (
    <ModernInput
      ref={ref}
      type="search"
      value={value}
      onChange={onChange}
      leftIcon={
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      rightIcon={
        showClearButton && hasValue ? (
          <button
            type="button"
            onClick={onClear}
            className="hover:text-admin-gray-600 dark:hover:text-admin-gray-300 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : undefined
      }
      {...props}
    />
  );
});

ModernSearchInput.displayName = 'ModernSearchInput';
