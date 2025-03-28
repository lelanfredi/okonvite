-- Criar tabela events se não existir
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_date DATE NOT NULL,
    time TIME NOT NULL,
    start_time TIME,
    end_time TIME,
    timezone TEXT DEFAULT 'UTC',
    location TEXT,
    max_capacity INTEGER,
    image_url TEXT,
    event_type TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_temporary BOOLEAN DEFAULT false,
    short_id TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- Criar função para limpar eventos temporários antigos
CREATE OR REPLACE FUNCTION cleanup_temporary_events() RETURNS void AS $$
BEGIN
  -- Deletar eventos temporários com mais de 24 horas
  DELETE FROM events 
  WHERE is_temporary = true 
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Criar um job para executar a limpeza diariamente
SELECT cron.schedule(
  'cleanup-temporary-events',   -- nome único para o job
  '0 0 * * *',                 -- executar à meia-noite todos os dias
  'SELECT cleanup_temporary_events()'
); 