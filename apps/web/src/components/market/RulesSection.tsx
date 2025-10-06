/**
 * Rules Section Component
 * Extracted from page.tsx for better organization and reusability
 */

import { useState } from 'react';
import type { RulesSectionProps } from '@/types/market';

/**
 * Rules section component for displaying market rules
 * @param props - Component props
 * @returns JSX element
 */
export const RulesSection = ({ rules, onShowMore }: RulesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Split rules into first line and remaining content
  const lines = rules.split('\n');
  const firstLine = lines[0] || '';
  const remainingLines = lines.slice(1).join('\n');
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onShowMore) {
      onShowMore();
    }
  };

  return (
    <div className="mb-2">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Rules
        </h2>
      </div>
      <div className="space-y-3">
        <p className="text-base text-gray-900 dark:text-white leading-relaxed">
          {isExpanded ? rules : firstLine}
        </p>
        {remainingLines && (
          <button
            onClick={handleToggle}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <span>{isExpanded ? 'Show less' : 'Show more'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
