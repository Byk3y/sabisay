import { TopNavClient } from '@/components/nav/TopNavClient';
import { SidePanelProvider } from '@/contexts/SidePanelContext';

export default function CategoryLoading() {
  return (
    <SidePanelProvider>
      <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
        {/* Top Navigation */}
        <TopNavClient />

        {/* Category Tabs Skeleton */}
        <div className="sticky top-14 z-30 bg-white dark:bg-[#0b1220] border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-4 md:px-0 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 py-3 text-sm">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Search Bar Skeleton */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <div className="h-10 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Market Cards Skeleton */}
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                >
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidePanelProvider>
  );
}
