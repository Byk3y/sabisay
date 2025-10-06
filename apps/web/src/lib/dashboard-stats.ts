/**
 * Dashboard statistics utility functions
 */

export interface DashboardStats {
  totalEvents: number;
  liveEvents: number;
  totalVolume: number;
  activeUsers: number;
  recentEvents: Array<{
    id: string;
    title: string;
    status: 'draft' | 'pending' | 'onchain' | 'live' | 'closed' | 'resolved';
    closeTime: string;
    volume: number;
  }>;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    blockchain: 'healthy' | 'warning' | 'error';
  };
}

/**
 * Fetch dashboard statistics from the API
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/admin/dashboard/stats', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch dashboard stats');
  }

  return result.data;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get health status icon based on status
 */
export function getHealthIcon(status: 'healthy' | 'warning' | 'error') {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return '❓';
  }
}
