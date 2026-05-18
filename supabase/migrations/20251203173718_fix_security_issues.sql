/*
  # Correção de Problemas de Segurança

  1. Adiciona índices faltantes para foreign keys
  2. Otimiza políticas RLS usando (select auth.uid()) para melhor performance
  3. Ajusta search_path das funções para ser imutável
  4. Remove índices não utilizados

  ## Mudanças:
  - Adiciona índice em `fb_components(user_id)` e `fb_history(user_id)`
  - Atualiza todas as políticas RLS para usar (select auth.uid())
  - Define search_path como IMMUTABLE nas funções
  - Melhora performance de queries com RLS em escala
*/

-- ========================================
-- 1. Adicionar índices para foreign keys
-- ========================================

-- Índice para fb_components(user_id)
CREATE INDEX IF NOT EXISTS idx_fb_components_user_id ON fb_components(user_id);

-- Índice para fb_history(user_id)
CREATE INDEX IF NOT EXISTS idx_fb_history_user_id ON fb_history(user_id);

-- Índice para fb_history(component_id)
CREATE INDEX IF NOT EXISTS idx_fb_history_component_id ON fb_history(component_id);

-- Índice para components(user_id) - tabela legada
CREATE INDEX IF NOT EXISTS idx_components_user_id ON components(user_id);

-- Índice para profiles(user_id)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ========================================
-- 2. Otimizar políticas RLS com (select auth.uid())
-- ========================================

-- Tabela: users
DROP POLICY IF EXISTS "Users - Only self" ON users;
DROP POLICY IF EXISTS "Users - Update self" ON users;

CREATE POLICY "Users - Only self"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users - Update self"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Tabela: profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Tabela: components (legada)
DROP POLICY IF EXISTS "Users can manage their own components" ON components;

CREATE POLICY "Users can manage their own components"
  ON components FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Tabela: fb_components
DROP POLICY IF EXISTS "Users can read own components" ON fb_components;
DROP POLICY IF EXISTS "Users can insert own components" ON fb_components;
DROP POLICY IF EXISTS "Users can update own components" ON fb_components;
DROP POLICY IF EXISTS "Users can delete own components" ON fb_components;

CREATE POLICY "Users can read own components"
  ON fb_components FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own components"
  ON fb_components FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own components"
  ON fb_components FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own components"
  ON fb_components FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Tabela: fb_history
DROP POLICY IF EXISTS "Users can read own history" ON fb_history;
DROP POLICY IF EXISTS "Users can insert own history" ON fb_history;

CREATE POLICY "Users can read own history"
  ON fb_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own history"
  ON fb_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ========================================
-- 3. Corrigir search_path das funções
-- ========================================

-- Recriar função update_updated_at_column com search_path IMMUTABLE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar função update_profiles_updated_at com search_path IMMUTABLE
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar função create_profile_on_signup com search_path IMMUTABLE
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar função handle_new_user com search_path IMMUTABLE
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;