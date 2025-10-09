'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import {
  Home,
  LayoutDashboard,
  LayoutList,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: LayoutList,
    badge: '23', // Example: pending events
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface ModernSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileMenuClose?: () => void;
}

export function ModernSidebar({
  collapsed = true, // Changed default to true
  onToggleCollapse,
  onMobileMenuClose,
}: ModernSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    if (href === '/admin/events') {
      return pathname?.startsWith('/admin/events') || pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const handleNavClick = () => {
    // Close mobile menu when navigation item is clicked
    onMobileMenuClose?.();
  };

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 h-full bg-sabi-nav dark:bg-sabi-nav-dark border-r border-sabi-border dark:border-sabi-border-dark transition-all duration-200 z-50 flex flex-col group',
        collapsed ? 'w-16 hover:w-64' : 'w-64'
      )}
      aria-label="Admin navigation"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sabi-border dark:border-sabi-border-dark">
        {/* Logo and Brand - Show on hover when collapsed */}
        <div
          className={cn(
            'flex items-center justify-center transition-all duration-200',
            collapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          )}
        >
          <ImageWithFallback
            src="/images/pakomarket/pakomarket-logo.png"
            alt="PakoMarket"
            width={256}
            height={256}
            className="h-48 w-auto dark:invert"
            fallbackElement={
              <div className="size-20 rounded-lg bg-gradient-to-br from-admin-primary-500 to-admin-primary-600 grid place-items-center shadow-sm">
                <span className="text-white font-bold text-4xl">P</span>
              </div>
            }
          />
        </div>

        {/* Toggle Button - Always visible */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-sabi-card dark:hover:bg-sabi-card-dark transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group',
                active
                  ? 'bg-admin-primary-50 text-admin-primary-700 dark:bg-admin-primary-900/20 dark:text-admin-primary-400 shadow-sm'
                  : 'text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:bg-sabi-card dark:hover:bg-sabi-card-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  active
                    ? 'text-admin-primary-600 dark:text-admin-primary-400'
                    : ''
                )}
              />
              {/* Label and Badge - Show on hover when collapsed */}
              <div
                className={cn(
                  'flex items-center gap-2 transition-all duration-200',
                  collapsed
                    ? 'opacity-0 group-hover:opacity-100'
                    : 'opacity-100'
                )}
              >
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-admin-primary-100 text-admin-primary-700 dark:bg-admin-primary-900/30 dark:text-admin-primary-400">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Create Event Button */}
        <Link
          href="/admin/events/new"
          onClick={handleNavClick}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group',
            // When collapsed: look like regular nav item
            collapsed
              ? 'text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:bg-sabi-card dark:hover:bg-sabi-card-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark'
              : // When expanded: prominent blue button
                'bg-admin-primary-500 hover:bg-admin-primary-600 text-white shadow-sm hover:shadow-md'
          )}
        >
          <Plus className="w-5 h-5 flex-shrink-0 transition-colors" />
          {/* Create Event Text - Show on hover when collapsed */}
          <div
            className={cn(
              'flex items-center gap-2 transition-all duration-200',
              collapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            )}
          >
            <span className="font-medium">Create Event</span>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sabi-border dark:border-sabi-border-dark">
        <div
          className={cn(
            'space-y-2 transition-all duration-200',
            collapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          )}
        >
          <button
            onClick={handleNavClick}
            className="flex items-center gap-2 text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
          >
            <Bell className="w-3 h-3" />
            <span>Notifications</span>
          </button>
          <button
            onClick={handleNavClick}
            className="flex items-center gap-2 text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Support</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
