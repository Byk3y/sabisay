"use client";
import type { MarketItem } from "@/types/market";

export function BinaryTradingPanel({ market }: { market: Extract<MarketItem,{kind:"market"}> }) {
  // Placeholder panel: keep minimal controls so we don't break your current sidebar.
  const yesPct =
    market.outcomes && market.outcomes.length > 0 && market.outcomes[0]
      ? Math.round(market.outcomes[0].oddsPct)
      : 50;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Chance</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{yesPct}%</div>
      </div>
      {/* Keep simple actions; we'll wire real trading later */}
      <div className="grid grid-cols-2 gap-2">
        <button className="py-2 rounded bg-green-600 text-white">Buy Yes</button>
        <button className="py-2 rounded bg-red-600 text-white">Buy No</button>
      </div>
    </div>
  );
}
