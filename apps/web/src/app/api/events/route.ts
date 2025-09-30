import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  console.log('📡 API /api/events: Request received');
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*, event_outcomes(*)')
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ API /api/events: Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    console.log('✅ API /api/events: Found', events?.length || 0, 'events');
    if (events && events.length > 0) {
      console.log(
        '📋 API /api/events: Event slugs:',
        events.map(e => e.slug)
      );
    }

    return NextResponse.json(
      { success: true, data: events || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ API /api/events: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
