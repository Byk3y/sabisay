import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { toSlug } from '@/lib/slugUtils';

const draftEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  question: z.string().min(1).max(500),
  type: z.enum(['binary', 'multi']),
  outcomes: z
    .array(
      z.object({
        label: z.string().min(1).max(100),
        color: z.string().optional(),
      })
    )
    .min(2)
    .max(8),
  closeTime: z.string().datetime(),
  rules: z.string().min(10).max(2000).optional(),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validated = draftEventSchema.parse(body);

    // Derive title from question if not provided
    let derivedTitle = validated.title;
    if (!derivedTitle) {
      derivedTitle = validated.question.trim();
      // Shorten to ~100 chars
      if (derivedTitle.length > 100) {
        derivedTitle = derivedTitle.substring(0, 100).trim();
      }
      // Remove trailing punctuation for slug-friendliness
      derivedTitle = derivedTitle.replace(/[?!.]+$/, '');
    }

    // Generate slug from derived title
    const baseSlug = toSlug(derivedTitle);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Insert draft event
    const { data: event, error: insertError } = await supabaseAdmin
      .from('events')
      .insert({
        title: derivedTitle,
        question: validated.question,
        type: validated.type,
        close_time: validated.closeTime,
        rules: validated.rules || null,
        image_cid: validated.imageUrl || null, // Store image URL as CID for now
        slug,
        status: 'draft',
        creator_user_id: session.userId,
      })
      .select('id, slug')
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create draft' },
        { status: 500 }
      );
    }

    // Insert outcomes
    const outcomesData = validated.outcomes.map((outcome, index) => ({
      event_id: event.id,
      label: outcome.label,
      idx: index,
      color: outcome.color || null,
    }));

    const { error: outcomesError } = await supabaseAdmin
      .from('event_outcomes')
      .insert(outcomesData);

    if (outcomesError) {
      console.error('Outcomes insert error:', outcomesError);
      // Clean up the event if outcomes failed
      await supabaseAdmin.from('events').delete().eq('id', event.id);
      return NextResponse.json(
        { error: 'Failed to create outcomes' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: event.id,
        slug: event.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Draft creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
