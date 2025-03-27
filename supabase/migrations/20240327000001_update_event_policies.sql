-- Habilitar RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Eventos públicos são visíveis para todos" ON events;
DROP POLICY IF EXISTS "Criadores e co-organizadores podem ver eventos privados" ON events;
DROP POLICY IF EXISTS "Criadores e co-organizadores podem atualizar eventos" ON events;
DROP POLICY IF EXISTS "Apenas o criador pode deletar eventos" ON events;
DROP POLICY IF EXISTS "Usuários autenticados podem criar eventos" ON events;

-- Política para criar eventos (qualquer usuário autenticado)
CREATE POLICY "Usuários autenticados podem criar eventos"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para visualizar eventos públicos
CREATE POLICY "Eventos públicos são visíveis para todos"
ON events FOR SELECT
TO public
USING (is_private = false);

-- Política para visualizar eventos privados (apenas para o criador e co-organizadores)
CREATE POLICY "Criadores e co-organizadores podem ver eventos privados"
ON events FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM event_co_organizers
    WHERE event_id = events.id
    AND user_id = auth.uid()
  )
);

-- Política para atualizar eventos (apenas para o criador e co-organizadores)
CREATE POLICY "Criadores e co-organizadores podem atualizar eventos"
ON events FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM event_co_organizers
    WHERE event_id = events.id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM event_co_organizers
    WHERE event_id = events.id
    AND user_id = auth.uid()
  )
);

-- Política para deletar eventos (apenas para o criador)
CREATE POLICY "Apenas o criador pode deletar eventos"
ON events FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Criar função para gerar short_id
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.short_id := substr(md5(random()::text), 1, 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar coluna short_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' AND column_name = 'short_id') THEN
    ALTER TABLE events ADD COLUMN short_id TEXT;
  END IF;
END $$;

-- Remover constraint existente se houver
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'events_short_id_unique') THEN
    ALTER TABLE events DROP CONSTRAINT events_short_id_unique;
  END IF;
END $$;

-- Garantir que o short_id seja único
ALTER TABLE events
ADD CONSTRAINT events_short_id_unique UNIQUE (short_id);

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS set_short_id ON events;

-- Criar trigger para gerar short_id automaticamente
CREATE TRIGGER set_short_id
BEFORE INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION generate_short_id(); 