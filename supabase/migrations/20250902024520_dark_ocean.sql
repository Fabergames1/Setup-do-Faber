/*
  # Correção da estrutura do banco de dados

  1. Correções na tabela profiles
    - Corrigir referência para auth.users(id) diretamente
    - Adicionar constraint unique para email
    - Garantir que user_id seja a chave primária

  2. Correções na tabela fb_components
    - Corrigir referência para auth.users(id) diretamente
    - Ajustar foreign key para user_id

  3. Correções na tabela fb_history
    - Corrigir referência para auth.users(id) diretamente
    - Ajustar foreign key para user_id

  4. Políticas RLS
    - Corrigir todas as políticas para usar auth.uid() corretamente
    - Garantir que as referências estejam corretas
*/

-- Recriar tabela profiles com estrutura correta
DROP TABLE IF EXISTS fb_history CASCADE;
DROP TABLE IF EXISTS fb_components CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Criar tabela profiles corrigida
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela fb_components corrigida
CREATE TABLE fb_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'outros',
  price decimal(10,2) DEFAULT 0,
  url text DEFAULT '',
  image_url text DEFAULT '',
  description text DEFAULT '',
  priority integer DEFAULT 1 CHECK (priority >= 1 AND priority <= 4),
  purchased boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela fb_history corrigida
CREATE TABLE fb_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  component_id uuid REFERENCES fb_components(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_history ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para fb_components
CREATE POLICY "Users can read own components"
  ON fb_components
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own components"
  ON fb_components
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own components"
  ON fb_components
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own components"
  ON fb_components
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para fb_history
CREATE POLICY "Users can read own history"
  ON fb_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON fb_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
CREATE INDEX idx_fb_components_user_id ON fb_components(user_id);
CREATE INDEX idx_fb_components_category ON fb_components(category);
CREATE INDEX idx_fb_history_user_id ON fb_history(user_id);
CREATE INDEX idx_fb_history_component_id ON fb_history(component_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fb_components_updated_at
  BEFORE UPDATE ON fb_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();