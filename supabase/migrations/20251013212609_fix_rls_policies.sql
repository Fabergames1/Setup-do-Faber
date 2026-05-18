/*
  # Correção de políticas RLS

  1. Correções nas políticas
    - Adicionar WITH CHECK na política de UPDATE para fb_components
    - Adicionar WITH CHECK na política de UPDATE para profiles
    - Garantir que todas as policies estejam corretas

  2. Segurança
    - Policies seguem princípio de menor privilégio
    - Apenas o próprio usuário pode acessar seus dados
    - Todas as operações são validadas com auth.uid()
*/

-- Corrigir política de UPDATE para fb_components
DROP POLICY IF EXISTS "Users can update own components" ON fb_components;

CREATE POLICY "Users can update own components"
  ON fb_components
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Corrigir política de UPDATE para profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verificar se todas as tabelas antigas estão sendo usadas
-- Se não, podemos removê-las em uma migração futura
DO $$
BEGIN
  -- Apenas logging, sem modificações
  RAISE NOTICE 'Migration completed: RLS policies fixed';
END $$;
