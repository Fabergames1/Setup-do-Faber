import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, LogIn, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Submetendo formulário de autenticação...');
    
    // Prevenir múltiplas submissões
    if (loading) return;
    
    // Validações básicas
    if (!email.trim() || !password.trim()) {
      toast.error('Email e senha são obrigatórios');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      toast.error('Nome de usuário é obrigatório para cadastro');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (isLogin) {
      const success = await signIn(email, password);
      if (success) {
        console.log('✅ Redirecionando para dashboard...');
        // Toast já é mostrado no signIn
      }
    } else {
      const success = await signUp(email, password, displayName);
      if (success) {
        console.log('✅ Cadastro realizado, voltando para login...');
        // Limpar formulário e voltar para login após cadastro bem-sucedido
        setEmail('');
        setPassword('');
        setDisplayName('');
        setIsLogin(true);
      }
    }
    console.log('📝 Processamento do formulário concluído');
  };

  const tabVariants = {
    inactive: { backgroundColor: 'hsla(240, 5%, 15%, 0.5)', color: 'hsla(240, 5%, 70%, 1)' },
    active: { backgroundColor: 'hsla(210, 100%, 50%, 1)', color: 'hsla(0, 0%, 100%, 1)' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white">
              <Monitor className="w-3 h-3 sm:w-5 sm:h-5" strokeWidth={2.5} />
            </span>
            <span className="bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
              Setup do Faber
            </span>
          </div>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Gerencie seu setup dos sonhos</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="tech-card bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl"
        >
          <div className="flex bg-slate-800/50 rounded-lg p-1 mb-4 sm:mb-6">
            <motion.button
              type="button"
              onClick={() => setIsLogin(true)}
              variants={tabVariants}
              animate={isLogin ? 'active' : 'inactive'}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 text-sm sm:text-base"
            >
              <LogIn size={16} className="sm:w-[18px] sm:h-[18px]" />
              Login
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsLogin(false)}
              variants={tabVariants}
              animate={!isLogin ? 'active' : 'inactive'}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md font-medium transition-all duration-200 text-sm sm:text-base"
            >
              <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
              Cadastro
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div layout className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Nome de usuário"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    required={!isLogin}
                  />
                </motion.div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  required
                  minLength={6}
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.05 }}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={18} className="sm:w-5 sm:h-5" /> : <UserPlus size={18} className="sm:w-5 sm:h-5" />}
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;