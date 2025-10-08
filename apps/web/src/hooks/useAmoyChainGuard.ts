/**
 * Amoy Chain Guard Hook
 * Validates user is on Polygon Amoy testnet (80002)
 */

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

export function useAmoyChainGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectChain = chainId === polygonAmoy.id;

  const switchToAmoy = () => {
    if (switchChain) {
      switchChain({ chainId: polygonAmoy.id });
    }
  };

  return {
    isConnected,
    isCorrectChain,
    switchToAmoy,
    requiredChainId: polygonAmoy.id,
  };
}
