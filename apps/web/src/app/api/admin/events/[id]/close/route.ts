import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';

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
      .select('status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update status to closed
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ status: 'closed' })
      .eq('id', eventId);

    if (updateError) {
      console.error('Failed to close event:', updateError);
      return NextResponse.json(
        { error: 'Failed to close event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event closed successfully',
    });
  } catch (error) {
    console.error('Close event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
