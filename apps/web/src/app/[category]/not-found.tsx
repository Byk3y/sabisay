import Link from 'next/link';
import { TopNavClient } from '@/components/nav/TopNavClient';
import { SidePanelProvider } from '@/contexts/SidePanelContext';

export default function CategoryNotFound() {
  return (
    <SidePanelProvider>
      <div className="min-h-screen bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white transition-colors">
        {/* Top Navigation */}
        <TopNavClient />

        {/* 404 Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">
              404
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Category Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              The category you're looking for doesn't exist. Check the URL or
              browse our available categories.
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Home
              </Link>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Available categories:</p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    'Politics',
                    'Breaking',
                    'New',
                    'Sports',
                    'Crypto',
                    'Earnings',
                    'Geopolitics',
                    'Tech',
                    'Culture',
                    'World',
                    'Economy',
                    'Naija Picks',
                  ].map(category => (
                    <Link
                      key={category}
                      href={`/${category.toLowerCase().replace(' ', '-')}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidePanelProvider>
  );
}
