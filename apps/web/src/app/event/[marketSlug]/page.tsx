import { getMarketBySlug, getAllMarketSlugs } from '@/lib/marketUtils';
import { supabaseAdmin } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import EventDetailsPageClient from './EventDetailsPageClient';

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { marketSlug: string };
}): Promise<Metadata> {
  const { marketSlug } = params;
  
  // Try to fetch from database first
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('title, question, type')
    .eq('slug', marketSlug)
    .single();

  if (event) {
    return {
      title: `${event.title} | SabiSay`,
      description: `Trade on ${event.question}`,
      openGraph: {
        title: event.title,
        description: `Trade on ${event.question}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: `Trade on ${event.question}`,
      },
    };
  }

  // Fallback to mock data
  const market = getMarketBySlug(marketSlug);

  if (!market) {
    return {
      title: 'Market Not Found | SabiSay',
      description: 'The market you are looking for does not exist.',
    };
  }

  return {
    title: `${market.title} | SabiSay`,
    description: `Trade on ${market.title} - ${market.outcomes.length} outcomes available. Pool: $${market.volume.toLocaleString()}`,
    openGraph: {
      title: market.title,
      description: `Trade on ${market.title} - ${market.outcomes.length} outcomes available. Pool: $${market.volume.toLocaleString()}`,
      type: 'website',
      images: market.imageUrl ? [market.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: market.title,
      description: `Trade on ${market.title} - ${market.outcomes.length} outcomes available. Pool: $${market.volume.toLocaleString()}`,
      images: market.imageUrl ? [market.imageUrl] : [],
    },
  };
}

// Generate static params for pre-rendering
export async function generateStaticParams(): Promise<Array<{ marketSlug: string }>> {
  // Get slugs from database
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('slug')
    .eq('status', 'live');

  const dbSlugs = events?.map(event => ({ marketSlug: event.slug })) || [];
  
  // Also include mock data slugs
  const mockSlugs = getAllMarketSlugs().map((marketSlug) => ({
    marketSlug,
  }));

  return [...dbSlugs, ...mockSlugs];
}

interface EventDetailsPageProps {
  params: {
    marketSlug: string;
  };
}

export default function EventDetailsPage({
  params,
}: EventDetailsPageProps): React.JSX.Element {
  const { marketSlug } = params;

  return <EventDetailsPageClient marketSlug={marketSlug} />;
}
