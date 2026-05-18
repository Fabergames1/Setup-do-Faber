/*
  # Criar estrutura completa para histórico de ações
  
  1. Novas Tabelas
    - `profiles` - Dados do usuário
    - `fb_components` - Componentes do usuário
    - `fb_history` - Histórico de ações (CREATE, UPDATE, DELETE)
  
  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas para cada usuário acessar apenas seus dados
    - Verificação de autenticação obrigatória
  
  3. Índices
    - user_id para queries rápidas
    - created_at para ordenação
    - component_id para referência
  
  4. Triggers
    - updated_at automático em tabelas que precisam
*/

-- Drop tables se existirem (em ordem de dependência)
DROP TABLE IF EXISTS fb_history CASCADE;
DROP TABLE IF EXISTS fb_components CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Criar tabela profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela fb_components
CREATE TABLE fb_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text DEFAULT 'outros',
  price decimal(10,2) DEFAULT 0,
  url text DEFAULT '',
  image_url text DEFAULT '',
  description text DEFAULT '',
  priority integer DEFAULT 1 CHECK (priority >= 1 AND priority <= 4),
  purchased boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela fb_history com JSONB para dados
CREATE TABLE fb_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id uuid REFERENCES fb_components(id) ON DELETE CASCADE,
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
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para fb_components
CREATE POLICY "components_select_own" ON fb_components FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "components_insert_own" ON fb_components FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "components_update_own" ON fb_components FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "components_delete_own" ON fb_components FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para fb_history
CREATE POLICY "history_select_own" ON fb_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "history_insert_own" ON fb_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_fb_components_user_id ON fb_components(user_id);
CREATE INDEX idx_fb_components_created_at ON fb_components(created_at);
CREATE INDEX idx_fb_history_user_id ON fb_history(user_id);
CREATE INDEX idx_fb_history_created_at ON fb_history(created_at);
CREATE INDEX idx_fb_history_component_id ON fb_history(component_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fb_components_updated_at
  BEFORE UPDATE ON fb_components FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
