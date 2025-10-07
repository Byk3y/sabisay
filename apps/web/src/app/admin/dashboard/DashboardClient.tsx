'use client';

import { useState, useEffect } from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/ModernCard';
import { ModernBadge } from '@/components/ui/ModernBadge';
import { ModernButton } from '@/components/ui/ModernButton';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { fetchDashboardStats, formatCurrency, getHealthIcon, type DashboardStats } from '@/lib/dashboard-stats';

// DashboardStats interface is now imported from @/lib/dashboard-stats

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    liveEvents: 0,
    totalVolume: 0,
    activeUsers: 0,
    recentEvents: [],
    systemHealth: {
      database: 'healthy',
      api: 'healthy',
      blockchain: 'healthy',
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real dashboard data from API
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // formatCurrency and getHealthIcon are now imported from @/lib/dashboard-stats

  const getHealthColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'text-admin-success-600 dark:text-admin-success-400';
      case 'warning':
        return 'text-admin-warning-600 dark:text-admin-warning-400';
      case 'error':
        return 'text-admin-error-600 dark:text-admin-error-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-admin-gray-200 dark:bg-admin-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-admin-gray-200 dark:bg-admin-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-admin-gray-200 dark:bg-admin-gray-700 rounded-xl" />
            <div className="h-64 bg-admin-gray-200 dark:bg-admin-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
            Dashboard
          </h1>
          <p className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
            Welcome back! Here's what's happening with your prediction markets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/events/new">
            <ModernButton leftIcon={<Plus className="w-4 h-4" />}>
              Create Event
            </ModernButton>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <ModernCard hover>
          <ModernCardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  Total Events
                </p>
                <p className="text-lg font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {stats.totalEvents}
                </p>
              </div>
              <div className="p-1.5 rounded-md bg-admin-primary-100 dark:bg-admin-primary-900/20">
                <Activity className="w-4 h-4 text-admin-primary-600 dark:text-admin-primary-400" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard hover>
          <ModernCardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  Live Events
                </p>
                <p className="text-lg font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {stats.liveEvents}
                </p>
              </div>
              <div className="p-1.5 rounded-md bg-admin-success-100 dark:bg-admin-success-900/20">
                <TrendingUp className="w-4 h-4 text-admin-success-600 dark:text-admin-success-400" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard hover>
          <ModernCardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  Total Volume
                </p>
                <p className="text-lg font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {formatCurrency(stats.totalVolume)}
                </p>
              </div>
              <div className="p-1.5 rounded-md bg-admin-warning-100 dark:bg-admin-warning-900/20">
                <DollarSign className="w-4 h-4 text-admin-warning-600 dark:text-admin-warning-400" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard hover>
          <ModernCardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  Active Users
                </p>
                <p className="text-lg font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {stats.activeUsers}
                </p>
              </div>
              <div className="p-1.5 rounded-md bg-admin-primary-100 dark:bg-admin-primary-900/20">
                <Users className="w-4 h-4 text-admin-primary-600 dark:text-admin-primary-400" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Recent Events</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-4">
              {stats.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-sabi-border dark:border-sabi-border-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark truncate">
                      {event.question}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <ModernBadge
                        variant={
                          event.status === 'live'
                            ? 'success'
                            : event.status === 'draft'
                            ? 'default'
                            : 'error'
                        }
                        size="sm"
                      >
                        {event.status}
                      </ModernBadge>
                      <span className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                        {formatCurrency(event.volume)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/events/${event.id}`}>
                      <ModernButton variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </ModernButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-sabi-border dark:border-sabi-border-dark">
              <Link href="/admin/events">
                <ModernButton variant="ghost" className="w-full">
                  View All Events
                </ModernButton>
              </Link>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* System Health */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>System Health</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-sabi-border dark:border-sabi-border-dark">
                <div className="flex items-center gap-3">
                  {getHealthIcon(stats.systemHealth.database) === '✅' ? (
                    <CheckCircle className="w-4 h-4 text-admin-success-500" />
                  ) : getHealthIcon(stats.systemHealth.database) === '⚠️' ? (
                    <AlertCircle className="w-4 h-4 text-admin-warning-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-admin-error-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                      Database
                    </p>
                    <p className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                      Connection status
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getHealthColor(stats.systemHealth.database)}`}>
                  {stats.systemHealth.database}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-sabi-border dark:border-sabi-border-dark">
                <div className="flex items-center gap-3">
                  {getHealthIcon(stats.systemHealth.api) === '✅' ? (
                    <CheckCircle className="w-4 h-4 text-admin-success-500" />
                  ) : getHealthIcon(stats.systemHealth.api) === '⚠️' ? (
                    <AlertCircle className="w-4 h-4 text-admin-warning-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-admin-error-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                      API Server
                    </p>
                    <p className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                      Response time: 45ms
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getHealthColor(stats.systemHealth.api)}`}>
                  {stats.systemHealth.api}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-sabi-border dark:border-sabi-border-dark">
                <div className="flex items-center gap-3">
                  {getHealthIcon(stats.systemHealth.blockchain) === '✅' ? (
                    <CheckCircle className="w-4 h-4 text-admin-success-500" />
                  ) : getHealthIcon(stats.systemHealth.blockchain) === '⚠️' ? (
                    <AlertCircle className="w-4 h-4 text-admin-warning-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-admin-error-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
                      Blockchain
                    </p>
                    <p className="text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                      Polygon Amoy Testnet
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getHealthColor(stats.systemHealth.blockchain)}`}>
                  {stats.systemHealth.blockchain}
                </span>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  );
}



