import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Loja, Movimentacao, Settings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface AppContextType {
  lojas: Loja[];
  movimentacoes: Movimentacao[];
  settings: Settings;
  addLoja: (nome: string) => void;
  updateLoja: (id: string, nome: string) => void;
  deleteLoja: (id: string) => void;
  addMovimentacao: (mov: Omit<Movimentacao, 'id'>) => void;
  updateMovimentacao: (id: string, mov: Omit<Movimentacao, 'id'>) => void;
  deleteMovimentacao: (id: string) => void;
  updateSettings: (settings: Settings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lojas, setLojas] = useLocalStorage<Loja[]>('lojas', []);
  const [movimentacoes, setMovimentacoes] = useLocalStorage<Movimentacao[]>('movs', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    metaFaturamento: 50000,
    metaPreconizado: 85,
  });

  // Lojas CRUD
  const addLoja = (nome: string) => {
    if (nome.trim() === '') return;
    const novaLoja: Loja = { id: uuidv4(), nome: nome.trim() };
    setLojas(prevLojas => [...prevLojas, novaLoja]);
    toast.success(`Loja "${nome.trim()}" adicionada com sucesso!`);
  };

  const updateLoja = (id: string, nome: string) => {
    if (nome.trim() === '') return;
    setLojas(prevLojas => prevLojas.map(loja => loja.id === id ? { ...loja, nome: nome.trim() } : loja));
    toast.success(`Loja renomeada para "${nome.trim()}"!`);
  };

  const deleteLoja = (id: string) => {
    setLojas(prevLojas => prevLojas.filter(loja => loja.id !== id));
    toast.success('Loja excluída com sucesso.');
  };
  
  // Movimentacoes CRUD
  const addMovimentacao = (mov: Omit<Movimentacao, 'id'>) => {
    const novaMovimentacao: Movimentacao = { id: uuidv4(), ...mov };
    setMovimentacoes(prev => [...prev, novaMovimentacao]);
    toast.success('Lançamento adicionado com sucesso!');
  };

  const updateMovimentacao = (id: string, mov: Omit<Movimentacao, 'id'>) => {
    setMovimentacoes(prev => prev.map(m => m.id === id ? { id, ...mov } : m));
    toast.success('Lançamento atualizado com sucesso!');
  };

  const deleteMovimentacao = (id: string) => {
    setMovimentacoes(prev => prev.filter(m => m.id !== id));
    toast.success('Lançamento excluído com sucesso.');
  };
  
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    toast.success('Metas atualizadas!');
  };

  const value = {
    lojas,
    movimentacoes,
    settings,
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