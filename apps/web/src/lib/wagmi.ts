import { createConfig, http } from 'wagmi';
import { localhost } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { env } from './env';

const rpcUrl = env.NEXT_PUBLIC_RPC_URL;

// Custom localhost chain configuration
export const localAnvil = {
  ...localhost,
  id: 31337,
  name: 'Localhost 8545',
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
} as const;

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [localAnvil],
  connectors: [metaMask(), injected()],
  transports: { [localAnvil.id]: http(rpcUrl) }, // <-- pass URL here
}) as any; // Type assertion to avoid MetaMask SDK type issues

// Export chain for easy access
export { localAnvil as localChain };
