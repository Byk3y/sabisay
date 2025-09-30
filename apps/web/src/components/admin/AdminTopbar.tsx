'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

interface Breadcrumb {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] !== 'admin') return [];

  const breadcrumbs: Breadcrumb[] = [{ label: 'Admin', href: '/admin' }];

  if (segments[1] === 'events') {
    breadcrumbs.push({ label: 'Events', href: '/admin/events' });

    if (segments[2] === 'new') {
      breadcrumbs.push({ label: 'Create Event' });
    } else if (segments[2]) {
      breadcrumbs.push({ label: 'Edit Event' });
    }
  } else if (segments[1] === 'settings') {
    breadcrumbs.push({ label: 'Settings' });
  }

  return breadcrumbs;
}

interface AdminTopbarProps {
  onMobileMenuToggle?: () => void;
  actions?: React.ReactNode;
}

export function AdminTopbar({ onMobileMenuToggle, actions }: AdminTopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <header className="h-14 bg-sabi-card dark:bg-sabi-card-dark border-b border-sabi-border dark:border-sabi-border-dark flex items-center justify-between px-4">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5 text-sabi-text-secondary dark:text-sabi-text-secondary-dark" />
        </button>

        <nav aria-label="Breadcrumb">
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

      {/* Right: Actions + User Menu */}
      <div className="flex items-center gap-3">
        {actions}

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-sabi-accent/20 flex items-center justify-center">
              <User className="w-4 h-4 text-sabi-accent" />
            </div>
            {user?.email && (
              <span className="hidden sm:block text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                {user.email}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg shadow-lg py-1 z-50">
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
          )}
        </div>
      </div>
    </header>
  );
}
