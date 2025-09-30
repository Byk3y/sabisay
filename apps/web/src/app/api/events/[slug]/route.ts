import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generalRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, {
        windowMs: 60 * 1000,
        maxRequests: 60,
      });
    }

    const { slug } = params;

    // Fetch event from database
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select(
        `
        id,
        slug,
        title,
        question,
        type,
        close_time,
        image_cid,
        chain_id,
        market_address,
        tx_hash,
        status,
        created_at,
        event_outcomes (
          id,
          label,
          idx,
          color
        )
      `
      )
      .eq('slug', slug)
      .eq('status', 'live')
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found',
        },
        { status: 404 }
      );
    }

    // Transform the data
    const eventData = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      question: event.question,
      type: event.type,
      closeTime: event.close_time,
      imageCid: event.image_cid,
      chainId: event.chain_id,
      marketAddress: event.market_address,
      txHash: event.tx_hash,
      status: event.status,
      createdAt: event.created_at,
      outcomes: event.event_outcomes
        .sort((a: any, b: any) => a.idx - b.idx)
        .map((outcome: any) => ({
          id: outcome.id,
          label: outcome.label,
          idx: outcome.idx,
          color: outcome.color,
        })),
    };

    return NextResponse.json({
      success: true,
      data: eventData,
    });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
