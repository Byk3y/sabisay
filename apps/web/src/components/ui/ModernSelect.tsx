'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface ModernSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  placeholder?: string;
}

const selectVariants = {
  default:
    'bg-white dark:bg-admin-gray-800 border border-admin-gray-300 dark:border-admin-gray-600',
  filled: 'bg-admin-gray-50 dark:bg-admin-gray-800 border-0',
  outlined:
    'bg-transparent border-2 border-admin-gray-300 dark:border-admin-gray-600',
};

export const ModernSelect = forwardRef<HTMLSelectElement, ModernSelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      placeholder,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg px-3 py-2 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-admin-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-admin-error-500 focus:ring-admin-error-500',
              selectVariants[variant],
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-gray-400 pointer-events-none" />
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

ModernSelect.displayName = 'ModernSelect';

// Multi-select variant
export interface ModernMultiSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

export const ModernMultiSelect = forwardRef<
  HTMLDivElement,
  ModernMultiSelectProps
>(
  (
    {
      label,
      error,
      helperText,
      options,
      value,
      onChange,
      placeholder = 'Select options...',
      variant = 'default',
      className,
    },
    ref
  ) => {
    const handleToggle = (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter(v => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    const selectedOptions = options.filter(option =>
      value.includes(option.value)
    );

    return (
      <div ref={ref} className={cn('space-y-1', className)}>
        {label && (
          <label className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
            {label}
          </label>
        )}
        <div
          className={cn(
            'min-h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-admin-primary-500 focus-within:ring-offset-2',
            error && 'border-admin-error-500 focus-within:ring-admin-error-500',
            selectVariants[variant]
          )}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-admin-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded-md bg-admin-primary-100 px-2 py-1 text-xs text-admin-primary-800 dark:bg-admin-primary-900/20 dark:text-admin-primary-400"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className="hover:text-admin-primary-600 dark:hover:text-admin-primary-300"
                  >
                    <svg
                      className="h-3 w-3"
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
                </span>
              ))}
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

ModernMultiSelect.displayName = 'ModernMultiSelect';
