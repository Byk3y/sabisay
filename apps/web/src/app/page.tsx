import { SidePanelProvider } from '@/contexts/SidePanelContext';
import { type MarketItem } from '@/types/market';
import { HomePageContent } from '@/components/HomePage/HomePageContent';
import { supabaseAdmin } from '@/lib/supabase-server';

// Server component that fetches events directly from Supabase
async function getEvents(): Promise<MarketItem[]> {
  try {

    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        event_outcomes (
          id,
          label,
          idx,
          color
        )
      `)
      .eq('status', 'live')
      .order('created_at', { ascending: false });


    if (error) {
      console.error('❌ getEvents: Database error:', error);
      return [];
    }

    if (!events || events.length === 0) {
      console.log('📭 getEvents: No events found in database');
      return [];
    }

    console.log('✅ getEvents: Fetched', events.length, 'events from database');
    console.log('📋 getEvents: Event IDs:', events.map(e => e.id));

    // Transform database events to MarketItem format that matches mock structure
    const transformedEvents = events.map((event: any) => {
      // Create outcomes array in the same format as mock data
      const outcomes =
        event.event_outcomes && event.event_outcomes.length > 0
          ? event.event_outcomes.map((outcome: any) => ({
              label: outcome.label,
              oddsPct: 50, // Default odds since we don't have real pricing yet
            }))
          : [
              { label: 'Yes', oddsPct: 50 },
              { label: 'No', oddsPct: 50 },
            ];

      return {
        kind: 'market' as const,
        id: event.id.toString(), // Ensure ID is string like mock data
        slug: event.slug,
        question: event.question,
        outcomes: outcomes,
        poolUsd: 1000000, // Default pool size - will be replaced with real data later
        closesAt: event.close_time,
        uiStyle:
          event.type === 'binary' ? ('binary' as const) : ('default' as const),
        // Additional fields for compatibility
        imageUrl: event.image_cid || undefined,
        // Database-specific fields for detailed view
        chainId: event.chain_id,
        marketAddress: event.market_address,
        txHash: event.tx_hash,
        status: event.status,
        createdAt: event.created_at,
      };
    });

    
    return transformedEvents;
  } catch (error) {
    console.error('❌ getEvents: Unexpected error:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch events server-side using direct Supabase query
  const realEvents = await getEvents();


  return (
    <SidePanelProvider>
      <HomePageContent realEvents={realEvents} />
    </SidePanelProvider>
  );
}
