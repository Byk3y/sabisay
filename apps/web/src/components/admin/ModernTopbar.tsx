'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Menu,
  User,
  LogOut,
  Bell,
  Search,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { ModernSearchInput } from '@/components/ui/ModernInput';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] !== 'admin') return [];

  const breadcrumbs: Breadcrumb[] = [{ label: 'Admin', href: '/admin' }];

  if (segments[1] === 'dashboard') {
    breadcrumbs.push({ label: 'Dashboard' });
  } else if (segments[1] === 'events') {
    breadcrumbs.push({ label: 'Events', href: '/admin/events' });

    if (segments[2] === 'new') {
      breadcrumbs.push({ label: 'Create Event' });
    } else if (segments[2]) {
      breadcrumbs.push({ label: 'Edit Event' });
    }
  } else if (segments[1] === 'analytics') {
    breadcrumbs.push({ label: 'Analytics' });
  } else if (segments[1] === 'settings') {
    breadcrumbs.push({ label: 'Settings' });
  }

  return breadcrumbs;
}

interface ModernTopbarProps {
  onMobileMenuToggle?: () => void;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export function ModernTopbar({
  onMobileMenuToggle,
  actions,
  showSearch = true,
  onSearch,
  searchPlaceholder = 'Search events, users, transactions...',
}: ModernTopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = getBreadcrumbs(pathname || '');

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <header className="h-14 bg-sabi-card dark:bg-sabi-card-dark border-b border-sabi-border dark:border-sabi-border-dark flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:block">
          <ol className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-sabi-text-muted dark:text-sabi-text-muted-dark" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-sabi-text-primary dark:text-sabi-text-primary-dark font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Center: Search */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <ModernSearchInput
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onClear={handleSearchClear}
            placeholder={searchPlaceholder}
            className="w-full"
          />
        </div>
      )}

      {/* Right: Actions + Theme Toggle + Notifications + User Menu */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors">
          <Bell className="w-5 h-5 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-admin-error-500 text-xs text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-admin-primary-500 to-admin-primary-600 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            {user?.email && (
              <span className="hidden sm:block text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark max-w-32 truncate">
                {user.email}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-xl shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-sabi-border dark:border-sabi-border-dark">
                <p className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {user?.email}
                </p>
                <p className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  Administrator
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
