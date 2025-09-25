"use client";

import { Flag, Search, Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { useSignUpModalContext } from "@/contexts/SignUpModalContext";
import { useTheme } from "@/contexts/ThemeContext";

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, mounted } = useTheme();
  const { openModal: openSignUpModal } = useSignUpModalContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-0 h-14 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-blue-500/20 dark:bg-blue-500/20 grid place-items-center">
            <span className="text-blue-600 dark:text-white font-bold text-lg">S</span>
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-white">SabiSay</span>
          <Flag className="size-4 text-gray-500 dark:text-gray-400" />
        </div>

                    {/* Center - Search bar (hidden on mobile) */}
                    <div className="hidden md:flex flex-1 max-w-xl ml-2 mr-8">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search SabiSay"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

        {/* Right side - Navigation */}
        <div className="flex items-center gap-4">
          <button className="hidden md:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">How it works</button>
          <WalletConnect />
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <Menu className="size-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  {/* Account Actions */}
                  <div className="space-y-1 mb-3">
                    <button 
                      onClick={() => {
                        openSignUpModal("signup");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Sign Up
                    </button>
                    <button 
                      onClick={() => {
                        openSignUpModal("signin");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-300 dark:border-gray-600 mb-3"></div>
                  
                  {/* Navigation Items */}
                  <div className="space-y-1 mb-3">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      Elections
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      Sports
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      Rewards
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      Documentation
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      Terms of Use
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-300 dark:border-gray-600 mb-3"></div>
                  
                  {/* Settings */}
                  <div className="space-y-1">
                    <button 
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <span>Dark mode</span>
                      <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
