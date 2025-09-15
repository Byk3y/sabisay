/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sabisay/sdk'],
  env: {
    NEXT_PUBLIC_CHAIN_ID: '80002', // Polygon Amoy testnet
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology',
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
    NEXT_PUBLIC_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '',
  },
};

module.exports = nextConfig;
