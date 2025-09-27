"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useConnect } from "wagmi";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { useTheme } from "@/contexts/ThemeContext";
import { WalletBrandIcon } from "./WalletBrandIcon";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "signup" | "signin";
}

export function SignUpModal({ isOpen, onClose, mode = "signup" }: SignUpModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const { connect } = useConnect();

  if (!isOpen) return null;

  const handleGoogleSignUp = () => {
    // TODO: Implement Google OAuth
    console.log("Google sign up clicked");
  };

  const handleEmailSignUp = () => {
    if (!email) return;
    setIsLoading(true);
    // TODO: Implement email sign up
    console.log("Email sign up:", email);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleWalletConnect = (walletType: string) => {
    try {
      switch (walletType) {
        case "metamask":
          connect({ connector: metaMask() });
          break;
        case "walletconnect":
          connect({ connector: walletConnect({ projectId: "your-project-id" }) });
          break;
        case "coinbase":
          connect({ connector: coinbaseWallet() });
          break;
        case "phantom":
          // Phantom is Solana-specific, would need different connector
          console.log("Phantom wallet connection not implemented for Ethereum");
          break;
        default:
          console.log("Unknown wallet type:", walletType);
      }
      // Close modal after successful connection
      onClose();
    } catch (error) {
      console.error("Wallet connection failed:", error);
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
            {/* Logo placeholder - you can add your PakoMarket logo here */}
            <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === "signup" ? "Welcome to PakoMarket" : "Welcome Back"}
            </h2>
          </div>

          {/* Google Sign Up */}
          <div className="px-8 mb-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
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
              Continue with Google
            </button>
          </div>

          {/* OR Separator */}
          <div className="relative mb-6 px-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">OR</span>
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleEmailSignUp}
                disabled={!email || isLoading}
                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:opacity-50 text-gray-900 dark:text-white font-medium px-4 py-3 border border-gray-300 dark:border-gray-700 border-l-0 rounded-r-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>

          {/* Wallet Connection Options */}
          <div className="px-8 mb-6">
            <div className="grid grid-cols-4 gap-3">
              {/* MetaMask */}
              <button
                onClick={() => handleWalletConnect("metamask")}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="metamask" className="w-8 h-8" />
              </button>

              {/* WalletConnect */}
              <button
                onClick={() => handleWalletConnect("walletconnect")}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="walletconnect" className="w-8 h-8" />
              </button>

              {/* Phantom */}
              <button
                onClick={() => handleWalletConnect("phantom")}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="phantom" className="w-8 h-8" />
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleWalletConnect("coinbase")}
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
            {mode === "signup" ? "Welcome to PakoMarket" : "Welcome Back"}
          </h2>
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block">
          {/* Google Sign Up */}
          <div className="px-8 mb-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
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
              Continue with Google
            </button>
          </div>

          {/* OR Separator */}
          <div className="relative mb-6 px-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">OR</span>
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleEmailSignUp}
                disabled={!email || isLoading}
                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:opacity-50 text-gray-900 dark:text-white font-medium px-4 py-3 border border-gray-300 dark:border-gray-700 border-l-0 rounded-r-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>

          {/* Wallet Connection Options */}
          <div className="px-8 mb-6">
            <div className="grid grid-cols-4 gap-3">
              {/* MetaMask */}
              <button
                onClick={() => handleWalletConnect("metamask")}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="metamask" className="w-8 h-8" />
              </button>

              {/* WalletConnect */}
              <button
                onClick={() => handleWalletConnect("walletconnect")}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="walletconnect" className="w-8 h-8" />
              </button>

              {/* Phantom */}
              <button
                onClick={() => handleWalletConnect("phantom")}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              >
                <WalletBrandIcon name="phantom" className="w-8 h-8" />
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleWalletConnect("coinbase")}
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
