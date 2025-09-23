"use client";

import { Flag, Search, Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-40 bg-finance-nav/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 md:px-4 h-14 flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-finance-accent/20 grid place-items-center">
            <span className="text-finance-text-primary font-bold text-lg">S</span>
          </div>
          <span className="font-semibold text-lg text-finance-text-primary">SabiSay</span>
          <Flag className="size-4 text-finance-text-secondary" />
        </div>

                    {/* Center - Search bar (hidden on mobile) */}
                    <div className="hidden md:flex flex-1 max-w-xl ml-2 mr-8">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-finance-text-disabled" />
                        <input
                          type="text"
                          placeholder="Search SabiSay"
                          className="w-full bg-finance-card border border-finance-border rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-finance-text-disabled focus:outline-none focus:border-finance-accent text-finance-text-primary"
                        />
                      </div>
                    </div>

        {/* Right side - Navigation */}
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-sm text-finance-text-secondary hover:text-finance-text-primary">How it works</button>
          <button className="text-sm text-finance-accent hover:text-finance-accent-hover">Log In</button>
          <button className="rounded-md bg-finance-accent px-4 py-2 text-sm font-medium hover:bg-finance-accent-hover text-finance-text-primary">Sign Up</button>
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-finance-card rounded-md"
            >
              <Menu className="size-5 text-finance-text-secondary" />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-finance-card border border-finance-border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {/* Account Actions */}
                  <div className="space-y-1 mb-3">
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Sign Up
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Log In
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-finance-border mb-3"></div>
                  
                  {/* Navigation Items */}
                  <div className="space-y-1 mb-3">
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Elections
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Sports
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Rewards
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Documentation
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      Terms of Use
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-finance-border mb-3"></div>
                  
                  {/* Settings */}
                  <div className="space-y-1">
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-finance-text-secondary hover:bg-finance-border rounded-md">
                      <span>Dark mode</span>
                      <div className="w-8 h-4 bg-finance-accent rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-finance-text-primary rounded-full"></div>
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
