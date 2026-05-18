import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase, Component, ComponentInsert, ComponentUpdate } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function useComponents() {
  const { user } = useAuth();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  /**
   * Buscar todos os componentes do usuário
   */
  const fetchComponents = useCallback(async () => {
    if (!user?.id) {
      console.log('👤 Usuário não autenticado, limpando componentes');
      setComponents([]);
      setLoading(false);
      setInitialized(true);
      return;
    }

    console.log('📦 Buscando componentes do usuário:', user.id);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('fb_components')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar componentes:', error);
        // Não mostrar toast de erro se for problema de configuração
        if (!error.message.includes('fetch')) {
          toast.error('Erro ao carregar componentes');
        }
        setComponents([]);
      } else {
        console.log('✅ Componentes carregados:', data?.length || 0);
        setComponents(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      // Não mostrar toast se for erro de rede/configuração
      setComponents([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user?.id]);

  useEffect(() => {
    // Sempre buscar componentes quando user mudar, mas evitar loops
    if (user?.id) {
      console.log('🔄 Usuário mudou, buscando componentes...');
      fetchComponents();
    } else if (!user?.id) {
      console.log('🚫 Usuário deslogado, limpando componentes');
      setComponents([]);
      setLoading(false);
      setInitialized(true);
    }
  }, [user?.id, fetchComponents]);

  /**
   * Adicionar componente
   */
  const addComponent = async (component: ComponentInsert): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (!component.name?.trim()) {
      toast.error('Nome do componente é obrigatório');
      return false;
    }

    setOperationLoading(true);

    try {
      const componentData = {
        ...component,
        user_id: user.id,
        name: component.name.trim(),
        description: component.description?.trim() || '',
        url: component.url?.trim() || '',
        image_url: component.image_url?.trim() || '',
        price: Number(component.price) || 0,
        priority: Number(component.priority) || 1,
        category: component.category || 'outros',
        purchased: Boolean(component.purchased),
      };

      // Inserção otimista
      const tempComponent: Component = {
        ...componentData,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setComponents(prev => [tempComponent, ...prev]);

      const { data, error } = await supabase
        .from('fb_components')
        .insert(componentData)
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao inserir componente:', error);
        setComponents(prev => prev.filter(c => c.id !== tempComponent.id));
        toast.error(`Erro ao adicionar componente: ${error?.message || 'Erro desconhecido'}`);
        return false;
      }

      const newComponent = data;
      setComponents(prev =>
        prev.map(c => (c.id === tempComponent.id ? newComponent : c))
      );

      toast.success('Componente adicionado!');

      const { error: historyError } = await supabase
        .from('fb_history')
        .insert({
          user_id: user.id,
          component_id: newComponent.id,
          action: 'created',
          new_data: newComponent,
        });

      if (historyError) {
        console.error('❌ Erro ao registrar histórico (criar):', historyError);
      } else {
        console.log('✅ Histórico registrado: componente criado');
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao adicionar:', error);
      setComponents(prev => prev.filter(c => !c.id.toString().startsWith('temp-')));
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * Atualizar componente
   */
  const updateComponent = async (
    id: string,
    updates: ComponentUpdate
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    const oldComponent = components.find(c => c.id === id);
    if (!oldComponent) {
      toast.error('Componente não encontrado');
      return false;
    }

    setOperationLoading(true);

    try {
      const updateData: ComponentUpdate = {
        ...updates,
        name: updates.name?.trim() ?? oldComponent.name,
        description: updates.description?.trim() ?? oldComponent.description,
        url: updates.url?.trim() ?? oldComponent.url,
        image_url: updates.image_url?.trim() ?? oldComponent.image_url,
      };

      // Inserção otimista
      const optimisticComponent = { ...oldComponent, ...updateData };
      setComponents(prev =>
        prev.map(c => (c.id === id ? optimisticComponent : c))
      );

      const { data, error } = await supabase
        .from('fb_components')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error || !data) {
        console.error('Erro ao atualizar componente:', error);
        setComponents(prev => prev.map(c => (c.id === id ? oldComponent : c)));
        toast.error(`Erro ao atualizar componente: ${error?.message || 'Erro desconhecido'}`);
        return false;
      }

      const updatedComponent = data;
      setComponents(prev =>
        prev.map(c => (c.id === id ? updatedComponent : c))
      );

      toast.success('Componente atualizado!');

      const { error: historyError } = await supabase
        .from('fb_history')
        .insert({
          user_id: user.id,
          component_id: id,
          action: 'updated',
          old_data: oldComponent,
          new_data: updatedComponent,
        });

      if (historyError) {
        console.error('❌ Erro ao registrar histórico (atualizar):', historyError);
      } else {
        console.log('✅ Histórico registrado: componente atualizado');
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar:', error);
      setComponents(prev => prev.map(c => (c.id === id ? oldComponent : c)));
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * Deletar componente
   */
  const deleteComponent = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    const componentToDelete = components.find(c => c.id === id);
    if (!componentToDelete) {
      toast.error('Componente não encontrado');
      return false;
    }

    setOperationLoading(true);

    try {
      // Remoção otimista
      setComponents(prev => prev.filter(c => c.id !== id));

      const { error } = await supabase
        .from('fb_components')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar componente:', error);
        setComponents(prev => [...prev, componentToDelete]);
        toast.error(`Erro ao deletar componente: ${error.message}`);
        return false;
      }

      toast.success('Componente removido!');

      const { error: historyError } = await supabase
        .from('fb_history')
        .insert({
          user_id: user.id,
          component_id: id,
          action: 'deleted',
          old_data: componentToDelete,
        });

      if (historyError) {
        console.error('❌ Erro ao registrar histórico (deletar):', historyError);
      } else {
        console.log('✅ Histórico registrado: componente deletado');
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar:', error);
      setComponents(prev => [...prev, componentToDelete]);
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  /**
   * Scrap de produto (API interna /api/scraper.ts)
   */
  const scrapProduct = async (url: string) => {
    if (!url?.trim()) {
      toast.error('URL inválida');
      return null;
    }

    try {
      // Scraping básico usando fetch direto (limitado por CORS)
      // Em produção, seria necessário um backend para scraping
      console.log('Tentando extrair dados de:', url);
      
      // Extrair nome básico da URL
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || '';
      const basicName = lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\.(html|php|aspx?)$/i, '')
        .trim() || 'Produto';

      // Categorização básica baseada na URL
      const categorizeFromUrl = (url: string): string => {
        const urlLower = url.toLowerCase();
        if (/cpu|processador|ryzen|intel/i.test(urlLower)) return 'cpu';
        if (/gpu|placa.*video|rtx|gtx/i.test(urlLower)) return 'gpu';
        if (/memoria|ram|ddr/i.test(urlLower)) return 'ram';
        if (/ssd|hd|storage/i.test(urlLower)) return 'storage';
        if (/placa.*mae|motherboard/i.test(urlLower)) return 'motherboard';
        if (/fonte|psu/i.test(urlLower)) return 'psu';
        if (/gabinete|case/i.test(urlLower)) return 'case';
        if (/cooler|refrigera/i.test(urlLower)) return 'cooler';
        if (/monitor|display/i.test(urlLower)) return 'monitor';
        if (/teclado|mouse|headset/i.test(urlLower)) return 'peripherals';
        return 'outros';
      };

      toast.success('Dados básicos extraídos da URL');
      
      return {
        name: basicName,
        description: `Produto importado de ${new URL(url).hostname}`,
        price: 0,
        image_url: '',
        url,
        category: categorizeFromUrl(url),
        purchased: false,
        priority: 1,
      };
    } catch (error) {
      console.error('Erro no scrapProduct:', error);
      
      // Fallback: criar componente básico mesmo com erro
      const urlParts = url.split('/');
      const basicName = urlParts[urlParts.length - 1] || 'Produto';
      
      toast.warning('Criado componente básico (scraping limitado)');
      
      return {
        name: basicName.replace(/[-_]/g, ' ').trim() || 'Produto',
        description: 'Componente criado manualmente',
        price: 0,
        image_url: '',
        url,
        category: 'outros',
        purchased: false,
        priority: 1,
      };
    }
  };

  /**
   * Total do preço dos componentes
   */
  const totalPrice = useMemo(() => {
    return components.reduce((acc, curr) => acc + (curr.price || 0), 0);
  }, [components]);

  return {
    components,
    loading,
    operationLoading,
    addComponent,
    updateComponent,
    deleteComponent,
    scrapProduct,
    totalPrice,
    refetch: fetchComponents,
    initialized,
  };
}