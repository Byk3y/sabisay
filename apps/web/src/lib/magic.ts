/**
 * Magic Link Configuration
 * Centralized configuration for Magic Link with dedicated wallet support
 */

import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth2';
import { env } from './env';

// Polygon network configuration
const POLYGON_NETWORK = {
  rpcUrl: env.NEXT_PUBLIC_RPC_URL,
  chainId: parseInt(env.NEXT_PUBLIC_CHAIN_ID),
};

/**
 * Create Magic instance with dedicated wallet enabled for Polygon network
 * @param extensions - Additional Magic extensions (e.g., OAuth2)
 * @returns Configured Magic instance
 */
export function createMagicClient(extensions: any[] = []): Magic {
  // Use process.env directly since it's working correctly
  const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;

  if (!apiKey) {
    throw new Error(
      'Magic API key is not configured. Please check your environment variables.'
    );
  }

  return new Magic(apiKey, {
    network: POLYGON_NETWORK,
    extensions,
  });
}

/**
 * Create Magic instance with OAuth2 extension for Google login
 * @returns Configured Magic instance with OAuth2
 */
export function createMagicClientWithOAuth(): Magic {
  return createMagicClient([new OAuthExtension()]);
}

/**
 * Get user's wallet address from Magic
 * @param magic - Magic instance
 * @returns Promise<string> - User's wallet address
 */
export async function getUserWalletAddress(magic: Magic): Promise<string> {
  try {
    // Get user info which includes the public address
    const userInfo = await magic.user.getInfo();
    const publicAddress = userInfo.publicAddress;
    if (!publicAddress) {
      throw new Error('No public address found');
    }
    return publicAddress;
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    throw new Error('Unable to retrieve wallet address');
  }
}

/**
 * Get user metadata including wallet address
 * @param magic - Magic instance
 * @returns Promise<object> - User metadata with wallet address
 */
export async function getUserMetadata(magic: Magic) {
  try {
    const userInfo = await magic.user.getInfo();
    const walletAddress = await getUserWalletAddress(magic);

    return {
      ...userInfo,
      publicAddress: walletAddress,
    };
  } catch (error) {
    console.error('Failed to get user metadata:', error);
    throw new Error('Unable to retrieve user metadata');
  }
}
