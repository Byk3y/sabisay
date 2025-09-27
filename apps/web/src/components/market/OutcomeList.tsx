/**
 * Outcome List Component
 * Extracted from page.tsx for better organization and reusability
 */

import type { OutcomeListProps } from '@/types/market';
import { formatCurrencyNoSymbol } from '@/lib/formattingUtils';

/**
 * Outcome list component for displaying market outcomes with buy/sell buttons
 * @param props - Component props
 * @returns JSX element
 */
export const OutcomeList = ({
  outcomes,
  selectedOutcome,
  selectedCandidate,
  onOutcomeSelect,
  isMobile = false,
  onMobileSidebarOpen,
}: OutcomeListProps) => {
  return (
    <div className="mb-2">
      <div
        className={`${isMobile ? 'flex justify-between items-center' : 'flex items-center'} pb-3 border-b border-gray-200 dark:border-gray-700 mb-0`}
      >
        <div className="flex-1">
          <h2
            className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide`}
          >
            OUTCOME
          </h2>
        </div>
        <div
          className={`${isMobile ? 'flex items-center gap-2' : 'flex-1 flex justify-center'}`}
        >
          <span
            className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide`}
          >
            % CHANCE
          </span>
          <svg
            className="w-4 h-4 text-gray-400"
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
        </div>
        {!isMobile && <div className="flex-1"></div>}
      </div>
      <div
        className={`${isMobile ? 'space-y-0' : 'divide-y divide-gray-200 dark:divide-gray-700'}`}
      >
        {outcomes.map((outcome, index) => (
          <div
            key={index}
            className={`${isMobile ? 'py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0' : 'flex items-center py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'}`}
          >
            {isMobile ? (
              // Mobile: Vertical card layout
              <div className="space-y-3">
                {/* Candidate info row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {outcome.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        {outcome.name}
                      </div>
                      <div
                        className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300`}
                      >
                        ${formatCurrencyNoSymbol(outcome.volume)} Vol.
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {outcome.probability}%
                  </div>
                </div>
                {/* Action buttons row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onOutcomeSelect(index, 0);
                      if (isMobile && onMobileSidebarOpen) {
                        onMobileSidebarOpen();
                      }
                    }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${
                      isMobile
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30'
                        : selectedCandidate === 0 && selectedOutcome === index
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30'
                    }`}
                  >
                    Buy Yes{' '}
                    <span className="text-base">{outcome.price.yes}¢</span>
                  </button>
                  <button
                    onClick={() => {
                      onOutcomeSelect(index, 1);
                      if (isMobile && onMobileSidebarOpen) {
                        onMobileSidebarOpen();
                      }
                    }}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${
                      isMobile
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30'
                        : selectedCandidate === 1 && selectedOutcome === index
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30'
                    }`}
                  >
                    Buy No{' '}
                    <span className="text-base">{outcome.price.no}¢</span>
                  </button>
                </div>
              </div>
            ) : (
              // Desktop: Original horizontal layout
              <>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {outcome.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-base">
                      {outcome.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ${formatCurrencyNoSymbol(outcome.volume)} Vol. 📊
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {outcome.probability}%
                  </div>
                </div>
                <div className="flex gap-2 flex-1 justify-end">
                  <button
                    onClick={() => {
                      onOutcomeSelect(index, 0);
                      if (isMobile && onMobileSidebarOpen) {
                        onMobileSidebarOpen();
                      }
                    }}
                    className={`py-3.5 rounded text-xs font-bold transition-colors w-[100px] text-center ${
                      selectedCandidate === 0 && selectedOutcome === index
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30'
                    }`}
                  >
                    Buy Yes{' '}
                    <span className="text-sm">{outcome.price.yes}¢</span>
                  </button>
                  <button
                    onClick={() => {
                      onOutcomeSelect(index, 1);
                      if (isMobile && onMobileSidebarOpen) {
                        onMobileSidebarOpen();
                      }
                    }}
                    className={`py-3.5 rounded text-xs font-bold transition-colors w-[100px] text-center ${
                      selectedCandidate === 1 && selectedOutcome === index
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30'
                    }`}
                  >
                    Buy No <span className="text-sm">{outcome.price.no}¢</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* About section - Mobile only */}
        {isMobile && (
          <div className="py-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-3">
              About
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-blue-500">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Volume
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${formatCurrencyNoSymbol(outcomes[0]?.volume || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-blue-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    End Date
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Feb 25, 2027
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
