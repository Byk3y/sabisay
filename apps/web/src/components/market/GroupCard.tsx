"use client";
import Link from "next/link";
import type { MarketItem } from "@/types/market";
import { CardShell, CardHeader, ActionPill } from "./_primitives";
import { formatPool } from "@/lib/mock";

export function GroupCard({ group }: { group: Extract<MarketItem,{kind:"group"}> }) {
  // All groups now link to their main market page
  const href = group.groupId === "election-nyc-2025" 
    ? "/market/nyc-mayor-2025" 
    : `/market/${group.groupId}`;
    
  return (
    <Link href={href}>
      <CardShell>
        {/* Header with icon placeholder and title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[38px] h-[38px] shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {/* Image placeholder - same as MarketCard */}
          </div>
          <h3 className="text-[15px] font-semibold leading-5 line-clamp-2 flex-1 text-gray-900 dark:text-white">
            {group.title}
          </h3>
        </div>

        {/* Candidates list - show 2 initially, 3rd scrollable */}
        <div className="max-h-20 overflow-y-auto">
          {group.members.map((member, index) => (
            <div key={member.marketId} className="flex items-center justify-between gap-3 py-1">
              <div className="truncate text-gray-800 dark:text-gray-200 text-sm font-medium">
                {member.label}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-10 text-right text-[15px] font-semibold text-gray-900 dark:text-white">
                  {/* Placeholder percentages for demo - in real app, fetch from market data */}
                  {index === 0 ? "38%" : index === 1 ? "42%" : index === 2 ? "25%" : "15%"}
                </div>
                <ActionPill variant="yes">
                  Yes
                </ActionPill>
                <ActionPill variant="no">
                  No
                </ActionPill>
              </div>
            </div>
          ))}
        </div>

        {/* Pool subtitle at bottom to match MarketCard */}
        <div className="mt-2">
          <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
            {formatPool(group.members.length * 100000)} Pool
          </div>
        </div>
      </CardShell>
    </Link>
  );
}
