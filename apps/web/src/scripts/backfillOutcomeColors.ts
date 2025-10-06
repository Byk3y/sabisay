/**
 * Backfill missing outcome colors with deterministic defaults
 * 
 * This script assigns colors to event outcomes that are missing the `color` field.
 * Colors are assigned deterministically based on the outcome's index using the
 * shared PAKO_OUTCOME_COLORS palette.
 * 
 * Usage:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in environment (.env.local)
 * 2. Run: npx tsx apps/web/src/scripts/backfillOutcomeColors.ts
 * 3. Verify: Check database for updated colors
 * 
 * Notes:
 * - Does NOT overwrite existing colors
 * - Only updates outcomes where color IS NULL
 * - Uses getDefaultOutcomeColor() for deterministic assignment
 */

import { createClient } from '@supabase/supabase-js';
import { getDefaultOutcomeColor } from '../lib/colors';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment');
  console.error('   Add them to your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillColors() {
  console.log('🎨 Starting outcome color backfill...\n');

  // Fetch all outcomes without colors
  const { data: outcomes, error } = await supabase
    .from('event_outcomes')
    .select('id, event_id, idx, color, label')
    .is('color', null)
    .order('event_id', { ascending: true })
    .order('idx', { ascending: true });

  if (error) {
    console.error('❌ Error fetching outcomes:', error);
    process.exit(1);
  }

  if (!outcomes || outcomes.length === 0) {
    console.log('✅ No outcomes need color backfill - all outcomes already have colors!\n');
    return;
  }

  console.log(`📊 Found ${outcomes.length} outcomes without colors:\n`);

  // Update each outcome
  let updated = 0;
  let failed = 0;

  for (const outcome of outcomes) {
    const color = getDefaultOutcomeColor(outcome.idx);
    
    console.log(`   Processing: "${outcome.label}" (idx: ${outcome.idx}) → ${color}`);

    const { error: updateError } = await supabase
      .from('event_outcomes')
      .update({ color })
      .eq('id', outcome.id);

    if (updateError) {
      console.error(`   ❌ Failed to update outcome ${outcome.id}:`, updateError.message);
      failed++;
    } else {
      updated++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 Backfill complete!`);
  console.log(`   ✅ Successfully updated: ${updated} outcomes`);
  if (failed > 0) {
    console.log(`   ❌ Failed to update: ${failed} outcomes`);
  }
  console.log(`${'='.repeat(60)}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

backfillColors().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

