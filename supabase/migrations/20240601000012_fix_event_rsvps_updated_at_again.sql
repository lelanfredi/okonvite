-- Recriar a coluna updated_at para garantir que ela esteja corretamente configurada
ALTER TABLE event_rsvps DROP COLUMN IF EXISTS updated_at;
ALTER TABLE event_rsvps ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Atualizar todos os registros existentes para ter um valor válido em updated_at
UPDATE event_rsvps SET updated_at = created_at WHERE updated_at IS NULL;

-- Recriar a trigger function
CREATE OR REPLACE FUNCTION update_event_rsvps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar a trigger
DROP TRIGGER IF EXISTS set_event_rsvps_updated_at ON event_rsvps;
CREATE TRIGGER set_event_rsvps_updated_at
    BEFORE UPDATE ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_event_rsvps_updated_at();

-- Atualizar o schema cache do PostgREST
NOTIFY pgrst, 'reload schema'; 