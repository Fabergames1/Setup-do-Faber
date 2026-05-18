// history.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, X, Clock, Plus, CreditCard as Edit3, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface HistoryEntry {
  id: string;
  user_id: string;
  action: 'created' | 'updated' | 'deleted' | string;
  created_at: string;
  new_data?: Record<string, any>; // ✅ mais flexível
  old_data?: Record<string, any>;
}

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      console.log('📋 Buscando histórico para usuário:', user.id);

      const { data, error: fetchError } = await supabase
        .from('fb_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        console.error('❌ Erro ao buscar histórico:', fetchError);
        setError(fetchError.message || 'Erro ao carregar histórico');
        setHistory([]);
      } else {
        console.log('✅ Histórico carregado:', data?.length || 0, 'registros');
        setHistory(data || []);
        if (!data || data.length === 0) {
          setError(null);
        }
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setError('Erro inesperado ao carregar histórico');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, user?.id]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />;
      case 'updated': return <Edit3 className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />;
      case 'deleted': return <Trash2 className="text-red-400 w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <Clock className="text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created': return 'Criou';
      case 'updated': return 'Atualizou';
      case 'deleted': return 'Removeu';
      default: return 'Ação';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'border-green-500/30 bg-green-500/10';
      case 'updated': return 'border-blue-500/30 bg-blue-500/10';
      case 'deleted': return 'border-red-500/30 bg-red-500/10';
      default: return 'border-slate-600/30 bg-slate-700/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <HistoryIcon className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="text-lg sm:text-2xl font-bold text-white">Histórico de Ações</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchHistory}
                  disabled={loading}
                  className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Recarregar histórico"
                >
                  <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm sm:text-base font-medium mb-2">Erro ao carregar histórico</p>
                  <p className="text-slate-400 text-xs sm:text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : !user || history.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="text-slate-600 mx-auto mb-4 w-9 h-9 sm:w-12 sm:h-12" />
                <p className="text-slate-400 text-sm sm:text-base">
                  {!user
                    ? 'Você precisa estar logado para ver o histórico.'
                    : 'Nenhuma ação registrada ainda.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-3 sm:p-4 ${getActionColor(entry.action)}`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActionIcon(entry.action)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                          <span className="font-medium text-white text-sm sm:text-base">
                            {getActionText(entry.action)} componente
                          </span>
                          <span className="text-xs text-slate-400 self-start sm:self-auto">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>

                        {/* Dados do novo componente */}
                        {entry.new_data && (
                          <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3 mb-2">
                            <h4 className="font-medium text-white mb-1 text-sm sm:text-base">
                              {entry.new_data.name || 'Sem nome'}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300">
                              {entry.new_data.category && (
                                <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs self-start">
                                  {entry.new_data.category}
                                </span>
                              )}
                              {entry.new_data.price && (
                                <span className="text-green-400 font-medium">
                                  R$ {parseFloat(entry.new_data.price as any).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Alterações (update) */}
                        {entry.action === 'updated' && entry.old_data && entry.new_data && (
                          <div className="space-y-2 text-xs">
                            {(() => {
                              const changes: Array<{field: string; old: any; new: any; label: string}> = [];
                              const fieldsToCheck = ['name', 'description', 'price', 'priority', 'url', 'category', 'purchased'];

                              fieldsToCheck.forEach(field => {
                                if (entry.old_data[field] !== entry.new_data[field]) {
                                  changes.push({
                                    field,
                                    old: entry.old_data[field],
                                    new: entry.new_data[field],
                                    label: {
                                      name: 'Nome',
                                      description: 'Descrição',
                                      price: 'Preço',
                                      priority: 'Prioridade',
                                      url: 'Link',
                                      category: 'Categoria',
                                      purchased: 'Status'
                                    }[field] || field
                                  });
                                }
                              });

                              return changes.length > 0 ? (
                                changes.map((change, idx) => (
                                  <div key={idx} className="bg-slate-700/40 border border-slate-600/50 rounded p-2">
                                    <span className="text-slate-300 font-medium">{change.label}:</span>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                                        <span className="text-red-400 text-xs font-medium">De:</span>
                                        <div className="text-slate-300 text-xs truncate">
                                          {change.field === 'price'
                                            ? `R$ ${parseFloat(change.old as any).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
                                            : change.field === 'priority'
                                            ? ['', '🟢 Baixa', '🟡 Média', '🔴 Alta', '⚡ Urgente'][change.old] || change.old
                                            : change.field === 'purchased'
                                            ? (change.old ? 'Comprado' : 'Não comprado')
                                            : change.old || '—'
                                          }
                                        </div>
                                      </div>
                                      <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                                        <span className="text-green-400 text-xs font-medium">Para:</span>
                                        <div className="text-slate-300 text-xs truncate">
                                          {change.field === 'price'
                                            ? `R$ ${parseFloat(change.new as any).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
                                            : change.field === 'priority'
                                            ? ['', '🟢 Baixa', '🟡 Média', '🔴 Alta', '⚡ Urgente'][change.new] || change.new
                                            : change.field === 'purchased'
                                            ? (change.new ? 'Comprado' : 'Não comprado')
                                            : change.new || '—'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-slate-400 italic">Nenhuma alteração detectada</div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Deleção */}
                        {entry.action === 'deleted' && entry.old_data && (
                          <div className="bg-slate-700/50 rounded-lg p-2 sm:p-3">
                            <h4 className="font-medium text-red-400 mb-1 text-sm sm:text-base">
                              {entry.old_data.name || 'Sem nome'}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300">
                              {entry.old_data.category && (
                                <span className="bg-slate-600/50 text-slate-400 px-2 py-1 rounded text-xs self-start">
                                  {entry.old_data.category}
                                </span>
                              )}
                              {entry.old_data.price && (
                                <span className="text-slate-400">
                                  R$ {parseFloat(entry.old_data.price as any).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default History;
