'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { polygonAmoy } from 'wagmi/chains';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isHydrated, setIsHydrated] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading state during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse">
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-500 rounded" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-600 dark:hover:bg-red-700 text-red-700 dark:text-red-100 rounded text-xs font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
}
