-- Enable realtime for the event_rsvps table (in case it wasn't enabled before)
alter publication supabase_realtime add table event_rsvps;