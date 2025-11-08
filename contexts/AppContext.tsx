import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Loja, Movimentacao, Settings } from '../types';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  lojas: Loja[];
  movimentacoes: Movimentacao[];
  settings: Settings;
  loading: boolean;
  addLoja: (nome: string) => Promise<void>;
  updateLoja: (id: string, nome: string) => Promise<void>;
  deleteLoja: (id: string) => Promise<void>;
  addMovimentacao: (mov: Omit<Movimentacao, 'id'>) => Promise<void>;
  updateMovimentacao: (id: string, mov: Omit<Movimentacao, 'id'>) => Promise<void>;
  deleteMovimentacao: (id: string) => Promise<void>;
  updateSettings: (settings: Settings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    metaFaturamento: 90,
    metaPreconizado: 85,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let lojasRes = await supabase.from('lojas').select('*').order('nome', { ascending: true });
        if (lojasRes.error) throw lojasRes.error;

        // Se a tabela de lojas estiver vazia, cria a lista padrão.
        if (lojasRes.data && lojasRes.data.length === 0) {
          toast('Nenhuma loja encontrada. Criando lista padrão...');
          const defaultLojas = [
            { nome: 'Sapiranga' }, { nome: 'Novo Hamburgo' }, { nome: 'Montenegro' },
            { nome: 'Caxias do Sul' }, { nome: 'São Leopoldo' }, { nome: 'Barra Shopping' },
            { nome: 'Bento Gonçalves' }, { nome: 'Canoas' }, { nome: 'Zona Norte' },
            { nome: 'Gravataí' }, { nome: 'Lajeado' }, { nome: 'Erechim' },
            { nome: 'Floresta' }, { nome: 'Protásio' }, { nome: 'Esteio' },
            { nome: 'Capão da Canoa' }, { nome: 'Ijuí' }, { nome: 'Campo Bom' },
            { nome: 'Torres' }, { nome: 'Ipiranga' }
          ];
          
          const { error: insertError } = await supabase.from('lojas').insert(defaultLojas);
          if (insertError) throw insertError;
          
          // Busca novamente as lojas para obter os IDs e a ordem correta.
          lojasRes = await supabase.from('lojas').select('*').order('nome', { ascending: true });
          if (lojasRes.error) throw lojasRes.error;
          
          toast.success('20 lojas padrão criadas com sucesso!');
        }

        const movsRes = await supabase.from('movimentacoes').select('*');
        if (movsRes.error) throw movsRes.error;
        
        setLojas(lojasRes.data || []);
        setMovimentacoes(movsRes.data || []);

      } catch (error: any) {
        console.error("Falha ao buscar/criar dados no Supabase:", error);
        toast.error(`Erro ao carregar dados: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // --- Lojas CRUD ---
  const addLoja = async (nome: string) => {
    if (nome.trim() === '') return;
    try {
      const { data, error } = await supabase
        .from('lojas')
        .insert({ nome: nome.trim() })
        .select()
        .single();
      if (error) throw error;
      setLojas(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast.success(`Loja "${nome.trim()}" adicionada com sucesso!`);
    } catch (error: any) {
        toast.error(`Erro ao adicionar loja: ${error.message}`);
        console.error(error);
    }
  };

  const updateLoja = async (id: string, nome: string) => {
    if (nome.trim() === '') return;
    try {
        const { error } = await supabase.from('lojas').update({ nome: nome.trim() }).eq('id', id);
        if (error) throw error;
        setLojas(prev => prev.map(loja => loja.id === id ? { ...loja, nome: nome.trim() } : loja)
            .sort((a, b) => a.nome.localeCompare(b.nome)));
        toast.success(`Loja renomeada para "${nome.trim()}"!`);
    } catch (error: any) {
        toast.error(`Erro ao atualizar loja: ${error.message}`);
        console.error(error);
    }
  };

  const deleteLoja = async (id: string) => {
    try {
        // A exclusão em cascata (on delete cascade) foi definida na tabela do Supabase.
        const { error } = await supabase.from('lojas').delete().eq('id', id);
        if (error) throw error;
        setLojas(prev => prev.filter(loja => loja.id !== id));
        toast.success('Loja excluída com sucesso.');
    } catch (error: any) {
        toast.error(`Erro ao excluir loja: ${error.message}`);
        console.error(error);
    }
  };
  
  // --- Movimentacoes CRUD ---
  const addMovimentacao = async (mov: Omit<Movimentacao, 'id'>) => {
    const mesAno = mov.dataISO.substring(0, 7);
    const existeLancamento = movimentacoes.some(
      m => m.lojaId === mov.lojaId && m.dataISO.startsWith(mesAno)
    );

    if (existeLancamento) {
      toast.error('Já existe um lançamento para esta loja no mês selecionado.');
      return;
    }
      
    try {
        const { data, error } = await supabase.from('movimentacoes').insert(mov).select().single();
        if (error) throw error;
        setMovimentacoes(prev => [...prev, data]);
        toast.success('Lançamento adicionado com sucesso!');
    } catch (error: any) {
        if (error.code === '23505') {
            toast.error('Já existe um lançamento para esta loja no mês selecionado.');
        } else {
            toast.error(`Erro ao adicionar lançamento: ${error.message}`);
        }
        console.error(error);
    }
  };

  const updateMovimentacao = async (id: string, mov: Omit<Movimentacao, 'id'>) => {
    const mesAno = mov.dataISO.substring(0, 7);
    const existeConflito = movimentacoes.some(
      m => m.id !== id && m.lojaId === mov.lojaId && m.dataISO.startsWith(mesAno)
    );

    if (existeConflito) {
      toast.error('Já existe outro lançamento para esta loja no mês selecionado.');
      return;
    }
      
    try {
        const { error } = await supabase.from('movimentacoes').update(mov).eq('id', id);
        if (error) throw error;
        const movAtualizada = { id, ...mov };
        setMovimentacoes(prev => prev.map(m => m.id === id ? movAtualizada : m));
        toast.success('Lançamento atualizado com sucesso!');
    } catch (error: any)
     {
        if (error.code === '23505') {
            toast.error('Já existe outro lançamento para esta loja no mês selecionado.');
        } else {
            toast.error(`Erro ao atualizar lançamento: ${error.message}`);
        }
        console.error(error);
    }
  };

  const deleteMovimentacao = async (id: string) => {
     try {
        const { error } = await supabase.from('movimentacoes').delete().eq('id', id);
        if (error) throw error;
        setMovimentacoes(prev => prev.filter(m => m.id !== id));
        toast.success('Lançamento excluído com sucesso.');
    } catch (error: any) {
        toast.error(`Erro ao excluir lançamento: ${error.message}`);
        console.error(error);
    }
  };
  
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    toast.success('Metas atualizadas!');
  };

  const value = {
    lojas,
    movimentacoes,
    settings,
    loading,
    addLoja,
    updateLoja,
    deleteLoja,
    addMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};