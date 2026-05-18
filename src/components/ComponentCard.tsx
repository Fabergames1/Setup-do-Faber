import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { Component } from '../lib/supabase';
import { useComponents } from '../hooks/useComponents';
import clsx from 'clsx';

interface ComponentCardProps {
  component: Component;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  const { updateComponent, deleteComponent, operationLoading } = useComponents();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: component.name,
    description: component.description,
    price: component.price.toString(),
    priority: component.priority,
    url: component.url || '',
    image_url: component.image_url || '',
  });
  const [imagePreview, setImagePreview] = useState<string>(component.image_url || '');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const categoryIcons: Record<string, string> = {
    cpu: '🔲',
    gpu: '🎮',
    ram: '💾',
    storage: '💿',
    motherboard: '🖥️',
    psu: '⚡',
    case: '📦',
    cooler: '❄️',
    monitor: '🖥️',
    peripherals: '⌨️',
    outros: '🔧',
  };

  const priorityColors: Record<number, string> = {
    1: 'bg-green-500',
    2: 'bg-yellow-500',
    3: 'bg-orange-500',
    4: 'bg-red-500',
  };

  const handleTogglePurchased = async () => {
    await updateComponent(component.id, { purchased: !component.purchased });
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar este componente?')) {
      await deleteComponent(component.id);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const success = await updateComponent(component.id, {
        name: editData.name,
        description: editData.description,
        price: parseFloat(editData.price) || 0,
        priority: editData.priority,
        url: editData.url,
        image_url: editData.image_url,
      });
      if (success) {
        setIsEditing(false);
        setEditData({
          name: component.name,
          description: component.description,
          price: component.price.toString(),
          priority: component.priority,
          url: component.url || '',
          image_url: component.image_url || '',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: component.name,
      description: component.description,
      price: component.price.toString(),
      priority: component.priority,
      url: component.url || '',
      image_url: component.image_url || '',
    });
    setImagePreview(component.image_url || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'tech-card bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 sm:p-4 transition-all',
        component.purchased && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
          {component.image_url ? (
            <img
              src={component.image_url}
              alt={component.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl sm:text-2xl">
              {categoryIcons[component.category] || '🔧'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-2 py-1 bg-slate-700 text-white rounded text-sm"
                placeholder="Nome"
              />
              <textarea
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs resize-none"
                placeholder="Descrição"
                rows={2}
              />
              <input
                type="number"
                value={editData.price}
                onChange={e => setEditData({ ...editData, price: e.target.value })}
                className="w-full px-2 py-1 bg-slate-700 text-white rounded text-sm"
                placeholder="Preço"
                step="0.01"
              />
              <select
                value={editData.priority}
                onChange={e => setEditData({ ...editData, priority: parseInt(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-700 text-white rounded text-sm"
              >
                <option value={1}>🟢 Baixa</option>
                <option value={2}>🟡 Média</option>
                <option value={3}>🔴 Alta</option>
                <option value={4}>⚡ Urgente</option>
              </select>
              <input
                type="url"
                value={editData.url}
                onChange={e => setEditData({ ...editData, url: e.target.value })}
                className="w-full px-2 py-1 bg-slate-700 text-white rounded text-sm"
                placeholder="Link do produto"
              />
              <div>
                {imagePreview && (
                  <div className="mb-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded border border-slate-600"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        setImagePreview(result);
                        setEditData({ ...editData, image_url: result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400"
                />
                <input
                  type="text"
                  value={editData.image_url}
                  onChange={e => {
                    setEditData({ ...editData, image_url: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs mt-1"
                  placeholder="URL da imagem"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={operationLoading}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                  {component.name}
                </h3>
                <div
                  className={clsx(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    priorityColors[component.priority] || 'bg-slate-500'
                  )}
                  title={`Prioridade ${component.priority}`}
                />
              </div>

              <p className="text-xs sm:text-sm text-slate-400 mb-2 line-clamp-2">
                {component.description || 'Sem descrição'}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-green-400">
                  {component.price > 0
                    ? component.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : 'Sem preço'}
                </span>

                <div className="flex items-center gap-1">
                  {component.url && (
                    <a
                      href={component.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                      title="Abrir link"
                    >
                      <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                    </a>
                  )}

                  <button
                    onClick={handleTogglePurchased}
                    disabled={operationLoading}
                    className={clsx(
                      'p-1.5 sm:p-2 rounded transition-colors disabled:opacity-50',
                      component.purchased
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-600 hover:bg-slate-500'
                    )}
                    title={component.purchased ? 'Comprado' : 'Marcar como comprado'}
                  >
                    {component.purchased ? (
                      <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                    ) : (
                      <Clock size={14} className="sm:w-4 sm:h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={operationLoading}
                    className="p-1.5 sm:p-2 bg-yellow-600 rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    title="Editar"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={operationLoading}
                    className="p-1.5 sm:p-2 bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                    title="Deletar"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ComponentCard;
