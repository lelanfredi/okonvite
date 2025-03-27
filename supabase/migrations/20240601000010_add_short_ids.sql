-- Criar função para gerar ID curto
CREATE OR REPLACE FUNCTION generate_short_id(size INT DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT := 0;
  rand FLOAT;
BEGIN
  FOR i IN 1..size LOOP
    -- Gerar número aleatório entre 0 e 1
    rand := random();
    -- Multiplicar pelo tamanho da string de caracteres e arredondar para baixo
    result := result || substr(chars, floor(rand * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Adicionar coluna short_id na tabela events
ALTER TABLE events ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- Criar trigger para gerar short_id automaticamente
CREATE OR REPLACE FUNCTION set_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  attempts INT := 0;
  max_attempts INT := 10;
BEGIN
  LOOP
    -- Gerar novo ID curto
    new_short_id := generate_short_id(8);
    
    -- Verificar se já existe
    IF NOT EXISTS (SELECT 1 FROM events WHERE short_id = new_short_id) THEN
      NEW.short_id := new_short_id;
      RETURN NEW;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Não foi possível gerar um short_id único após % tentativas', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_short_id
  BEFORE INSERT ON events
  FOR EACH ROW
  WHEN (NEW.short_id IS NULL)
  EXECUTE FUNCTION set_short_id();

-- Gerar short_ids para eventos existentes
UPDATE events SET short_id = generate_short_id(8) WHERE short_id IS NULL; 