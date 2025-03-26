-- Create table for reminder settings
CREATE TABLE IF NOT EXISTS public.event_reminder_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rsvp_id UUID NOT NULL REFERENCES public.event_rsvps(id) ON DELETE CASCADE,
  email_reminders BOOLEAN DEFAULT true,
  whatsapp_reminders BOOLEAN DEFAULT false,
  one_week_reminder BOOLEAN DEFAULT true,
  one_day_reminder BOOLEAN DEFAULT true,
  update_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for sent notifications
CREATE TABLE IF NOT EXISTS public.event_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL, -- 'confirmation', 'reminder_1day', 'reminder_7day', 'update'
  channel TEXT NOT NULL, -- 'email', 'whatsapp'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'sent', 'failed', 'delivered', 'read'
  message_id TEXT, -- External message ID from email/SMS provider
  metadata JSONB
);

-- Add QR code field to event_rsvps
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS qr_code_token TEXT;

-- Enable realtime for new tables
alter publication supabase_realtime add table event_reminder_settings;
alter publication supabase_realtime add table event_notifications;
