import { useState, useEffect } from 'react';
import { MarketItem } from '@/types/market';

interface DatabaseEvent {
  id: string;
  slug: string;
  title: string;
  question: string;
  type: string;
  closeTime: string;
  imageCid: string | null;
  chainId: number;
  marketAddress: string;
  txHash: string;
  status: string;
  createdAt: string;
  outcomes: Array<{
    id: string;
    label: string;
    idx: number;
    color: string | null;
  }>;
}

// Convert database event to MarketItem format
function convertDatabaseEventToMarketItem(event: DatabaseEvent): MarketItem {
  const item: MarketItem = {
    kind: 'market',
    id: event.id,
    question: event.question,
    poolUsd: 1000000, // Default pool size
    slug: event.slug,
    closesAt: event.closeTime,
    // Convert outcomes to the expected format
    outcomes: event.outcomes.map((outcome, index) => ({
      label: outcome.label,
      oddsPct: 50, // Default equal probability for now
    })),
  };

  // Only add imageUrl if it exists
  if (event.imageCid) {
    item.imageUrl = `https://gateway.pinata.cloud/ipfs/${event.imageCid}`;
  }

  return item;
}

export function useEvents() {
  const [events, setEvents] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        console.log('useEvents: Starting fetch...');
        setLoading(true);
        setError(null);

        // Fetch events from the database
        const response = await fetch('/api/events');
        console.log('useEvents: Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const data = await response.json();
        console.log('useEvents: Response data:', data);

        if (data.success && data.data) {
          // Convert database events to MarketItem format
          const convertedEvents = data.data.map(
            convertDatabaseEventToMarketItem
          );
          console.log('useEvents: Converted events:', convertedEvents);
          setEvents(convertedEvents);
        } else {
          console.warn('No events found in database');
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents([]);
      } finally {
        console.log('useEvents: Setting loading to false');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error };
}
