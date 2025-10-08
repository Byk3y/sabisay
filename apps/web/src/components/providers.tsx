'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { useState, useMemo } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChainWarningBanner } from '@/components/wallet/ChainWarningBanner';

// Create a minimal SSR-safe config without connectors
const ssrConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [],
  transports: { [polygonAmoy.id]: http() },
}) as any;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Lazy-load wagmi config only on client side to avoid SSR issues with WalletConnect
  const wagmiConfig = useMemo(() => {
    if (typeof window === 'undefined') return ssrConfig;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/lib/wagmi').wagmiConfig;
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {typeof window !== 'undefined' && <ChainWarningBanner />}
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
