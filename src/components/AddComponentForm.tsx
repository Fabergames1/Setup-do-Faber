// AddComponentForm.tsx
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2, Image, AlertCircle } from 'lucide-react';
import { useComponents } from '../hooks/useComponents';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface AddComponentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddComponentForm: React.FC<AddComponentFormProps> = ({ isOpen, onClose }) => {
  const { addComponent, operationLoading } = useComponents();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'outros',
    price: '',
    url: '',
    description: '',
    priority: 1,
    image_url: ''
  });

  const categories = [
    { value: 'cpu', label: 'CPU' },
    { value: 'gpu', label: 'GPU' },
    { value: 'ram', label: 'RAM' },
    { value: 'storage', label: 'Storage' },
    { value: 'motherboard', label: 'Placa-Mãe' },
    { value: 'psu', label: 'Fonte' },
    { value: 'case', label: 'Gabinete' },
    { value: 'cooler', label: 'Cooler' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'peripherals', label: 'Periféricos' },
    { value: 'outros', label: 'Outros' }
  ];

  /**
   * 🔹 Fecha modal e reseta formulário
   */
  const handleClose = useCallback(() => {
    setFormData({
      name: '',
      category: 'outros',
      price: '',
      url: '',
      description: '',
      priority: 1,
      image_url: ''
    });
    setUploadProgress(0);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  }, [onClose]);

  /**
   * 🔹 Upload da imagem com compressão
   */
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Selecione apenas arquivos de imagem');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Imagem muito grande (máx 10MB)');
      }

      setUploadProgress(5);
      toast.loading('Preparando imagem...', { id: 'image-upload' });

      try {
        setUploadProgress(15);
        toast.loading('Comprimindo imagem...', { id: 'image-upload' });

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1000,
          useWebWorker: false,
          fileType: file.type,
          initialQuality: 0.8
        });

        setUploadProgress(50);
        toast.loading('Enviando imagem...', { id: 'image-upload' });

        const fileExtension = compressedFile.type.split('/')[1] || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

        setUploadProgress(60);

        const { data, error } = await supabase.storage
          .from('component-images')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: compressedFile.type
          });

        if (error) {
          console.error('Erro no upload - detalhes:', error);

          if (error.message?.includes('Bucket not found')) {
            throw new Error('Bucket de armazenamento não configurado. Contate o administrador.');
          }

          throw new Error(`Erro ao enviar imagem: ${error.message || 'Erro desconhecido'}`);
        }

        if (!data?.path) {
          throw new Error('Imagem enviada mas sem caminho retornado');
        }

        setUploadProgress(85);
        toast.loading('Finalizando...', { id: 'image-upload' });

        const { data: publicUrlData } = supabase.storage
          .from('component-images')
          .getPublicUrl(fileName);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Erro ao gerar URL pública da imagem');
        }

        setUploadProgress(100);
        toast.success('Imagem enviada com sucesso!', { id: 'image-upload' });
        return publicUrlData.publicUrl;
      } catch (error) {
        console.error('Erro na compressão/upload:', error);
        toast.dismiss('image-upload');
        throw error;
      }
    },
    [user?.id]
  );

  /**
   * 🔹 Submissão do formulário
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      if (operationLoading || uploading) {
        return;
      }

      try {
        setUploading(true);
        setUploadProgress(0);

        let imageUrl = formData.image_url;
        const file = fileInputRef.current?.files?.[0];

        if (file) {
          try {
            imageUrl = await handleImageUpload(file);
          } catch (uploadError: any) {
            console.error('Erro no upload:', uploadError);
            toast.error(uploadError.message || 'Erro ao fazer upload da imagem');
            setUploading(false);
            setUploadProgress(0);
            return;
          }
        }

        toast.loading('Salvando componente...', { id: 'save-component' });

        const success = await addComponent({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : 0,
          image_url: imageUrl
        });

        if (success) {
          toast.dismiss('save-component');
          handleClose();
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Erro ao adicionar componente');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [formData, addComponent, handleImageUpload, handleClose, operationLoading, uploading]
  );

  /**
   * 🔹 Atualiza campos
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  /**
   * 🔹 Preview da imagem selecionada
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Selecione apenas arquivos de imagem');
        e.target.value = '';
      }
    } else {
      setImagePreview('');
    }
  }, []);

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Adicionar Componente</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: RTX 4080 Super"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  URL do Produto
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Imagem do Produto
                </label>
                
                {/* Preview da imagem */}
                {(imagePreview || formData.image_url) && (
                  <div className="mb-3">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-600"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-600 file:text-white hover:file:bg-slate-500 transition-colors"
                />
                
                <p className="text-xs text-slate-400 mt-1">
                  Formatos aceitos: JPG, PNG, WebP, GIF (máx 10MB)
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descrição do componente..."
                />
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prioridade
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>🟢 Baixa</option>
                  <option value={2}>🟡 Média</option>
                  <option value={3}>🔴 Alta</option>
                  <option value={4}>⚡ Urgente</option>
                </select>
              </div>

              {/* Progresso de Upload */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>
                      {uploadProgress < 20 ? 'Preparando...' :
                       uploadProgress < 60 ? 'Comprimindo...' :
                       uploadProgress < 90 ? 'Enviando...' : 'Finalizando...'}
                    </span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-lg h-2 overflow-hidden">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <p className="text-xs text-slate-400">
                      Aguarde, processando imagem...
                    </p>
                  )}
                </div>
              )}

              {/* Mensagem de erro */}
              {!uploading && uploadProgress === 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertCircle size={14} />
                  <span>Certifique-se de que sua conexão com o Supabase está configurada</span>
                </div>
              )}

              {/* Progresso antigo - remover */}
              {false && uploading && (
                <div className="w-full bg-slate-700 rounded-lg h-2 overflow-hidden">
                  <motion.div
                    className="bg-blue-500 h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'linear', duration: 0.2 }}
                  />
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={operationLoading || uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {operationLoading || uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {uploading ? 'Enviando...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Adicionar
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(AddComponentForm);
