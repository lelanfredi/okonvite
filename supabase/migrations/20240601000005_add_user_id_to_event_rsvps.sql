-- Add user_id column to event_rsvps table if it doesn't exist
ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable realtime for event_rsvps table
alter publication supabase_realtime add table event_rsvps;