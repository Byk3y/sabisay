'use client';

import {
  Search,
  Menu,
  ChevronDown,
  Bell,
  LogOut,
  User,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSignUpModalContext } from '@/contexts/SignUpModalContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSidePanel } from '@/contexts/SidePanelContext';
import { generateAddressGradient, truncateAddress } from '@/lib/utils';

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { openModal: openSignUpModal } = useSignUpModalContext();
  const { user, isLoading } = useAuth();
  const { openSidePanel } = useSidePanel();
  const { logout } = useAuth();

  // Prevent hydration mismatch by only rendering conditional content on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
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
    <header
      className="sticky top-0 z-[100] bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur"
      suppressHydrationWarning
    >
      <div
        className="mx-auto max-w-7xl h-14 flex items-center justify-between"
        suppressHydrationWarning
      >
        {/* Left side - Logo and Search (for all users) */}
        <div className="flex items-center pl-0 md:pl-0" suppressHydrationWarning>
          <img
            src="/images/pakomarket/pakomarket-logo.png"
            alt="PakoMarket"
            className="h-48 w-auto dark:invert -ml-1 md:-ml-5"
            onError={(e) => {
              // Fallback to "P" if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-blue-600 dark:text-white font-bold text-4xl">P</span>';
              }
            }}
          />
          <img 
            src="/images/nigerian-flag.svg" 
            alt="Nigeria" 
            className="w-6 h-4 -ml-2"
          />

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
        <div
          className="flex items-center justify-end gap-3 pr-4 md:pr-0"
          suppressHydrationWarning
        >
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
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider -mb-1">
                  Portfolio
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  $0.00
                </span>
              </div>

              {/* Cash */}
              <div className="hidden md:flex flex-col items-center mr-4">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider -mb-1">
                  Cash
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  $0.00
                </span>
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
              <div
                className="relative"
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  setIsHovering(true);
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setIsHovering(false);
                  }, 150);
                }}
              >
                <button
                  onClick={openSidePanel}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: user?.username
                        ? generateAddressGradient(user.username)
                        : '#3B82F6',
                    }}
                  />
                  <ChevronDown
                    className={`hidden md:block size-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                      isHovering ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Desktop Dropdown Menu - Signed In User */}
                {isHovering && user && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      hoverTimeoutRef.current = setTimeout(() => {
                        setIsHovering(false);
                      }, 150);
                    }}
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: user?.username
                              ? generateAddressGradient(user.username)
                              : '#3B82F6',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.username
                              ? truncateAddress(user.username, 10, 4)
                              : 'Connecting...'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.username
                              ? truncateAddress(user.username, 4, 4)
                              : 'Loading...'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="px-4 py-2">
                      <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                        Profile
                      </button>
                      <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                        Elections
                      </button>
                      <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                        Sports
                      </button>
                      <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                        Rewards
                      </button>
                      {user?.isAdmin && (
                        <a
                          href="/admin"
                          className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-2 block"
                        >
                          Admin
                        </a>
                      )}
                      <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                        Documentation
                      </button>
                      <button className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        Terms of Use
                      </button>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* Dark Mode Toggle Section */}
                    <div className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Dark mode
                        </span>
                        <button
                          onClick={() => {
                            toggleTheme();
                            setIsHovering(false);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out ${
                            theme === 'dark'
                              ? 'bg-blue-500/30 backdrop-blur-md border border-blue-400/30'
                              : 'bg-gray-200/30 backdrop-blur-md border border-gray-300/30'
                          }`}
                          style={{
                            background:
                              theme === 'dark'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(156, 163, 175, 0.2)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border:
                              theme === 'dark'
                                ? '1px solid rgba(59, 130, 246, 0.3)'
                                : '1px solid rgba(156, 163, 175, 0.3)',
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ease-in-out ${
                              theme === 'dark'
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            }`}
                            style={{
                              background:
                                theme === 'dark'
                                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))'
                                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              boxShadow:
                                theme === 'dark'
                                  ? '0 2px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                  : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        logout();
                        setIsHovering(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
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
