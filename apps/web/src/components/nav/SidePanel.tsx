"use client";

import { Home, Search, TrendingUp, Settings, HelpCircle, LogOut, User, Bell, Shield, ChevronDown, Sun, Moon } from "lucide-react";
import { FaTwitter, FaDiscord, FaInstagram, FaTiktok } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import { useSignUpModalContext } from "@/contexts/SignUpModalContext";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidePanel({ isOpen, onClose }: SidePanelProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { openModal: openSignUpModal } = useSignUpModalContext();
  
  const navigationItems = [
    { label: "Elections", icon: Home },
    { label: "Dashboards", icon: Search },
    { label: "Leaderboard", icon: TrendingUp },
    { label: "Activity", icon: Bell },
    { label: "Resources", icon: HelpCircle, hasDropdown: true },
    { label: "Rewards", icon: Shield, hasDropdown: true },
  ];

  const socialIcons = [
    { name: "Twitter", icon: FaTwitter },
    { name: "Discord", icon: FaDiscord },
    { name: "Instagram", icon: FaInstagram },
    { name: "TikTok", icon: FaTiktok },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Side Panel */}
      <div className={`fixed top-0 left-0 h-full w-5/6 max-w-xl bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header - No close button, swipe to close */}
          <div className="pb-4 px-4">
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-2 text-left text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <span className="font-medium text-lg">{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="size-4 text-gray-500 dark:text-gray-500" />
                  )}
                </button>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="mt-8">
              <div className="flex items-center gap-5">
                {socialIcons.map((social) => (
                <button
                  key={social.name}
                  className="size-14 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 grid place-items-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="text-gray-700 dark:text-gray-300 text-2xl" />
                </button>
                ))}
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="size-14 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 grid place-items-center transition-colors"
                  aria-label="Toggle theme"
                >
                  {mounted && (theme === 'light' ? (
                    <Moon className="text-gray-700 dark:text-gray-300 text-2xl" />
                  ) : (
                    <Sun className="text-gray-700 dark:text-gray-300 text-2xl" />
                  ))}
                </button>
              </div>
            </div>

            {/* Login and Sign Up */}
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => {
                  openSignUpModal("signin");
                  onClose();
                }}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => {
                  openSignUpModal("signup");
                  onClose();
                }}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
