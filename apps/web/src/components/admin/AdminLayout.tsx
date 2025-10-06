'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { ModernSidebar } from './ModernSidebar';
import { ModernTopbar } from './ModernTopbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export function AdminLayout({ 
  children, 
  actions, 
  showSearch = true,
  onSearch,
  searchPlaceholder 
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Changed default to true
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sabi-bg dark:bg-sabi-bg-dark">
      <Toaster position="top-right" richColors />
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <ModernSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar - Mobile (Overlay) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="lg:hidden">
            <ModernSidebar collapsed={false} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className={`lg:transition-all lg:duration-200 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <ModernTopbar
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          actions={actions}
          showSearch={showSearch}
          onSearch={onSearch || (() => {})}
          searchPlaceholder={searchPlaceholder || 'Search...'}
        />
        <main id="main-content" className="p-4 sm:p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
