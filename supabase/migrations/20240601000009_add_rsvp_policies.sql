-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for event organizers" ON event_rsvps;
DROP POLICY IF EXISTS "Enable insert for event organizers" ON event_rsvps;
DROP POLICY IF EXISTS "Enable update for event organizers" ON event_rsvps;
DROP POLICY IF EXISTS "Enable delete for event organizers" ON event_rsvps;
DROP POLICY IF EXISTS "Enable read access for event participants" ON event_rsvps;
DROP POLICY IF EXISTS "Enable self-management for participants" ON event_rsvps;

-- Enable RLS
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Policy for event organizers to read all RSVPs
CREATE POLICY "Enable read access for event organizers" ON event_rsvps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_rsvps.event_id
      AND (events.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM event_co_organizers
          WHERE event_co_organizers.event_id = events.id
          AND event_co_organizers.user_id = auth.uid()
        )
      )
    )
  );

-- Policy for event organizers to insert RSVPs
CREATE POLICY "Enable insert for event organizers" ON event_rsvps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_rsvps.event_id
      AND (events.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM event_co_organizers
          WHERE event_co_organizers.event_id = events.id
          AND event_co_organizers.user_id = auth.uid()
        )
      )
    )
  );

-- Policy for event organizers to update RSVPs
CREATE POLICY "Enable update for event organizers" ON event_rsvps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_rsvps.event_id
      AND (events.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM event_co_organizers
          WHERE event_co_organizers.event_id = events.id
          AND event_co_organizers.user_id = auth.uid()
        )
      )
    )
  );

-- Policy for event organizers to delete RSVPs
CREATE POLICY "Enable delete for event organizers" ON event_rsvps
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_rsvps.event_id
      AND (events.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM event_co_organizers
          WHERE event_co_organizers.event_id = events.id
          AND event_co_organizers.user_id = auth.uid()
        )
      )
    )
  );

-- Policy for participants to read their own RSVPs
CREATE POLICY "Enable read access for event participants" ON event_rsvps
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_rsvps.event_id
      AND NOT events.is_private
    )
  );

-- Policy for participants to manage their own RSVPs
CREATE POLICY "Enable self-management for participants" ON event_rsvps
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid()); 