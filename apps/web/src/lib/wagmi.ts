import { createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { clientEnv } from './env.client';

const rpcUrl = clientEnv.NEXT_PUBLIC_RPC_URL;
const walletConnectProjectId = clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Wagmi configuration with all supported wallets
export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    metaMask(), // Simple MetaMask connector - matches Polymarket's approach
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true, // Show QR modal for WalletConnect
    }),
    coinbaseWallet({
      appName: 'PakoMarket',
    }),
    injected(), // Generic injected (Trust Wallet, etc.)
  ],
  transports: { [polygonAmoy.id]: http(rpcUrl) },
}) as any;

// Export chain for easy access
export { polygonAmoy as localChain };
