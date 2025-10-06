# Admin Scripts

Utility scripts for database maintenance and data backfilling.

## backfillOutcomeColors.ts

Assigns deterministic colors to event outcomes that are missing the `color` field in the database.

### Purpose

After implementing the consistent color system, existing events in the database may not have colors assigned to their outcomes. This script backfills those missing colors using the same deterministic algorithm used throughout the application.

### Prerequisites

- Node.js and pnpm installed
- Supabase project configured
- Environment variables set:
  - `SUPABASE_URL` - Your Supabase project URL
  - `SUPABASE_SERVICE_KEY` - Your Supabase service role key (NOT the anon key)

### Usage

```bash
# From the repository root
npx tsx apps/web/src/scripts/backfillOutcomeColors.ts
```

### What it does

1. Connects to your Supabase database
2. Queries all outcomes where `color IS NULL`
3. Assigns colors using `getDefaultOutcomeColor(idx)` for each outcome
4. Updates the database with the new colors
5. Reports success/failure statistics

### Safety

- ✅ **Does NOT overwrite** existing colors
- ✅ **Only updates** outcomes where `color IS NULL`
- ✅ **Deterministic** - same index always gets same color
- ✅ **Idempotent** - safe to run multiple times

### Expected Output

```
🎨 Starting outcome color backfill...

📊 Found 2 outcomes without colors:

   Processing: "Yes" (idx: 0) → #10B981
   Processing: "No" (idx: 1) → #EF4444

============================================================
🎉 Backfill complete!
   ✅ Successfully updated: 2 outcomes
============================================================
```

### Troubleshooting

**Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set**
- Solution: Add these variables to your `.env.local` file

**Error: Cannot find module '@supabase/supabase-js'**
- Solution: Run `pnpm install` from the root directory

**Error: Permission denied**
- Solution: Ensure you're using the service role key, not the anon key

