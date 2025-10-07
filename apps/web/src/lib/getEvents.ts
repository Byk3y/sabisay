import { supabaseAdmin } from '@/lib/supabase-server';
import { type MarketItem } from '@/types/market';

/**
 * Fetch events from Supabase with retry logic for reliability
 * This function is shared between the home page and category pages
 */
export async function getEvents(): Promise<MarketItem[]> {
  try {
    // Add retry logic for more reliable fetching
    let events = null;
    let error = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const result = await supabaseAdmin
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

      events = result.data;
      error = result.error;

      if (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } else if (events && events.length >= 3) {
        break;
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    if (error) {
      console.error('Database error after retries:', error);
      return [];
    }

    if (!events || events.length === 0) {
      console.log('📭 getEvents: No events found in database');
      return [];
    }

    console.log('✅ getEvents: Fetched', events.length, 'events from database');
    console.log('📋 getEvents: Event IDs:', events.map(e => e.id));

    // Transform database events to MarketItem format
    const transformedEvents = events.map((event: any) => {
      try {
        // Create outcomes array
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
          id: event.id.toString(),
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
      } catch (error) {
        console.error(`Error transforming event ${event.id}:`, error);
        return null;
      }
    }).filter(event => event !== null) as MarketItem[];
    
    console.log('✅ getEvents: Transformed', transformedEvents.length, 'events');
    console.log('📋 getEvents: Transformed titles:', transformedEvents.map(e => e.kind === 'market' ? e.question : e.title));
    
    return transformedEvents;
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}
