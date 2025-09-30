'use client';

import { Home, Search, TrendingUp, Menu, BarChart3 } from 'lucide-react';
import { useSidePanel } from '@/contexts/SidePanelContext';

interface User {
  userId: string;
  email: string;
  username: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

interface BottomNavProps {
  activeTab?: 'home' | 'search' | 'breaking' | 'more';
  onTabChange?: (tab: 'home' | 'search' | 'breaking' | 'more') => void;
  user?: User | null;
}

export function BottomNav({
  activeTab = 'home',
  onTabChange,
  user,
}: BottomNavProps) {
  const { openSidePanel } = useSidePanel();

  const tabs = user
    ? [
        { id: 'home' as const, label: 'Home', Icon: Home },
        { id: 'search' as const, label: 'Search', Icon: Search },
        { id: 'breaking' as const, label: 'Breaking', Icon: TrendingUp },
      ]
    : [
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
            onClick={() => {
              if (id === 'more') {
                openSidePanel();
              } else {
                onTabChange?.(id);
              }
            }}
            data-active={activeTab === id}
            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 data-[active=true]:text-blue-600 dark:data-[active=true]:text-blue-400 data-[active=true]:shadow-lg data-[active=true]:shadow-blue-600/20 transition-colors py-2"
          >
            <Icon className="size-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}

        {/* Portfolio balance for signed-in users */}
        {user && (
          <div className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 py-2">
            <div className="size-5 flex items-center justify-center">
              <BarChart3 className="size-5" />
            </div>
            <span className="text-xs font-medium">$0.00</span>
          </div>
        )}
      </div>
    </nav>
  );
}
