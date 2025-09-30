-- Migration: Add composer columns to events table
-- This migration is idempotent and safe to run multiple times
-- Run this in Supabase SQL Editor

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description'
  ) THEN
    ALTER TABLE events ADD COLUMN description TEXT NULL;
  END IF;
END $$;

-- Add rules column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'rules'
  ) THEN
    ALTER TABLE events ADD COLUMN rules TEXT NULL;
  END IF;
END $$;

-- Add resolution_criteria column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'resolution_criteria'
  ) THEN
    ALTER TABLE events ADD COLUMN resolution_criteria TEXT NULL;
  END IF;
END $$;

-- Add fee_bps column if it doesn't exist (default 200 = 2%)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'fee_bps'
  ) THEN
    ALTER TABLE events ADD COLUMN fee_bps INTEGER NULL DEFAULT 200;
  END IF;
END $$;

-- Add image_url column if it doesn't exist (for direct uploads)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE events ADD COLUMN image_url TEXT NULL;
  END IF;
END $$;

-- Add tags column if it doesn't exist (optional for future categorization)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'tags'
  ) THEN
    ALTER TABLE events ADD COLUMN tags TEXT[] NULL;
  END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'events'
AND column_name IN ('description', 'rules', 'resolution_criteria', 'fee_bps', 'image_url', 'tags')
ORDER BY column_name;