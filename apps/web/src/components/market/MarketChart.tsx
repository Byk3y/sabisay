/**
 * Market Chart Component
 * Extracted from page.tsx for better organization and reusability
 */

import { useState } from 'react';
import type { MarketChartProps } from '@/types/market';

/**
 * Market chart component with time period controls
 * @param props - Component props
 * @returns JSX element
 */
export const MarketChart = ({ outcomes, onTimePeriodChange }: MarketChartProps) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("ALL");

  const timePeriods = ["1H", "6H", "1D", "1W", "1M", "ALL"];

  const handleTimePeriodChange = (period: string) => {
    setSelectedTimePeriod(period);
    onTimePeriodChange?.(period);
  };

  return (
    <div className="mb-6">
      {/* Chart Legend */}
      <div className="flex items-center gap-6 mb-2 text-sm">
        {outcomes?.map((outcome, index) => {
          const colors = ['bg-orange-500', 'bg-blue-500', 'bg-yellow-500', 'bg-gray-500'];
          return (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
              <span className="text-gray-900 dark:text-white font-medium">
                {outcome.name} {outcome.probability}%
              </span>
            </div>
          );
        }) || (
          // Fallback legend if market data is not available
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-900 dark:text-white font-medium">Loading...</span>
            </div>
          </>
        )}
      </div>

      {/* Chart Area */}
      <div className="relative h-60 flex items-center justify-center pr-8">
        {/* Chart placeholder with grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Chart content area */}
          <div className="flex justify-between items-center h-full">
            {/* Chart content area */}
            <div className="flex-1 h-full relative">
              {/* Dotted grid lines extending to the right border */}
              <div className="absolute -left-4 right-6 top-0 bottom-0 flex flex-col justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border-t border-dotted border-gray-300 dark:border-gray-600 w-full"></div>
                ))}
              </div>

              {/* Mock chart lines - solid lines */}
              <svg className="absolute inset-0 w-[calc(100%-2rem)] h-full" viewBox="0 0 750 240">
                {/* 50+ bps decrease line (orange) - trending upward */}
                <path
                  d="M10,225 L80,215 L150,200 L220,185 L290,165 L360,145 L430,125 L500,105 L570,95 L640,88 L710,82 L750,78"
                  stroke="#f97316"
                  strokeWidth="2"
                  fill="none"
                />
                {/* 25 bps decrease line (blue) - stable to declining */}
                <path
                  d="M10,205 L80,200 L150,195 L220,190 L290,185 L360,180 L430,175 L500,170 L570,165 L640,162 L710,160 L750,157"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              {/* Y-axis percentage labels positioned in front of the dotted lines */}
              <div className="absolute right-[-0.5rem] top-0 h-full w-8">
                <div className="absolute top-0 right-0 flex items-center h-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">80%</span>
                </div>
                <div className="absolute top-1/4 right-0 flex items-center h-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">60%</span>
                </div>
                <div className="absolute top-1/2 right-0 flex items-center h-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">40%</span>
                </div>
                <div className="absolute top-3/4 right-0 flex items-center h-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">20%</span>
                </div>
                <div className="absolute bottom-0 right-0 flex items-center h-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="relative text-xs text-gray-500 dark:text-gray-400 mt-2 h-4">
            <span className="absolute left-0">May</span>
            <span className="absolute left-[20%]">Jun</span>
            <span className="absolute left-[40%]">Jul</span>
            <span className="absolute left-[60%]">Aug</span>
            <span className="absolute left-[80%]">Sep</span>
          </div>
        </div>
      </div>

      {/* Time period buttons */}
      <div className="flex items-center gap-2 mt-4">
        {timePeriods.map((period) => (
          <button
            key={period}
            onClick={() => handleTimePeriodChange(period)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              selectedTimePeriod === period
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};
