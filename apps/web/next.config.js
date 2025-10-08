/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pakomarket/sdk'],
  webpack: (config, { isServer }) => {
    // Fix for MetaMask SDK trying to import React Native packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'react-native-fs': false,
    };

    // Ignore React Native module resolution errors
    config.externals = [...(config.externals || [])];

    return config;
  },
};

module.exports = nextConfig;
