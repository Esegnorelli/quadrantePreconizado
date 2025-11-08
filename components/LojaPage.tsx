import React, { useState, useMemo } from 'react';
import type { Loja } from '../types';
import { EditIcon, DeleteIcon, CheckIcon, CancelIcon, PlusIcon, ClipboardListIcon, ChartBarIcon, CalendarIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';
import ConfirmationModal from './common/ConfirmationModal';
import EmptyState from './common/EmptyState';
import { formatDate } from '../utils/helpers';


const LojaPage: React.FC = () => {
  const { lojas, movimentacoes, addLoja, updateLoja, deleteLoja } = useAppContext();

  const [newLojaName, setNewLojaName] = useState('');
  const [editingLojaId, setEditingLojaId] = useState<string | null>(null);
  const [editingLojaName, setEditingLojaName] = useState('');
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [lojaToDelete, setLojaToDelete] = useState<{id: string, hasMovs: boolean} | null>(null);
  
  const lojaStats = useMemo(() => {
    const stats = new Map<string, { totalLancamentos: number, mediaFaturamento: number, mediaPreconizado: number, ultimoLancamento: string | null }>();
    lojas.forEach(loja => {
        const movimentosDaLoja = movimentacoes.filter(m => m.lojaId === loja.id);
        const totalLancamentos = movimentosDaLoja.length;
        const mediaFaturamento = totalLancamentos > 0 ? movimentosDaLoja.reduce((acc, mov) => acc + mov.faturamento, 0) / totalLancamentos : 0;
        const mediaPreconizado = totalLancamentos > 0 ? movimentosDaLoja.reduce((acc, mov) => acc + mov.preconizado, 0) / totalLancamentos : 0;
        const ultimoLancamento = totalLancamentos > 0 ? new Date(Math.max(...movimentosDaLoja.map(m => new Date(m.dataISO).getTime()))).toISOString().split('T')[0] : null;
        stats.set(loja.id, { totalLancamentos, mediaFaturamento, mediaPreconizado, ultimoLancamento });
    });
    return stats;
  }, [lojas, movimentacoes]);

  const handleAddLoja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLojaName.trim()) {
      await addLoja(newLojaName);
      setNewLojaName('');
    }
  };
  
  const handleEditStart = (loja: Loja) => {
    setEditingLojaId(loja.id);
    setEditingLojaName(loja.nome);
  };
  
  const handleEditCancel = () => {
    setEditingLojaId(null);
    setEditingLojaName('');
  };

  const handleEditSave = async (id: string) => {
    if (editingLojaName.trim()) {
      await updateLoja(id, editingLojaName);
      handleEditCancel();
    }
  };

  const handleDeleteRequest = (id: string) => {
    const hasMovs = movimentacoes.some(mov => mov.lojaId === id);
    setLojaToDelete({ id, hasMovs });
    setIsConfirmModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (lojaToDelete) {
      await deleteLoja(lojaToDelete.id);
    }
    setIsConfirmModalOpen(false);
    setLojaToDelete(null);
  };
  
  const getConfirmationMessage = () => {
    if (!lojaToDelete) return '';
    return lojaToDelete.hasMovs
      ? 'Esta loja possui lançamentos vinculados. Excluir a loja NÃO excluirá os lançamentos. Deseja continuar?'
      : 'Tem certeza que deseja excluir esta loja?';
  };


  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold">Adicionar Nova Loja</h2>
        <form onSubmit={handleAddLoja} className="flex items-center mt-4 space-x-2">
          <input
            type="text"
            value={newLojaName}
            onChange={(e) => setNewLojaName(e.target.value)}
            placeholder="Nome da nova loja"
            className="flex-grow block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
          <button type="submit" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <PlusIcon className="w-5 h-5 mr-1 -ml-1"/> Adicionar
          </button>
        </form>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold">Lojas Cadastradas</h2>
        {lojas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
            {lojas.map(loja => {
              const stats = lojaStats.get(loja.id);
              return (
                <div key={loja.id} className="flex flex-col justify-between p-4 transition-all duration-300 border border-gray-200 rounded-lg shadow-sm bg-slate-50 hover:shadow-md hover:border-primary/50">
                  <div>
                    <div className="flex items-start justify-between">
                      {editingLojaId === loja.id ? (
                        <input
                          type="text"
                          value={editingLojaName}
                          onChange={(e) => setEditingLojaName(e.target.value)}
                          className="w-full mr-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleEditSave(loja.id)}
                        />
                      ) : (
                        <h3 className="pr-2 text-base font-bold text-slate-800">{loja.nome}</h3>
                      )}
                      
                      <div className="flex items-center flex-shrink-0 space-x-3">
                        {editingLojaId === loja.id ? (
                          <>
                            <button onClick={() => handleEditSave(loja.id)} className="text-green-600 hover:text-green-800" title="Salvar"><CheckIcon className="w-5 h-5"/></button>
                            <button onClick={handleEditCancel} className="text-gray-500 hover:text-gray-700" title="Cancelar"><CancelIcon className="w-5 h-5"/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditStart(loja)} className="text-primary hover:text-primary-dark" title="Editar"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteRequest(loja.id)} className="text-red-600 hover:text-red-900" title="Excluir"><DeleteIcon className="w-5 h-5"/></button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <ClipboardListIcon className="w-4 h-4 text-slate-400"/>
                            <span>{stats?.totalLancamentos || 0} lançamentos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4 text-slate-400"/>
                            <span>Faturamento: {stats?.mediaFaturamento.toFixed(1) || '0.0'}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4 text-slate-400"/>
                            <span>Preconizado: {stats?.mediaPreconizado.toFixed(1) || '0.0'}%</span>
                        </div>
                        {stats?.ultimoLancamento && (
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-slate-400"/>
                                <span>Último: {formatDate(stats.ultimoLancamento)}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="Nenhuma loja cadastrada" message="Use o formulário acima para adicionar sua primeira loja." />
          </div>
        )}
      </div>

       {isConfirmModalOpen && (
         <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão"
            message={getConfirmationMessage()}
        />
      )}
    </div>
  );
};

export default LojaPage;