-- Create a table to track RSVP history
CREATE TABLE IF NOT EXISTS public.event_rsvp_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rsvp_id UUID NOT NULL REFERENCES public.event_rsvps(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Add deadline field to events table if it doesn't exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMP WITH TIME ZONE;

-- Add sharing tracking
CREATE TABLE IF NOT EXISTS public.event_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  share_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicks INTEGER DEFAULT 0
);

-- Enable realtime for new tables
alter publication supabase_realtime add table event_rsvp_history;
alter publication supabase_realtime add table event_shares;