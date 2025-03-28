-- Forçar atualização do schema do PostgREST
BEGIN;

-- Recriar a tabela temporariamente para forçar atualização do schema
CREATE TABLE event_rsvps_new (LIKE event_rsvps INCLUDING ALL);
INSERT INTO event_rsvps_new SELECT * FROM event_rsvps;
DROP TABLE event_rsvps;
ALTER TABLE event_rsvps_new RENAME TO event_rsvps;

-- Garantir que a trigger está correta
DROP TRIGGER IF EXISTS set_event_rsvps_updated_at ON event_rsvps;
CREATE TRIGGER set_event_rsvps_updated_at
    BEFORE UPDATE ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_event_rsvps_updated_at();

-- Forçar atualização do schema cache
ALTER TABLE event_rsvps ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());
NOTIFY pgrst, 'reload schema';

-- Recriar as políticas de segurança
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Política para event organizers
CREATE POLICY "Enable read access for event organizers" ON event_rsvps
    FOR SELECT USING (
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

CREATE POLICY "Enable insert for event organizers" ON event_rsvps
    FOR INSERT WITH CHECK (
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

CREATE POLICY "Enable update for event organizers" ON event_rsvps
    FOR UPDATE USING (
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

CREATE POLICY "Enable delete for event organizers" ON event_rsvps
    FOR DELETE USING (
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

-- Política para participantes
CREATE POLICY "Enable read access for event participants" ON event_rsvps
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_rsvps.event_id
            AND NOT events.is_private
        )
    );

CREATE POLICY "Enable self-management for participants" ON event_rsvps
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE event_rsvps;

COMMIT; 