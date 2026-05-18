import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Inicializando autenticação...');

        // Verificar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log('📋 Sessão:', session?.user?.email || 'Nenhuma');

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth event:', event);

        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setLoading(false);
        } else if (session?.user) {
          setUser(session.user);
          setLoading(false);

          // Criar perfil se necessário (silenciosamente) em background
          if (event === 'SIGNED_IN') {
            (async () => {
              try {
                await supabase
                  .from('profiles')
                  .upsert({
                    user_id: session.user.id,
                    email: session.user.email || '',
                    display_name: session.user.user_metadata?.display_name ||
                                 session.user.email?.split('@')[0] ||
                                 'Usuário'
                  }, { onConflict: 'user_id' });
              } catch (error) {
                console.error('Erro ao criar perfil:', error);
              }
            })();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    if (!email?.trim() || !password?.trim()) {
      toast.error('Email e senha são obrigatórios');
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error('Erro ao fazer login');
        }
        return false;
      }

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      toast.error('Erro inesperado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<boolean> => {
    if (!email?.trim() || !password?.trim() || !displayName?.trim()) {
      toast.error('Todos os campos são obrigatórios');
      return false;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            display_name: displayName.trim()
          }
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error('Erro no cadastro');
        }
        return false;
      }

      toast.success('Conta criada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado no cadastro:', error);
      toast.error('Erro inesperado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout:', error);
        toast.error('Erro ao sair');
        return false;
      }

      toast.success('Logout realizado!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error);
      toast.error('Erro no logout');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};