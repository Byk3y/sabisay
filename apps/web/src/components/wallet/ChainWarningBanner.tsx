/**
 * Chain Warning Banner
 * Shows warning when user is connected to wrong network
 */

'use client';

import { AlertTriangle } from 'lucide-react';
import { useAmoyChainGuard } from '@/hooks/useAmoyChainGuard';

export function ChainWarningBanner() {
  const { isConnected, isCorrectChain, switchToAmoy } = useAmoyChainGuard();

  // Don't show banner if not connected or already on correct chain
  if (!isConnected || isCorrectChain) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Wrong network detected. Please switch to{' '}
              <span className="font-semibold">Polygon Amoy Testnet</span> to
              interact with markets.
            </p>
          </div>
          <button
            onClick={switchToAmoy}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Switch Network
          </button>
        </div>
      </div>
    </div>
  );
}
