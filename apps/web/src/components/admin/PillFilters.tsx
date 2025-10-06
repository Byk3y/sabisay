'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';

export interface PillFilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface PillFilter {
  key: string;
  label: string;
  value: string;
  options: PillFilterOption[];
  onValueChange: (value: string) => void;
  onClear?: () => void;
}

export interface PillFiltersProps {
  filters: PillFilter[];
  className?: string;
}

export function PillFilters({ filters, className }: PillFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      });
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const handleFilterClick = (filterKey: string) => {
    setOpenDropdown(openDropdown === filterKey ? null : filterKey);
  };

  const handleOptionSelect = (filterKey: string, value: string) => {
    const filter = filters.find(f => f.key === filterKey);
    if (filter) {
      filter.onValueChange(value);
    }
    setOpenDropdown(null);
  };

  const handleClear = (filterKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filter = filters.find(f => f.key === filterKey);
    if (filter?.onClear) {
      filter.onClear();
    }
  };

  const getDisplayValue = (filter: PillFilter) => {
    const option = filter.options.find(opt => opt.value === filter.value);
    return option?.label || filter.value;
  };

  const hasActiveValue = (filter: PillFilter) => {
    const defaultValue = filter.key === 'sortBy' ? 'created_at' : 'all';
    return filter.value && filter.value !== defaultValue;
  };

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto no-scrollbar', className)}>
      {filters.map(filter => (
        <div
          key={filter.key}
          ref={el => { dropdownRefs.current[filter.key] = el; }}
          className="relative"
        >
          <button
            onClick={() => handleFilterClick(filter.key)}
            className={cn(
              'flex items-center gap-1 px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors',
              hasActiveValue(filter)
                ? 'bg-admin-primary-100 text-admin-primary-700 dark:bg-admin-primary-900/20 dark:text-admin-primary-400'
                : 'bg-admin-gray-100 text-admin-gray-600 dark:bg-admin-gray-800 dark:text-admin-gray-400 hover:bg-admin-gray-200 dark:hover:bg-admin-gray-700'
            )}
          >
            <span className="font-medium">{filter.label}:</span>
            <span className="font-normal">{getDisplayValue(filter)}</span>
            {hasActiveValue(filter) && filter.onClear && (
              <button
                onClick={(e) => handleClear(filter.key, e)}
                className="ml-1 p-0.5 rounded-full hover:bg-admin-primary-200 dark:hover:bg-admin-primary-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>

          {/* Dropdown */}
          {openDropdown === filter.key && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg shadow-lg py-1 z-50 animate-fade-in">
              {filter.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(filter.key, option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                    filter.value === option.value
                      ? 'bg-admin-primary-50 text-admin-primary-700 dark:bg-admin-primary-900/10 dark:text-admin-primary-400'
                      : 'text-sabi-text-primary dark:text-sabi-text-primary-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span>{option.label}</span>
                  {filter.value === option.value && (
                    <div className="w-2 h-2 rounded-full bg-admin-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Hook for managing pill filter state
export function usePillFilters(initialFilters: Record<string, string> = {}) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilters);

  const updateFilter = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key: string) => {
    // Reset to default value based on the key
    const defaultValue = key === 'sortBy' ? 'created_at' : 'all';
    setFilterValues(prev => ({ ...prev, [key]: defaultValue }));
  };

  const clearAllFilters = () => {
    setFilterValues(initialFilters);
  };

  const hasActiveFilters = Object.entries(filterValues).some(([key, value]) => {
    const defaultValue = key === 'sortBy' ? 'created_at' : 'all';
    return value && value !== defaultValue;
  });

  return {
    filterValues,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  };
}
