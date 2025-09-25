/**
 * Rules Section Component
 * Extracted from page.tsx for better organization and reusability
 */

import type { RulesSectionProps } from '@/types/market';

/**
 * Rules section component for displaying market rules
 * @param props - Component props
 * @returns JSX element
 */
export const RulesSection = ({ rules, onShowMore }: RulesSectionProps) => {
  return (
    <div className="mb-2">
      <div className="pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Rules
        </h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
          {rules}
        </p>
        {onShowMore && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Show more</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
