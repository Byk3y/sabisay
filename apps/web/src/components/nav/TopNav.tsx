'use client';

import { Flag, Search, Menu, ChevronDown, LogOut, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSignUpModalContext } from '@/contexts/SignUpModalContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSidePanel } from '@/contexts/SidePanelContext';

// Generate unique gradient colors for each user
function generateUserGradient(userId: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate 3 colors using the hash as seed
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 120) % 360; // 120 degrees apart for good contrast
  const hue3 = (hue1 + 240) % 360; // 240 degrees apart
  
  // Use different saturation and lightness for variety
  const sat1 = 60 + (Math.abs(hash >> 8) % 40); // 60-100%
  const sat2 = 50 + (Math.abs(hash >> 16) % 30); // 50-80%
  const sat3 = 70 + (Math.abs(hash >> 24) % 30); // 70-100%
  
  const light1 = 45 + (Math.abs(hash >> 4) % 20); // 45-65%
  const light2 = 35 + (Math.abs(hash >> 12) % 25); // 35-60%
  const light3 = 55 + (Math.abs(hash >> 20) % 15); // 55-70%
  
  return `linear-gradient(135deg, 
    hsl(${hue1}, ${sat1}%, ${light1}%) 0%, 
    hsl(${hue2}, ${sat2}%, ${light2}%) 50%, 
    hsl(${hue3}, ${sat3}%, ${light3}%) 100%)`;
}

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, mounted } = useTheme();
  const { openModal: openSignUpModal } = useSignUpModalContext();
  const { user, logout, isLoading } = useAuth();
  const { openSidePanel } = useSidePanel();

  // Prevent hydration mismatch by only rendering conditional content on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    <header className="sticky top-0 z-[100] bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 md:px-0 h-14 flex items-center justify-between" suppressHydrationWarning>
        {/* Left side - Logo and Search (for all users) */}
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <div className="size-8 rounded bg-blue-500/20 dark:bg-blue-500/20 grid place-items-center" suppressHydrationWarning>
            <span className="text-blue-600 dark:text-white font-bold text-lg">
              S
            </span>
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-white">
            PakoMarket
          </span>
          <Flag className="size-4 text-gray-500 dark:text-gray-400" />

          {/* Search bar next to logo for all users */}
          <div className="hidden md:flex ml-4" suppressHydrationWarning>
            <div className="relative w-[600px]" suppressHydrationWarning>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search PakoMarket"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right side - Navigation */}
        <div className="flex items-center justify-end gap-3" suppressHydrationWarning>
          {!isClient ? (
            /* Loading state during hydration */
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
          ) : user ? (
            /* Signed-in user layout */
            <div className="flex items-center gap-2">
              {/* Portfolio */}
              <div className="hidden md:flex flex-col items-center mr-6">
                <span className="text-[10px] font-bold text-gray-300 dark:text-gray-400 uppercase tracking-wider -mb-1">Portfolio</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">$0.00</span>
              </div>

              {/* Cash */}
              <div className="hidden md:flex flex-col items-center mr-4">
                <span className="text-[10px] font-bold text-gray-300 dark:text-gray-400 uppercase tracking-wider -mb-1">Cash</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">$0.00</span>
              </div>

              {/* Deposit Button */}
              <button className="hidden md:block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Deposit
              </button>

              {/* Notification Bell */}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <Bell className="size-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Vertical Separator - Hidden on mobile */}
              <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

              {/* User Avatar with Dropdown */}
              <button 
                onClick={openSidePanel}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: user?.userId ? generateUserGradient(user.userId) : '#3B82F6'
                  }}
                >
                  <span className="text-white text-sm font-medium drop-shadow-sm">
                    {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <ChevronDown className="hidden md:block size-4 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          ) : isClient ? (
            /* Signed-out user layout */
            <>
              <button className="hidden md:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                How it works
              </button>

              {/* Auth buttons */}
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </div>
                  <button
                    onClick={() => {
                      console.log('Log In button clicked (loading state)!');
                      openSignUpModal('signin');
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      console.log('Sign Up button clicked (loading state)!');
                      openSignUpModal('signup');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      console.log('Log In button clicked (normal state)!');
                      openSignUpModal('signin');
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      console.log('Sign Up button clicked (normal state)!');
                      openSignUpModal('signup');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}

              <div className="hidden lg:block relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    console.log('Dropdown button clicked!', !isDropdownOpen);
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Menu className="size-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-[9999]">
                    <div className="p-2">
                      {/* Account Actions */}
                      <div className="space-y-1 mb-3">
                        <button
                          onClick={() => {
                            openSignUpModal('signup');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Sign Up
                        </button>
                        <button
                          onClick={() => {
                            openSignUpModal('signin');
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
                          <div
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                              theme === 'dark'
                                ? 'bg-blue-600'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                theme === 'dark'
                                  ? 'translate-x-4'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
