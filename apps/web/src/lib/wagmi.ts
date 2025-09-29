import { createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { env } from './env';

const rpcUrl = env.NEXT_PUBLIC_RPC_URL;

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [metaMask(), injected()],
  transports: { [polygonAmoy.id]: http(rpcUrl) },
}) as any; // Type assertion to avoid MetaMask SDK type issues

// Export chain for easy access
export { polygonAmoy as localChain };
