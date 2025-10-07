import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { validateCSRF } from '@/lib/csrf';

/**
 * POST /api/admin/events/[id]/archive
 * Archive an event (soft delete)
 * Can be reversed by updating status back to previous_status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session and verify admin
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate CSRF token
    const csrfError = await validateCSRF(request);
    if (csrfError) {
      return csrfError;
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

    const eventId = params.id;

    // Get current event status
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('status, archived_at')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if already archived (use archived_at as source of truth)
    if (event.archived_at !== null) {
      return NextResponse.json(
        { error: 'Event is already archived' },
        { status: 400 }
      );
    }

    // Archive the event
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({
        previous_status: event.status,
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('Failed to archive event:', updateError);
      return NextResponse.json(
        { error: 'Failed to archive event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event archived successfully',
    });
  } catch (error) {
    console.error('Archive event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

