'use client';

import Link from 'next/link';
import { RawMarket } from '@/lib/mock';
import { formatPool } from '@/lib/mock';
import { buildEventUrl, generateMarketSlug } from '@/lib/slugUtils';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface MarketCardProps {
  market: RawMarket;
  onYesClick?: (marketId: string, outcomeIndex: number) => void;
  onNoClick?: (marketId: string, outcomeIndex: number) => void;
}

export function MarketCard({ market, onYesClick, onNoClick }: MarketCardProps) {
  // Generate event URL using proper slug generation
  const marketSlug = market.slug || generateMarketSlug(market);
  const eventUrl = buildEventUrl(marketSlug);

  return (
    <Link href={eventUrl}>
      <article className="rounded-xl border border-gray-300 dark:border-gray-600/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-lg dark:hover:bg-gray-800/70 transition-all duration-200 ring-1 ring-gray-100 dark:ring-gray-700/50 cursor-pointer">
        <div className="p-4">
          {/* Image and title on the same line */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[38px] h-[38px] shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {market.imageUrl && (
                <ImageWithFallback
                  src={market.imageUrl}
                  alt="Market"
                  width={38}
                  height={38}
                  className="w-full h-full object-cover"
                  unoptimized={market.imageUrl.startsWith('http')}
                  fallbackElement={
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">📊</span>
                    </div>
                  }
                />
              )}
            </div>
            <h3 className="text-[15px] font-semibold leading-5 line-clamp-2 flex-1 text-gray-900 dark:text-white">
              {market.question}
            </h3>
          </div>

          {/* Outcomes */}
          <div className="relative">
            {market.outcomes.length <= 2 ? (
              /* For markets with 2 or fewer outcomes, show all */
              market.outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 py-1"
                >
                  <div className="flex items-center gap-2 truncate text-gray-800 dark:text-gray-200 text-sm font-medium">
                    <span className="truncate">{outcome.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-10 text-right text-[15px] font-semibold text-gray-900 dark:text-white">
                      {outcome.oddsPct}%
                    </div>
                    <button
                      className="rounded-md bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 border border-green-300 dark:border-green-500/30 px-2.5 py-1.5 text-xs font-medium text-green-800 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors shadow-sm"
                      onClick={() => onYesClick?.(market.id, index)}
                    >
                      Yes
                    </button>
                    <button
                      className="rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors shadow-sm"
                      onClick={() => onNoClick?.(market.id, index)}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* For markets with more than 2 outcomes, constrain to fixed height and make all scrollable */
              <div className="max-h-[76px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {market.outcomes.map((outcome, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 py-1"
                  >
                    <div className="flex items-center gap-2 truncate text-gray-800 dark:text-gray-200 text-sm font-medium">
                      <span className="truncate">{outcome.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-10 text-right text-[15px] font-semibold text-gray-900 dark:text-white">
                        {outcome.oddsPct}%
                      </div>
                      <button
                        className="rounded-md bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 border border-green-300 dark:border-green-500/30 px-2.5 py-1.5 text-xs font-medium text-green-800 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors shadow-sm"
                        onClick={() => onYesClick?.(market.id, index)}
                      >
                        Yes
                      </button>
                      <button
                        className="rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors shadow-sm"
                        onClick={() => onNoClick?.(market.id, index)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2">
            <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
              {formatPool(market.poolUsd)} Pool
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
