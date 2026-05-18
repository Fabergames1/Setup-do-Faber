import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Importação direta para evitar problemas de lazy loading
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

// Componente de loading simples
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
      <p className="text-white text-sm">Carregando...</p>
    </div>
  </div>
);

// Tela de erro de configuração
const ConfigError = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
    <div className="bg-slate-800 border border-red-500/50 rounded-xl p-6 max-w-md text-center">
      <div className="text-red-400 text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-white mb-4">Configuração Necessária</h2>
      <p className="text-slate-300 mb-4">
        Configure o Supabase clicando no botão "Supabase" nas configurações.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Recarregar
      </button>
    </div>
  </div>
);

function App() {
  const { user, loading } = useAuth();
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      setConfigError(true);
    }
  }, []);

  // Mostrar erro de configuração
  if (configError) {
    return <ConfigError />;
  }

  // Mostrar loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Mostrar componente apropriado
  return (
    <>
      {user ? <Dashboard /> : <Auth />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
}

export default App;