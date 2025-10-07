'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernSectionCardProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isCompleted?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ModernSectionCard({
  title,
  icon,
  defaultOpen = true,
  isCompleted = false,
  children,
  className,
}: ModernSectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
        isCompleted &&
          'ring-2 ring-admin-success-200 dark:ring-admin-success-800',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors rounded-t-xl"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
            {title}
          </h3>

          {/* Completion indicator */}
          {isCompleted && (
            <div className="flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-admin-success-500" />
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
          ) : (
            <ChevronRight className="w-4 h-4 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-4 pt-2 space-y-3 border-t border-sabi-border dark:border-sabi-border-dark animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
