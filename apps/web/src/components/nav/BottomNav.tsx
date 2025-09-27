'use client';

import { Home, Search, TrendingUp, Menu } from 'lucide-react';

interface BottomNavProps {
  activeTab?: 'home' | 'search' | 'breaking' | 'more';
  onTabChange?: (tab: 'home' | 'search' | 'breaking' | 'more') => void;
}

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', Icon: Home },
    { id: 'search' as const, label: 'Search', Icon: Search },
    { id: 'breaking' as const, label: 'Breaking', Icon: TrendingUp },
    { id: 'more' as const, label: 'More', Icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur">
      <div className="mx-auto max-w-[680px] px-4 h-16 grid grid-cols-4 items-center text-xs">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange?.(id)}
            data-active={activeTab === id}
            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400 data-[active=true]:shadow-lg data-[active=true]:shadow-blue-600/20 transition-colors py-2"
          >
            <Icon className="size-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
