import { notFound } from 'next/navigation';
import { CategoryPageClient } from '@/components/HomePage/CategoryPageClient';
import { SidePanelProvider } from '@/contexts/SidePanelContext';
import { getEvents } from '@/lib/getEvents';
import type { Metadata } from 'next';

// Valid category slugs (URL-friendly versions)
const validCategories = [
  'politics',
  'breaking',
  'new',
  'sports',
  'crypto',
  'earnings',
  'geopolitics',
  'tech',
  'culture',
  'world',
  'economy',
  'naija-picks',
] as const;

type CategorySlug = (typeof validCategories)[number];

// Map URL slugs to display names
const categoryMap: Record<CategorySlug, string> = {
  politics: 'Politics',
  breaking: 'Breaking',
  new: 'New',
  sports: 'Sports',
  crypto: 'Crypto',
  earnings: 'Earnings',
  geopolitics: 'Geopolitics',
  tech: 'Tech',
  culture: 'Culture',
  world: 'World',
  economy: 'Economy',
  'naija-picks': 'Naija Picks',
};

function isValidCategory(category: string): category is CategorySlug {
  return validCategories.includes(category as CategorySlug);
}

// Generate metadata for each category page
export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const { category } = params;

  if (!isValidCategory(category)) {
    return {
      title: 'Category Not Found | SabiSay',
      description: 'The category you are looking for does not exist.',
    };
  }

  const categoryName = categoryMap[category];
  const description = `Explore ${categoryName.toLowerCase()} prediction markets on SabiSay. Trade on the most popular ${categoryName.toLowerCase()} events and outcomes.`;

  return {
    title: `${categoryName} | SabiSay`,
    description,
    openGraph: {
      title: `${categoryName} Prediction Markets | SabiSay`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} | SabiSay`,
      description,
    },
  };
}

// Generate static params for all valid categories
export async function generateStaticParams() {
  return validCategories.map(category => ({
    category,
  }));
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;

  // Validate category
  if (!isValidCategory(category)) {
    notFound();
  }

  // Fetch events (same as home page)
  const realEvents = await getEvents();

  // Get display name for the category
  const categoryName = categoryMap[category];

  return (
    <SidePanelProvider>
      <CategoryPageClient
        realEvents={realEvents}
        category={categoryName}
        categorySlug={category}
      />
    </SidePanelProvider>
  );
}
