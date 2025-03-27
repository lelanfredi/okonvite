-- Adicionar campos de horário na tabela events
ALTER TABLE events
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Atualizar os registros existentes
UPDATE events
SET start_time = time::TIME,
    timezone = COALESCE(timezone, 'UTC')
WHERE start_time IS NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN events.start_time IS 'Horário de início do evento';
COMMENT ON COLUMN events.end_time IS 'Horário de término do evento';
COMMENT ON COLUMN events.timezone IS 'Fuso horário do evento';

-- Garantir que os campos de data estejam corretamente configurados
ALTER TABLE events
ALTER COLUMN date SET NOT NULL,
ALTER COLUMN start_date SET NOT NULL,
ALTER COLUMN time SET NOT NULL;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time); 