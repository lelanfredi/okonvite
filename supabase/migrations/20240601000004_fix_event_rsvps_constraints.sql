-- Ensure the event_rsvps table has proper constraints
ALTER TABLE event_rsvps ALTER COLUMN event_id SET NOT NULL;
ALTER TABLE event_rsvps ALTER COLUMN name SET NOT NULL;

-- Make sure realtime is enabled for the table
ALTER PUBLICATION supabase_realtime ADD TABLE event_rsvps;