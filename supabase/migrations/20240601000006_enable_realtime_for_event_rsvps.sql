-- Enable realtime for event_rsvps table if not already enabled
alter publication supabase_realtime add table event_rsvps;