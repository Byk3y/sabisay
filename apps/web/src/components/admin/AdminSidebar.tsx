'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutList, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const navItems: NavItem[] = [
  {
    label: 'Events',
    href: '/admin/events',
    icon: LayoutList,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin/events') {
      return pathname?.startsWith('/admin/events') || pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className={`fixed left-0 top-0 h-full bg-sabi-nav dark:bg-sabi-nav-dark border-r border-sabi-border dark:border-sabi-border-dark transition-all duration-200 z-50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Admin navigation"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sabi-border dark:border-sabi-border-dark">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-blue-500/20 dark:bg-blue-500/20 grid place-items-center">
              <span className="text-blue-600 dark:text-white font-bold text-lg">P</span>
            </div>
            <span className="font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
              Admin
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-sabi-card dark:hover:bg-sabi-card-dark transition-colors"
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
      <div className="py-4 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                active
                  ? 'bg-sabi-accent/10 text-sabi-accent border-l-2 border-sabi-accent -ml-2 pl-[calc(0.75rem-2px)]'
                  : 'text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:bg-sabi-card dark:hover:bg-sabi-card-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? '' : ''}`} />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-sabi-accent/20 text-sabi-accent">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}