import { supabaseAdmin } from '@/lib/supabase-server';
import { type MarketItem } from '@/types/market';

// Server component that fetches events directly from Supabase
export async function getEvents(): Promise<MarketItem[]> {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*, event_outcomes(*)')
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ getEvents: Database error:', error);
      return [];
    }

    if (!events || events.length === 0) {
      return [];
    }

    // Transform database events to MarketItem format that matches mock structure
    const transformedEvents: MarketItem[] = events.map(event => {
      const outcomes = event.event_outcomes || [];

      return {
        kind: 'market',
        id: event.id,
        slug: event.slug,
        title: event.title,
        question: event.question,
        type: event.type || 'binary',
        status: event.status,
        poolUsd: 0, // Will be updated with real data later
        volume: 0, // Will be updated with real data later
        closesAt: event.close_time,
        imageUrl: event.image_cid || undefined,
        outcomes: outcomes.map((outcome: any) => ({
          id: outcome.id,
          label: outcome.label,
          probability: outcome.probability || 0.5,
          volume: outcome.volume || 0,
          color: outcome.color,
        })),
        // Add any other fields that might be needed
        creator: event.creator_user_id,
        createdAt: event.created_at,
        marketAddress: event.market_address,
        txHash: event.tx_hash,
      };
    });

    // Debug: Log image data for events
    transformedEvents.forEach(event => {
      if (event.kind === 'market' && event.imageUrl) {
      }
    });

    return transformedEvents;
  } catch (error) {
    console.error('❌ getEvents: Unexpected error:', error);
    return [];
  }
}
