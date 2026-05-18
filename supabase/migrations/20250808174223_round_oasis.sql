/*
  # Adicionar constraint de email único na tabela profiles

  1. Constraint
    - Adiciona constraint UNIQUE na coluna email da tabela profiles
    - Garante que não haverá emails duplicados no banco de dados
  
  2. Segurança
    - Validação a nível de banco de dados
    - Previne inserções duplicadas mesmo que o frontend falhe
*/

-- Primeiro, remover possíveis duplicatas existentes (manter apenas a primeira ocorrência)
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id 
  FROM profiles 
  WHERE email IS NOT NULL 
  ORDER BY email, created_at ASC
);

-- Adicionar constraint de email único
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_email_unique' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
END $$;

-- Criar índice para melhorar performance das consultas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);