import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { validateCSRF } from '@/lib/csrf';

// Validation schema for resolution
const resolveEventSchema = z.object({
  winningOutcomeIdx: z.number().int().min(0),
  evidenceUrl: z.string().url(),
  evidenceCid: z.string().optional(),
  resolutionNotes: z.string().min(10).max(1000).optional(),
});

/**
 * POST /api/admin/events/[id]/resolve
 * Resolve an event with a winning outcome
 * 
 * NOTE: This is currently STUBBED for v1
 * - Updates database only
 * - Does NOT interact with blockchain
 * - Does NOT trigger payouts
 * 
 * TODO (Future): 
 * - Call smart contract resolution function
 * - Verify evidence on IPFS
 * - Trigger dispute window
 * - Handle payouts after finalization
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

    // Parse and validate request body
    const body = await request.json();
    const validated = resolveEventSchema.parse(body);

    // Get current event status and validate
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('status, type, event_outcomes(idx)')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Validation: Check if already resolved (check this first!)
    if (event.status === 'resolved') {
      return NextResponse.json(
        { error: 'Event is already resolved' },
        { status: 400 }
      );
    }

    // Validation: Can only resolve closed events
    if (event.status !== 'closed') {
      return NextResponse.json(
        { error: 'Only closed events can be resolved' },
        { status: 400 }
      );
    }

    // Validation: Winning outcome must exist
    const outcomeIndices = event.event_outcomes.map((o: { idx: number }) => o.idx);
    if (!outcomeIndices.includes(validated.winningOutcomeIdx)) {
      return NextResponse.json(
        { error: 'Invalid winning outcome index' },
        { status: 400 }
      );
    }

    // TODO (Future v2): Call smart contract to resolve on-chain
    // const txHash = await resolveMarketOnChain({
    //   marketAddress: event.market_address,
    //   winningOutcomeIdx: validated.winningOutcomeIdx,
    //   evidenceCid: validated.evidenceCid,
    // });

    // Update database with resolution data
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        winning_outcome_idx: validated.winningOutcomeIdx,
        evidence_url: validated.evidenceUrl,
        evidence_cid: validated.evidenceCid || null,
        resolution_notes: validated.resolutionNotes || null,
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('Failed to resolve event:', updateError);
      return NextResponse.json(
        { error: 'Failed to resolve event' },
        { status: 500 }
      );
    }

    // TODO (Future v2): Emit resolution event for notifications
    // await notifyResolution({
    //   eventId,
    //   winningOutcomeIdx: validated.winningOutcomeIdx,
    //   evidenceUrl: validated.evidenceUrl,
    // });

    return NextResponse.json({
      success: true,
      message: 'Event resolved successfully (database only - blockchain integration pending)',
      // txHash would be returned here in future
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Resolve event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

