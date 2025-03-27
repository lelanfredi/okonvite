-- Criar tabela de co-organizadores
CREATE TABLE IF NOT EXISTS event_co_organizers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, user_id)
);

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_event_co_organizers_event_id ON event_co_organizers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_co_organizers_user_id ON event_co_organizers(user_id);

-- Habilitar RLS
ALTER TABLE event_co_organizers ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Criadores podem adicionar co-organizadores"
ON event_co_organizers FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM events
        WHERE id = event_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Criadores e co-organizadores podem ver co-organizadores"
ON event_co_organizers FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM events
        WHERE id = event_id
        AND (user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM event_co_organizers
            WHERE event_id = events.id
            AND user_id = auth.uid()
        ))
    )
);

CREATE POLICY "Criadores podem remover co-organizadores"
ON event_co_organizers FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM events
        WHERE id = event_id
        AND user_id = auth.uid()
    )
); 