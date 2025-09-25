import React from 'react';
import { formatCurrency, formatCents } from '@/lib/tradeFormat';

export interface Outcome {
  name: string;
  probability: number;
  volume: number;
  price: {
    yes: number;
    no: number;
  };
}

export interface OutcomeRowProps {
  outcome: Outcome;
  index: number;
  isSelected: boolean;
  selectedCandidate: number;
  onSelect: (candidate: number, outcomeIndex: number) => void;
}

export function OutcomeRow({ 
  outcome, 
  index, 
  isSelected, 
  selectedCandidate, 
  onSelect 
}: OutcomeRowProps) {
  return (
    <div className="flex items-center h-[54px] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {formatCurrency(outcome.volume)} Vol. 📊
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
          onClick={() => onSelect(0, index)}
          className={`py-3.5 rounded text-xs font-medium transition-colors w-[100px] text-center ${
            selectedCandidate === 0 && isSelected
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30 border border-green-200 dark:border-green-700"
          }`}
        >
          Buy Yes {formatCents(outcome.price.yes)}
        </button>
        <button
          onClick={() => onSelect(1, index)}
          className={`py-3.5 rounded text-xs font-medium transition-colors w-[100px] text-center ${
            selectedCandidate === 1 && isSelected
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30 border border-red-200 dark:border-red-700"
          }`}
        >
          Buy No {formatCents(outcome.price.no)}
        </button>
      </div>
    </div>
  );
}
