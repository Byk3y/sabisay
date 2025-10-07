/**
 * Profile Section Component
 * Responsive component for market/candidate information display
 * Mobile: Shows market title + candidate name + Yes/No toggle
 * Desktop: Shows only candidate name
 */

import React, { memo, useCallback, useMemo } from 'react';
import type { Market, Outcome } from '@/types/market';

interface ProfileSectionProps {
  market: Market;
  currentOutcome: Outcome;
  selectedCandidate: number;
  onCandidateSelect: (candidate: number) => void;
}

/**
 * Profile section component with responsive design
 * @param props - Component props
 * @returns JSX element
 */
const ProfileSectionComponent = ({
  market,
  currentOutcome,
  selectedCandidate,
  onCandidateSelect,
}: ProfileSectionProps) => {
  const getInitials = useCallback((name: string) => {
    return (
      name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2) || 'PO'
    );
  }, []);

  const handleCandidateToggle = useCallback(() => {
    onCandidateSelect(selectedCandidate === 0 ? 1 : 0);
  }, [selectedCandidate, onCandidateSelect]);

  const initials = useMemo(
    () => getInitials(currentOutcome?.label || 'Peter Obi'),
    [getInitials, currentOutcome?.label]
  );

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Avatar - Event image or initials fallback */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
        {market.imageUrl ? (
          <img
            src={market.imageUrl}
            alt={market.question}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"><span class="text-lg font-bold text-white">${initials}</span></div>`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">{initials}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Mobile: Market title + candidate name + Yes/No toggle */}
        <div className="block md:hidden">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {market.question}
          </h3>
          <div className="flex items-center gap-2">
            <h4 className="text-sm text-gray-600 dark:text-gray-400">
              {currentOutcome?.label || 'Peter Obi'}
            </h4>
            <button
              onClick={handleCandidateToggle}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCandidate === 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}
            >
              <span>{selectedCandidate === 0 ? 'Yes' : 'No'}</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop: Only candidate name */}
        <div className="hidden md:block">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {currentOutcome?.label || 'Peter Obi'}
          </h3>
        </div>
      </div>
    </div>
  );
};

export const ProfileSection = memo(ProfileSectionComponent);
