-- Garantir que a coluna updated_at existe e está configurada corretamente
DO $$ 
BEGIN
    -- Verificar se a coluna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'event_rsvps' 
        AND column_name = 'updated_at'
    ) THEN
        -- Adicionar a coluna se não existir
        ALTER TABLE event_rsvps 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Atualizar a coluna para ter o valor padrão correto
    ALTER TABLE event_rsvps 
    ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());

    -- Atualizar registros existentes que têm updated_at NULL
    UPDATE event_rsvps 
    SET updated_at = created_at 
    WHERE updated_at IS NULL;

    -- Criar ou atualizar a trigger para manter updated_at atualizado
    CREATE OR REPLACE FUNCTION update_event_rsvps_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Remover a trigger se já existir
    DROP TRIGGER IF EXISTS set_event_rsvps_updated_at ON event_rsvps;

    -- Criar a trigger
    CREATE TRIGGER set_event_rsvps_updated_at
        BEFORE UPDATE ON event_rsvps
        FOR EACH ROW
        EXECUTE FUNCTION update_event_rsvps_updated_at();

END $$; 