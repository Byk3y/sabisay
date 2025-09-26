"use client";
import Link from "next/link";
import type { MarketItem } from "@/types/market";
import { CardShell, CardHeader, ActionPill } from "./_primitives";
import { formatPool } from "@/lib/mock";

export function ChanceCard({ market }: { market: Extract<MarketItem, {kind:"market"}> }) {
  // Expect market.uiStyle === "chance" (caller ensures)
  const yesPct =
    market.outcomes && market.outcomes.length > 0 && market.outcomes[0]
      ? Math.round(market.outcomes[0].oddsPct)
      : 50;

  // Icon placeholder (same as MarketCard)
  const iconSlot = market.imageUrl ? (
    <img 
      src={market.imageUrl} 
      alt="Market" 
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  ) : null;

  return (
    <Link href={`/market/${market.id}`}>
      <CardShell>
        {/* Header with icon, title, and chance indicator in top-right */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[38px] h-[38px] shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {iconSlot}
          </div>
          <h3 className="text-[15px] font-semibold leading-5 line-clamp-2 flex-1 text-gray-900 dark:text-white">
            {market.question}
          </h3>
          {/* Semi-circular progress indicator in top-right */}
          <div className="relative w-17 h-16 shrink-0 -mt-2">
            <svg className="w-17 h-10 mt-1" viewBox="0 0 68 32">
              {/* Background semi-circle (umbrella shape) */}
              <path
                d="M 6 29.5 A 22 22 0 0 1 62 29.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress semi-circle */}
              <path
                d="M 6 29.5 A 22 22 0 0 1 62 29.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${Math.PI * 22}`}
                strokeDashoffset={`${Math.PI * 22 * (1 - yesPct / 100)}`}
                className="text-green-500"
                strokeLinecap="round"
              />
            </svg>
            {/* Percentage text below semi-circle */}
            <div className="absolute inset-x-0 top-4 flex flex-col items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{yesPct}%</span>
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 -mt-0.5">chance</span>
            </div>
          </div>
        </div>

        {/* First row - Big Yes/No buttons */}
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="flex gap-2 w-full">
            <button className="flex-1 py-2 px-4 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 border border-green-300 dark:border-green-500/30 text-green-800 hover:text-green-900 dark:text-green-300 font-medium transition-colors shadow-sm">
              Yes
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/30 text-red-800 hover:text-red-900 dark:text-red-300 font-medium transition-colors shadow-sm">
              No
            </button>
          </div>
        </div>

        {/* Second row - Empty to match MarketCard */}
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="truncate text-gray-800 dark:text-gray-200 text-sm font-medium">
          </div>
          <div className="flex items-center gap-2 shrink-0">
          </div>
        </div>

        {/* Volume at bottom */}
        <div className="mt-2">
          <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
            {formatPool(market.poolUsd)} Pool
          </div>
        </div>
      </CardShell>
    </Link>
  );
}

