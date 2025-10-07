import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { EventsListParams, EventsListResponse } from '@/types/admin';

export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const qParam = searchParams.get('q');
    const createdFromParam = searchParams.get('createdFrom');
    const createdToParam = searchParams.get('createdTo');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const statusParam = searchParams.getAll('status[]');

    const params: EventsListParams = {};

    if (qParam) {
      // Validate search query length to prevent DoS
      if (qParam.length > 200) {
        return NextResponse.json(
          { error: 'Search query too long (max 200 characters)' },
          { status: 400 }
        );
      }
      params.q = qParam;
    }
    if (statusParam.length > 0) params.status = statusParam;
    if (createdFromParam) params.createdFrom = createdFromParam;
    if (createdToParam) params.createdTo = createdToParam;
    params.sort =
      (searchParams.get('sort') as EventsListParams['sort']) || 'created_at';
    params.order =
      (searchParams.get('order') as EventsListParams['order']) || 'desc';
    params.page = pageParam < 1 ? 1 : pageParam;

    const pageSize = 20;
    const offset = (params.page! - 1) * pageSize;

    // Build query
    let query = supabaseAdmin.from('events').select(`
        id,
        slug,
        title,
        type,
        status,
        close_time,
        created_at,
        market_address,
        tx_hash,
        creator_user_id
      `);

    // Apply filters
    if (params.q) {
      // Sanitize search query by escaping SQL LIKE wildcards
      const sanitizedQuery = params.q.replace(/[%_]/g, '\\$&');
      query = query.or(
        `question.ilike.%${sanitizedQuery}%,slug.ilike.%${sanitizedQuery}%`
      );
    }

    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status);
    }

    if (params.createdFrom) {
      query = query.gte('created_at', params.createdFrom);
    }

    if (params.createdTo) {
      query = query.lte('created_at', params.createdTo);
    }

    // Apply sorting
    query = query.order(params.sort!, { ascending: params.order === 'asc' });

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    // Execute query
    const { data: events, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const response: EventsListResponse = {
      items: events || [],
      total: count || 0,
      page: params.page!,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin events list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
