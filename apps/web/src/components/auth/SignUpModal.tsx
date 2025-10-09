'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useConnect, useSwitchChain } from 'wagmi';
import { injected, walletConnect, coinbaseWallet, metaMask } from 'wagmi/connectors';
import { polygonAmoy } from 'wagmi/chains';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { createMagicClientWithOAuth, createMagicClient } from '@/lib/magic';
import { clientEnv } from '@/lib/env.client';
import { WalletBrandIcon } from './WalletBrandIcon';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signup' | 'signin';
}

export function SignUpModal({
  isOpen,
  onClose,
  mode = 'signup',
}: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const { theme } = useTheme();
  const { login, refreshAuth, user } = useAuth();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();

  // Auto-close modal when user is successfully authenticated
  useEffect(() => {
    if (user?.isLoggedIn && isOpen) {
      onClose();
    }
  }, [user?.isLoggedIn, isOpen, onClose]);

  // Reset loading states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsGoogleLoading(false);
      setIsEmailLoading(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Clear error when modal opens
  if (isOpen && error) {
    setError(null);
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);

      // Check if Magic key is available
      if (!clientEnv.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) {
        throw new Error('Magic publishable key is not configured');
      }

      // Initialize Magic client with OAuth2 extension
      const magic = createMagicClientWithOAuth();

      // Start Google OAuth flow with redirect instead of popup
      await (magic.oauth2 as any)?.loginWithRedirect({
        provider: 'google',
        redirectURI: `${window.location.origin}/auth/callback`,
      });

      // The user will be redirected to Google, then back to /auth/callback
      // No need to handle the response here as the callback page will handle it
    } catch (error) {
      console.error('Google sign up error:', error);
      setError('Google sign up failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email) return;

    try {
      setIsEmailLoading(true);

      // Initialize Magic client
      const magic = createMagicClient();

      // Login with email OTP using redirect instead of popup
      await magic.auth.loginWithEmailOTP({ 
        email,
        redirectTo: `${window.location.origin}/auth/callback`
      });

      // The user will be redirected to /auth/callback after email verification
      // No need to handle the response here as the callback page will handle it
    } catch (error) {
      console.error('Email sign up error:', error);
      setError('Email sign up failed. Please try again.');
      setIsEmailLoading(false);
    }
  };

  const handleWalletConnect = async (walletType: string) => {
    try {
      let connector;

      switch (walletType) {
        case 'metamask':
          // Use MetaMask connector (triggers extension directly)
          connector = metaMask();
          break;
        case 'walletconnect':
          // WalletConnect with QR modal
          connector = walletConnect({
            projectId: clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            showQrModal: true,
          });
          break;
        case 'coinbase':
          // Coinbase Wallet
          connector = coinbaseWallet({ appName: 'PakoMarket' });
          break;
        case 'trust':
          // Trust Wallet uses injected
          connector = injected();
          break;
        default:
          throw new Error('Unsupported wallet type');
      }

      // Connect wallet
      await connect({ connector });

      // Switch to Polygon Amoy after connection (non-blocking)
      if (switchChain) {
        try {
          await switchChain({ chainId: polygonAmoy.id });
        } catch (switchError) {
          // User rejected chain switch - connection is still valid
          console.warn('Chain switch rejected:', switchError);
        }
      }

      // Close sign-up modal
      onClose();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      // Only show error if connection actually failed
      if (error instanceof Error && !error.message.includes('User rejected')) {
        setError('Failed to connect wallet. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] md:flex md:items-center md:justify-center md:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full h-full md:h-auto md:rounded-2xl md:max-w-md md:shadow-2xl md:border md:border-gray-200 dark:md:border-gray-700 flex flex-col md:block">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 md:left-auto md:right-4 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mobile Content - Centered */}
        <div className="flex-1 flex flex-col justify-center md:hidden pt-20">
          {/* Logo and Title - Mobile only */}
          <div className="text-center pb-4 px-8">
            {/* PakoMarket logo */}
            <div className="mx-auto mb-3">
              {!logoFailed ? (
                <Image
                  src="/images/pakomarket/pakomarket-logo.png"
                  alt="PakoMarket"
                  width={256}
                  height={256}
                  className="h-56 w-auto dark:invert"
                  onError={() => setLogoFailed(true)}
                  priority
                />
              ) : (
                <span className="text-blue-600 font-bold text-5xl">P</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'signup' ? 'Welcome to PakoMarket' : 'Welcome Back'}
            </h2>
          </div>

          {/* Google Sign Up */}
          <div className="px-8 mb-6">
            <button
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:opacity-70 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-8 mb-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* OR Separator */}
          <div className="relative mb-6 px-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* Email Input */}
          <div className="px-8 mb-6">
            <div className="flex">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleEmailSignUp}
                disabled={!email || isEmailLoading}
                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:opacity-50 text-gray-900 dark:text-white font-medium px-4 py-3 border border-gray-300 dark:border-gray-700 border-l-0 rounded-r-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isEmailLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>

          {/* Wallet Connection Options */}
          <div className="px-8 mb-6">
            <div className="grid grid-cols-4 gap-3">
              {/* MetaMask */}
              <button
                onClick={() => handleWalletConnect('metamask')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="metamask" className="w-8 h-8" />
              </button>

              {/* WalletConnect */}
              <button
                onClick={() => handleWalletConnect('walletconnect')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="walletconnect" className="w-8 h-8" />
              </button>

              {/* Trust Wallet */}
              <button
                onClick={() => handleWalletConnect('trust')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="phantom" className="w-8 h-8" />
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleWalletConnect('coinbase')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="coinbase" className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center pb-8 px-8">
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors"
            >
              Terms · Privacy
            </a>
          </div>
        </div>

        {/* Desktop Title - No logo */}
        <div className="hidden md:block text-center pt-8 pb-6 px-8">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            {mode === 'signup' ? 'Welcome to PakoMarket' : 'Welcome Back'}
          </h2>
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block">
          {/* Google Sign Up */}
          <div className="px-8 mb-6">
            <button
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:opacity-70 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-8 mb-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* OR Separator */}
          <div className="relative mb-6 px-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* Email Input */}
          <div className="px-8 mb-6">
            <div className="flex">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleEmailSignUp}
                disabled={!email || isEmailLoading}
                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:opacity-50 text-gray-900 dark:text-white font-medium px-4 py-3 border border-gray-300 dark:border-gray-700 border-l-0 rounded-r-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isEmailLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>

          {/* Wallet Connection Options */}
          <div className="px-8 mb-6">
            <div className="grid grid-cols-4 gap-3">
              {/* MetaMask */}
              <button
                onClick={() => handleWalletConnect('metamask')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="metamask" className="w-8 h-8" />
              </button>

              {/* WalletConnect */}
              <button
                onClick={() => handleWalletConnect('walletconnect')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="walletconnect" className="w-8 h-8" />
              </button>

              {/* Trust Wallet */}
              <button
                onClick={() => handleWalletConnect('trust')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="phantom" className="w-8 h-8" />
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleWalletConnect('coinbase')}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="coinbase" className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center pb-8 px-8">
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm transition-colors"
            >
              Terms · Privacy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
