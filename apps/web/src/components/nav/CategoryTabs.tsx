'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories, type Category } from '@/lib/mock';

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange?: (category: Category) => void;
}

// Map display names to URL slugs
const categorySlugMap: Record<Category, string> = {
  Trending: '',
  Politics: 'politics',
  Breaking: 'breaking',
  New: 'new',
  Sports: 'sports',
  Crypto: 'crypto',
  Earnings: 'earnings',
  Geopolitics: 'geopolitics',
  Tech: 'tech',
  Culture: 'culture',
  World: 'world',
  Economy: 'economy',
  'Naija Picks': 'naija-picks',
};

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const pathname = usePathname();

  const handleCategoryClick = (category: Category) => {
    onCategoryChange?.(category);
  };

  const getCategoryHref = (category: Category) => {
    const slug = categorySlugMap[category];
    return slug === '' ? '/' : `/${slug}`;
  };

  const isCategoryActive = (category: Category) => {
    const href = getCategoryHref(category);
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href;
  };

  return (
    <div className="sticky top-14 z-30 bg-white dark:bg-[#0b1220] border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 md:px-0 overflow-x-auto no-scrollbar">
        <ul className="flex gap-2 py-3 text-sm">
          {categories.map(category => {
            const href = getCategoryHref(category);
            const isActive = isCategoryActive(category);

            return (
              <li key={category} className="shrink-0">
                <Link
                  href={href}
                  onClick={() => handleCategoryClick(category)}
                  data-active={isActive}
                  className={`px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 data-[active=true]:bg-blue-100 dark:data-[active=true]:bg-blue-600 data-[active=true]:text-blue-700 dark:data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-600/20 transition-colors whitespace-nowrap ${
                    isActive ? 'ring-1 ring-blue-500/30' : ''
                  }`}
                >
                  {category}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
