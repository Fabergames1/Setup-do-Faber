import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  LogOut,
  Package,
  CheckCircle,
  Clock,
  Download,
  History as HistoryIcon,
  Search,
  Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComponents } from '../hooks/useComponents';

// Importação direta para evitar problemas de lazy loading
import ComponentCard from './ComponentCard';
import AddComponentForm from './AddComponentForm';
import EvernoteBatchImport from './EvernoteBatchImport';
import History from './History';

// Skeleton para cards de componentes
const ComponentSkeleton = () => (
  <div className="tech-card bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 sm:p-4 animate-pulse">
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-slate-700 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3 sm:h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-2 sm:h-3 bg-slate-700 rounded w-1/2"></div>
        <div className="h-2 sm:h-3 bg-slate-700 rounded w-full"></div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-700 rounded"></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-700 rounded"></div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    components,
    loading,
    operationLoading,
    totalPrice,
    initialized
  } = useComponents();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('loginToastShown');
    if (!alreadyShown && user) {
      sessionStorage.setItem('loginToastShown', 'true');
    }
  }, [user]);

  const categories = [
    { value: 'all', label: 'Todos', icon: '📦' },
    { value: 'cpu', label: 'CPU', icon: '🔲' },
    { value: 'gpu', label: 'GPU', icon: '🎮' },
    { value: 'ram', label: 'RAM', icon: '💾' },
    { value: 'storage', label: 'Storage', icon: '💿' },
    { value: 'motherboard', label: 'Placa-Mãe', icon: '🖥️' },
    { value: 'psu', label: 'Fonte', icon: '⚡' },
    { value: 'case', label: 'Gabinete', icon: '📦' },
    { value: 'cooler', label: 'Cooler', icon: '❄️' },
    { value: 'monitor', label: 'Monitor', icon: '🖥️' },
    { value: 'peripherals', label: 'Periféricos', icon: '⌨️' },
    { value: 'outros', label: 'Outros', icon: '🔧' }
  ];

  const filteredComponents = components.filter(component => {
    const matchesCategory =
      selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogout = async () => {
    await signOut();
    sessionStorage.removeItem('loginToastShown');
  };

  // Mostrar skeleton durante carregamento inicial
  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Header skeleton */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="h-6 sm:h-8 lg:h-10 bg-slate-700 rounded w-48 sm:w-64 mb-2 animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-700 rounded w-32 sm:w-48 animate-pulse"></div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-800 p-2 sm:p-3 lg:p-4 rounded-xl animate-pulse">
                <div className="h-4 sm:h-5 lg:h-6 bg-slate-700 rounded w-3/4 mb-1 sm:mb-2"></div>
                <div className="h-5 sm:h-6 lg:h-8 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Components skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ComponentSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-3 sm:mb-4 lg:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold flex items-center gap-2">
                <Monitor className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0" />
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent truncate">
                  Setup do Faber
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 truncate">
                Bem-vindo, {user?.user_metadata?.display_name || user?.email}
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(true)}
                className="p-2 sm:p-3 bg-slate-700 rounded-xl hover:bg-slate-600 flex-1 sm:flex-none transition-colors"
                title="Histórico"
              >
                <HistoryIcon size={16} className="sm:w-5 sm:h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 sm:p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex-1 sm:flex-none transition-colors"
                title="Sair"
              >
                <LogOut size={16} className="sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6"
        >
          <StatCard title="Total" value={components.length} icon={<Package size={16} className="sm:w-5 sm:h-5" />} />
          <StatCard title="Comprados" value={components.filter(c => c.purchased).length} icon={<CheckCircle size={16} className="sm:w-5 sm:h-5" />} />
          <StatCard title="Pendentes" value={components.filter(c => !c.purchased).length} icon={<Clock size={16} className="sm:w-5 sm:h-5" />} />
          <StatCard
            title="Valor Total"
            value={
              typeof totalPrice === 'number'
                ? totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'R$ 0,00'
            }
            icon={<span className="text-green-400 font-bold text-xs sm:text-sm">R$</span>}
          />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4 overflow-x-auto pb-2"
        >
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <span className="hidden sm:inline">{cat.icon} </span>{cat.label}
            </button>
          ))}
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 sm:w-4 sm:h-4" size={14} />
            <input
              type="text"
              placeholder="Buscar componente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1 sm:gap-1.5 bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex-1 lg:flex-none justify-center text-xs sm:text-sm hover:bg-green-700 transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={14} className="sm:w-4 sm:h-4" /> 
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1 sm:gap-1.5 bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex-1 lg:flex-none justify-center text-xs sm:text-sm hover:bg-purple-700 transition-colors"
              onClick={() => setShowBatchImport(true)}
            >
              <Download size={14} className="sm:w-4 sm:h-4" /> 
              <span className="hidden sm:inline">Importar</span>
              <span className="sm:hidden">Import</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4"
        >
          {filteredComponents.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <Package className="text-slate-600 mx-auto mb-3 sm:mb-4 w-9 h-9 sm:w-12 sm:h-12" />
              <p className="text-slate-400 text-base sm:text-lg mb-2">Nenhum componente encontrado</p>
              <p className="text-slate-500 text-xs sm:text-sm">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione seu primeiro componente para começar'
                }
              </p>
            </div>
          ) : (
            filteredComponents.map((component, index) => (
              <motion.div
                key={component.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <ComponentCard component={component} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <AddComponentForm isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
      <EvernoteBatchImport isOpen={showBatchImport} onClose={() => setShowBatchImport(false)} />
      <History isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
};

export default Dashboard;

const StatCard = ({
  title,
  value,
  icon
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-slate-800 p-2 sm:p-3 lg:p-4 rounded-xl flex items-center gap-2 sm:gap-3 lg:gap-4 hover:bg-slate-700/50 transition-colors">
    <div className="text-blue-400 flex-shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-slate-300 text-xs sm:text-sm leading-tight truncate">{title}</p>
      <h2 className="text-sm sm:text-lg lg:text-xl font-bold truncate">{value}</h2>
    </div>
  </div>
);