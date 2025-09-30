'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionAccordion({
  title,
  defaultOpen = true,
  children,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
          {title}
        </h3>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
        ) : (
          <ChevronRight className="w-4 h-4 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-sabi-border dark:border-sabi-border-dark">
          {children}
        </div>
      )}
    </div>
  );
}
