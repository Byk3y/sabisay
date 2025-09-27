'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { localAnvil } from '@/lib/wagmi';
import { useState, useEffect } from 'react';

export function SwitchToLocal() {
  const { switchChain } = useSwitchChain();
  return (
    <button
      onClick={() => switchChain({ chainId: localAnvil.id })}
      className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-100 rounded text-xs font-medium transition-colors"
    >
      Switch to Local
    </button>
  );
}

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
      <button
        disabled
        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm font-medium transition-colors cursor-not-allowed text-gray-500 dark:text-gray-300"
      >
        Loading...
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        {chainId !== localAnvil.id && <SwitchToLocal />}
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
