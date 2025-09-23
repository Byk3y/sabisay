"use client";

import { Market } from "@/lib/mock";
import { formatPool } from "@/lib/mock";

interface MarketCardProps {
  market: Market;
  onYesClick?: (marketId: string, outcomeIndex: number) => void;
  onNoClick?: (marketId: string, outcomeIndex: number) => void;
}

export function MarketCard({ 
  market, 
  onYesClick, 
  onNoClick
}: MarketCardProps) {
  return (
    <article className="rounded-xl border border-finance-border bg-finance-card shadow-sm">
      <div className="p-4">
        {/* Image and title on the same line */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[38px] h-[38px] shrink-0 rounded-lg bg-white overflow-hidden">
            {market.imageUrl && (
              <img 
                src={market.imageUrl} 
                alt="Market" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <h3 className="text-[15px] font-semibold leading-5 line-clamp-2 flex-1 text-finance-text-primary">
            {market.question}
          </h3>
        </div>

        {/* Outcomes */}
        {market.outcomes.map((outcome, index) => (
          <div key={index} className="flex items-center justify-between gap-3 py-1">
            <div className="truncate text-finance-text-secondary text-sm">
              {outcome.label}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-10 text-right text-[15px] font-semibold text-finance-text-primary">
                {outcome.oddsPct}%
              </div>
              <button 
                className="rounded-md bg-finance-success hover:bg-finance-success-hover px-2.5 py-1.5 text-xs font-medium text-finance-text-primary"
                onClick={() => onYesClick?.(market.id, index)}
              >
                Yes
              </button>
              <button 
                className="rounded-md bg-finance-danger hover:bg-finance-danger-hover px-2.5 py-1.5 text-xs font-medium text-finance-text-primary"
                onClick={() => onNoClick?.(market.id, index)}
              >
                No
              </button>
            </div>
          </div>
        ))}

        <div className="mt-2">
          <div className="text-xs text-finance-highlight-soft font-medium">
            {formatPool(market.poolUsd)} Pool
          </div>
        </div>
      </div>
    </article>
  );
}
