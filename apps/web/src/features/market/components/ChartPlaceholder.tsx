import React from 'react';

export interface ChartPlaceholderProps {
  className?: string;
  outcomes?: Array<{
    name: string;
    probability: number;
  }>;
}

export function ChartPlaceholder({ className = "", outcomes = [] }: ChartPlaceholderProps) {
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-yellow-500', 'bg-gray-500'];
  
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Probability Over Time
        </h2>
        <div className="flex gap-2">
          {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 ${colors[index % colors.length]} rounded-full`}></div>
            <span className="text-gray-900 dark:text-white font-medium">
              {outcome.name} {outcome.probability}%
            </span>
          </div>
        ))}
      </div>
      
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">
          Chart will be implemented here
        </span>
      </div>
    </div>
  );
}
