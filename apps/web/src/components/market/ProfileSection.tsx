/**
 * Profile Section Component
 * Extracted from TradingSidebar for better organization
 */

import type { Market, Outcome } from '@/types/market';

interface ProfileSectionProps {
  market: Market;
  currentOutcome: Outcome | undefined;
  selectedCandidate: number;
  isMobile: boolean;
  onCandidateSelect: (candidate: number) => void;
}

/**
 * Profile section component showing candidate info and Yes/No switcher
 * @param props - Component props
 * @returns JSX element
 */
export const ProfileSection = ({
  market,
  currentOutcome,
  selectedCandidate,
  isMobile,
  onCandidateSelect
}: ProfileSectionProps) => {
  if (isMobile) {
    // Mobile layout - Market title + candidate name + Yes/No switcher
    return (
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {currentOutcome?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "PO"}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {market.title}
          </h3>
          <div className="flex items-center gap-2">
            <h4 className="text-sm text-gray-600 dark:text-gray-400">
              {currentOutcome?.name || "Peter Obi"}
            </h4>
            <button 
              onClick={() => onCandidateSelect(selectedCandidate === 0 ? 1 : 0)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedCandidate === 0 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span>{selectedCandidate === 0 ? "Yes" : "No"}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - Candidate name only
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-lg font-bold text-white">
          {currentOutcome?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "PO"}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {currentOutcome?.name || "Peter Obi"}
        </h3>
      </div>
    </div>
  );
};
