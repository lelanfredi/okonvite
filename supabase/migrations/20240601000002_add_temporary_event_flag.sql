-- Add is_temporary column to events table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name = 'events'
                AND column_name = 'is_temporary') THEN
    ALTER TABLE events ADD COLUMN is_temporary BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add index for faster queries on temporary events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_is_temporary') THEN
    CREATE INDEX idx_events_is_temporary ON events(is_temporary);
  END IF;
END $$;
