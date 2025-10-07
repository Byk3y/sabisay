import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generalRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = generalRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, {
        windowMs: 60 * 1000,
        maxRequests: 60,
      });
    }

    // Get session and verify admin
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check admin status
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.userId)
      .single();

    if (userError || !user?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch dashboard statistics in parallel
    const [
      totalEventsResult,
      liveEventsResult,
      activeUsersResult,
      recentEventsResult
    ] = await Promise.all([
      // Total Events
      supabaseAdmin
        .from('events')
        .select('id', { count: 'exact', head: true }),
      
      // Live Events
      supabaseAdmin
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live'),
      
      // Active Users (total registered users)
      supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true }),
      
      // Recent Events (last 5)
      supabaseAdmin
        .from('events')
        .select(`
          id,
          slug,
          title,
          status,
          close_time,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Check for database errors
    if (totalEventsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch total events' },
        { status: 500 }
      );
    }

    if (liveEventsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch live events' },
        { status: 500 }
      );
    }

    if (activeUsersResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch active users' },
        { status: 500 }
      );
    }

    if (recentEventsResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch recent events' },
        { status: 500 }
      );
    }

    // Format recent events for dashboard
    const recentEvents = recentEventsResult.data?.map(event => ({
      id: event.id,
      question: event.question,
      status: event.status as 'draft' | 'pending' | 'onchain' | 'live' | 'closed' | 'resolved',
      closeTime: event.close_time,
      volume: 0, // Will be updated when trading is live
    })) || [];

    // System health checks
    const systemHealth = {
      database: 'healthy' as const, // If we got here, DB is working
      api: 'healthy' as const, // API is responding
      blockchain: 'warning' as const, // Still on testnet
    };

    const stats = {
      totalEvents: totalEventsResult.count || 0,
      liveEvents: liveEventsResult.count || 0,
      totalVolume: 0, // Will be updated when trading is live
      activeUsers: activeUsersResult.count || 0,
      recentEvents,
      systemHealth,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
