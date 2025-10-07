import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { validateCSRF } from '@/lib/csrf';
import { EventDetail, EventOutcome } from '@/types/admin';

// Validation schema for updating events
const updateEventSchema = z.object({
  question: z.string().min(10).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['binary', 'multi']).optional(),
  outcomes: z
    .array(
      z.object({
        id: z.string().uuid().optional(), // Existing outcome ID
        label: z.string().min(1).max(100),
        color: z.string().optional().nullable(),
      })
    )
    .min(2)
    .max(8)
    .optional(),
  closeTime: z.string().datetime().optional(),
  rules: z.string().min(10).max(2000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

/**
 * GET /api/admin/events/[id]
 * Fetch a single event with all details for editing
 */
export async function GET(
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

    // Fetch event with outcomes
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select(
        `
        *,
        event_outcomes (
          id,
          event_id,
          label,
          idx,
          color,
          created_at
        )
      `
      )
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Sort outcomes by index
    const sortedOutcomes = (event.event_outcomes as EventOutcome[]).sort(
      (a, b) => a.idx - b.idx
    );

    const eventDetail: EventDetail = {
      ...event,
      event_outcomes: sortedOutcomes,
    } as EventDetail;

    return NextResponse.json(eventDetail);
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update an event and its outcomes
 */
export async function PUT(
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
    const validated = updateEventSchema.parse(body);

    // Fetch current event to check status and enforce rules
    const { data: currentEvent, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('status, slug, type, close_time')
      .eq('id', eventId)
      .single();

    if (fetchError || !currentEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Validation: Cannot edit resolved or archived events
    if (
      currentEvent.status === 'resolved' ||
      currentEvent.status === 'archived'
    ) {
      return NextResponse.json(
        { error: 'Cannot edit resolved or archived events' },
        { status: 400 }
      );
    }

    // Validation: Cannot change question after publish
    if (
      validated.question &&
      currentEvent.status !== 'draft' &&
      currentEvent.status !== 'pending'
    ) {
      return NextResponse.json(
        { error: 'Cannot change question after event is published' },
        { status: 400 }
      );
    }

    // Validation: Cannot change type
    if (validated.type && validated.type !== currentEvent.type) {
      return NextResponse.json(
        { error: 'Cannot change event type after creation' },
        { status: 400 }
      );
    }

    // Validation: Close time must be in future if updating
    if (validated.closeTime) {
      const newCloseTime = new Date(validated.closeTime);
      if (newCloseTime <= new Date()) {
        return NextResponse.json(
          { error: 'Close time must be in the future' },
          { status: 400 }
        );
      }

      // For live events, can only extend close time, not shorten
      // Use currentEvent.close_time we already fetched (no duplicate query needed)
      if (currentEvent.status === 'live') {
        const currentCloseTime = new Date(currentEvent.close_time);
        if (newCloseTime < currentCloseTime) {
          return NextResponse.json(
            { error: 'Cannot shorten close time for live events' },
            { status: 400 }
          );
        }
      }
    }

    // Build update object for events table
    const eventUpdate: Record<string, unknown> = {};

    if (validated.question !== undefined) {
      eventUpdate.question = validated.question;
      // Note: We do NOT regenerate slug or title
    }

    if (validated.description !== undefined) {
      eventUpdate.description = validated.description;
    }

    if (validated.closeTime !== undefined) {
      eventUpdate.close_time = validated.closeTime;
    }

    if (validated.rules !== undefined) {
      eventUpdate.rules = validated.rules;
    }

    if (validated.imageUrl !== undefined) {
      eventUpdate.image_url = validated.imageUrl;
    }

    // Update event if there are changes
    if (Object.keys(eventUpdate).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('events')
        .update(eventUpdate)
        .eq('id', eventId);

      if (updateError) {
        console.error('Failed to update event:', updateError);
        return NextResponse.json(
          { error: 'Failed to update event' },
          { status: 500 }
        );
      }
    }

    // Update outcomes if provided (atomic operation)
    if (validated.outcomes && validated.outcomes.length > 0) {
      // Validate binary markets have exactly 2 outcomes
      if (currentEvent.type === 'binary' && validated.outcomes.length !== 2) {
        return NextResponse.json(
          { error: 'Binary markets must have exactly 2 outcomes' },
          { status: 400 }
        );
      }

      // Validate multi markets have 2-8 outcomes
      if (
        currentEvent.type === 'multi' &&
        (validated.outcomes.length < 2 || validated.outcomes.length > 8)
      ) {
        return NextResponse.json(
          { error: 'Multi-choice markets must have 2-8 outcomes' },
          { status: 400 }
        );
      }

      // Fetch existing outcomes
      const { data: existingOutcomes } = await supabaseAdmin
        .from('event_outcomes')
        .select('id')
        .eq('event_id', eventId);

      const existingIds = new Set(existingOutcomes?.map(o => o.id) || []);

      // Prepare batch operations
      const toUpdate: Array<{ id: string; label: string; color: string | null; idx: number }> = [];
      const toInsert: Array<{ event_id: string; label: string; color: string | null; idx: number }> = [];
      const toDelete: string[] = [];

      // Categorize operations
      for (let i = 0; i < validated.outcomes.length; i++) {
        const outcome = validated.outcomes[i];

        if (outcome.id && existingIds.has(outcome.id)) {
          toUpdate.push({
            id: outcome.id,
            label: outcome.label,
            color: outcome.color || null,
            idx: i,
          });
          existingIds.delete(outcome.id);
        } else {
          toInsert.push({
            event_id: eventId,
            label: outcome.label,
            color: outcome.color || null,
            idx: i,
          });
        }
      }

      // Remaining existing IDs should be deleted
      if (existingIds.size > 0) {
        toDelete.push(...Array.from(existingIds));
      }

      // Execute batch operations (order matters: delete, update, insert)
      try {
        // Delete removed outcomes first
        if (toDelete.length > 0) {
          const { error: deleteError } = await supabaseAdmin
            .from('event_outcomes')
            .delete()
            .in('id', toDelete);
          
          if (deleteError) throw deleteError;
        }

        // Update existing outcomes
        for (const outcome of toUpdate) {
          const { error: updateError } = await supabaseAdmin
            .from('event_outcomes')
            .update({
              label: outcome.label,
              color: outcome.color,
              idx: outcome.idx,
            })
            .eq('id', outcome.id);
          
          if (updateError) throw updateError;
        }

        // Insert new outcomes
        if (toInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('event_outcomes')
            .insert(toInsert);
          
          if (insertError) throw insertError;
        }
      } catch (outcomeError) {
        console.error('Failed to update outcomes:', outcomeError);
        return NextResponse.json(
          { error: 'Failed to update outcomes. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

