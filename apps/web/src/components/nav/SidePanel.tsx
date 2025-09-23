"use client";

import { Home, Search, TrendingUp, Settings, HelpCircle, LogOut, User, Bell, Shield, ChevronDown } from "lucide-react";
import { FaTwitter, FaDiscord, FaInstagram, FaTiktok, FaSun } from "react-icons/fa";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidePanel({ isOpen, onClose }: SidePanelProps) {
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
    { name: "Theme", icon: FaSun },
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
      <div className={`fixed top-0 left-0 h-full w-5/6 max-w-xl bg-finance-card z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
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
                  className="w-full flex items-center justify-between p-2 text-left text-finance-text-secondary hover:text-finance-text-primary hover:bg-finance-border rounded-md transition-colors"
                >
                  <span className="font-medium text-lg">{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="size-4 text-finance-text-disabled" />
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
                  className="size-14 rounded-md bg-finance-border hover:bg-finance-border-hover grid place-items-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="text-finance-text-primary text-2xl" />
                </button>
                ))}
              </div>
            </div>

            {/* Login and Sign Up */}
            <div className="mt-6 space-y-3">
              <button className="w-full py-2 px-4 bg-finance-border hover:bg-finance-border-hover text-finance-text-primary font-medium rounded-md transition-colors">
                Log in
              </button>
              <button className="w-full py-2 px-4 bg-finance-accent hover:bg-finance-accent-hover text-finance-text-primary font-medium rounded-md transition-colors">
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
