/*
  # Setup do Faber - Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `display_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `fb_components`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `category` (text)
      - `price` (decimal)
      - `url` (text)
      - `image_url` (text)
      - `description` (text)
      - `priority` (integer)
      - `purchased` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `fb_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `component_id` (uuid, references fb_components)
      - `action` (text)
      - `old_data` (jsonb)
      - `new_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - History table: SELECT/INSERT only
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fb_components table
CREATE TABLE IF NOT EXISTS fb_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'outros',
  price decimal(10,2) DEFAULT 0,
  url text DEFAULT '',
  image_url text DEFAULT '',
  description text DEFAULT '',
  priority integer DEFAULT 1,
  purchased boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fb_history table
CREATE TABLE IF NOT EXISTS fb_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  component_id uuid REFERENCES fb_components(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Components policies
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

-- History policies (SELECT/INSERT only)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fb_components_user_id ON fb_components(user_id);
CREATE INDEX IF NOT EXISTS idx_fb_components_category ON fb_components(category);
CREATE INDEX IF NOT EXISTS idx_fb_history_user_id ON fb_history(user_id);
CREATE INDEX IF NOT EXISTS idx_fb_history_component_id ON fb_history(component_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fb_components_updated_at
  BEFORE UPDATE ON fb_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();