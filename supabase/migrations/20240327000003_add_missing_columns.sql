-- Adicionar colunas faltantes na tabela events
DO $$ 
BEGIN
  -- Adicionar user_id se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' AND column_name = 'user_id') THEN
    ALTER TABLE events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Adicionar created_by se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' AND column_name = 'created_by') THEN
    ALTER TABLE events ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Adicionar índices se não existirem
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_user_id') THEN
    CREATE INDEX idx_events_user_id ON events(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_created_by') THEN
    CREATE INDEX idx_events_created_by ON events(created_by);
  END IF;
END $$; 