/**
 * Market Header Component
 * Extracted from page.tsx for better organization and reusability
 */

'use client';

import { useState } from 'react';
import type { MarketHeaderProps } from '@/types/market';
import { formatCurrencyNoSymbol, formatDate } from '@/lib/formattingUtils';
import { getDefaultOutcomeColor } from '@/lib/colors';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

/**
 * Market header component with title, volume, date, and action buttons
 * @param props - Component props
 * @returns JSX element
 */
export const MarketHeader = ({
  market,
  onShare,
  onBookmark,
  isMobile = false,
  isBinaryMarket = false,
}: MarketHeaderProps) => {

  return (
    <div className="mb-4">
      {/* Volume Bar - Mobile only, positioned at top */}
      {isMobile && (
        <div className="flex items-center justify-between -mt-3 bg-transparent">
          {/* Volume on the left - starts from absolute screen edge */}
          <div className="text-sm text-gray-500 dark:text-gray-500">
            <span className="font-normal">
              ${formatCurrencyNoSymbol(market.volume)} Vol.
            </span>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3">
            <button
              onClick={onShare}
              className="p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Share market"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </button>
            <button
              onClick={onBookmark}
              className="p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Bookmark market"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className={`flex items-center gap-4 ${isMobile ? 'mb-4 mt-3' : 'mb-4'}`}
      >
        <div
          className={`${isMobile ? 'w-12 h-12 rounded-lg' : 'w-16 h-16 rounded-xl'} bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden`}
        >
          {market.imageUrl ? (
            <ImageWithFallback
              src={market.imageUrl}
              alt={market.title}
              width={isMobile ? 48 : 64}
              height={isMobile ? 48 : 64}
              className="w-full h-full object-cover"
              unoptimized={market.imageUrl.startsWith('http')}
              fallbackElement={
                <span
                  className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-lg' : 'text-3xl'} font-bold`}
                >
                  📊
                </span>
              }
            />
          ) : (
            <span
              className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-lg' : 'text-3xl'} font-bold`}
            >
              📊
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1
            className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-gray-900 dark:text-white`}
          >
            {market.question}
          </h1>
        </div>
        {/* Action buttons - Desktop only */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Share market"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </button>
            <button
              onClick={onBookmark}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Bookmark market"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Mobile-only outcomes under icon - hide for chance markets */}
      {isMobile && !isBinaryMarket && (
        <div className="mb-4">
          <div className="space-y-1">
            {market.outcomes
              ?.map((outcome, originalIndex) => ({
                ...outcome,
                color: outcome.color ?? getDefaultOutcomeColor(originalIndex),
              }))
              ?.sort((a, b) => b.volume - a.volume)
              ?.slice(0, 4)
              ?.map((outcome, index) => {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: outcome.color }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {outcome.label} {outcome.probability}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Volume and Date under the icon - Desktop only */}
      {!isMobile && (
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>${formatCurrencyNoSymbol(market.volume)} Vol.</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatDate(market.endDate)}</span>
            </div>
          </div>
          {/* Desktop outcomes - horizontal layout - hide for chance markets */}
          {!isBinaryMarket && (
            <div className="flex items-center gap-6 text-sm">
              {market.outcomes
                ?.map((outcome, originalIndex) => ({
                  ...outcome,
                  color: outcome.color ?? getDefaultOutcomeColor(originalIndex),
                }))
                ?.sort((a, b) => b.volume - a.volume)
                ?.slice(0, 4)
                ?.map((outcome, index) => {
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: outcome.color }}
                      ></div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {outcome.label} {outcome.probability}%
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
