import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Configuração Supabase:');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          display_name?: string;
        };
        Update: {
          display_name?: string;
        };
      };
      fb_components: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          price: number;
          url: string;
          image_url: string;
          description: string;
          priority: number;
          purchased: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          category?: string;
          price?: number;
          url?: string;
          image_url?: string;
          description?: string;
          priority?: number;
          purchased?: boolean;
        };
        Update: {
          name?: string;
          category?: string;
          price?: number;
          url?: string;
          image_url?: string;
          description?: string;
          priority?: number;
          purchased?: boolean;
        };
      };
      fb_history: {
        Row: {
          id: string;
          user_id: string;
          component_id: string;
          action: string;
          old_data: any;
          new_data: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          component_id: string;
          action: string;
          old_data?: any;
          new_data?: any;
        };
      };
    };
  };
};

export type Component = Database['public']['Tables']['fb_components']['Row'];
export type ComponentInsert = Database['public']['Tables']['fb_components']['Insert'];
export type ComponentUpdate = Database['public']['Tables']['fb_components']['Update'];
export type HistoryEntry = Database['public']['Tables']['fb_history']['Row'];