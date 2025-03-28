-- Adicionar constraint para o campo status
ALTER TABLE event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_status_check;
ALTER TABLE event_rsvps ADD CONSTRAINT event_rsvps_status_check 
    CHECK (status IN ('confirmed', 'maybe', 'declined', 'pending'));

-- Atualizar registros existentes que possam ter valores inválidos
UPDATE event_rsvps SET status = 'pending' 
WHERE status NOT IN ('confirmed', 'maybe', 'declined', 'pending');

-- Atualizar o schema cache do PostgREST
NOTIFY pgrst, 'reload schema'; 