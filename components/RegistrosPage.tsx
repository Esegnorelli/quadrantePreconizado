import React, { useState, useMemo } from 'react';
import type { Movimentacao } from '../types';
import { formatDate } from '../utils/helpers';
import { EditIcon, DeleteIcon, PlusIcon } from './icons';
import MovimentacaoModal from './MovimentacaoModal';
import { useAppContext } from '../contexts/AppContext';
import ConfirmationModal from './common/ConfirmationModal';
import EmptyState from './common/EmptyState';


const RegistrosPage: React.FC = () => {
  const { lojas, movimentacoes, addMovimentacao, updateMovimentacao, deleteMovimentacao } = useAppContext();
  
  const today = new Date();
  const currentMonth = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedLojaIds, setSelectedLojaIds] = useState<string[]>(['all']);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMov, setEditingMov] = useState<Movimentacao | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [movToDelete, setMovToDelete] = useState<string | null>(null);

  const getLojaName = (lojaId: string) => {
    return lojas.find(l => l.id === lojaId)?.nome || 'N/A';
  };

  const filteredMovimentacoes = useMemo(() => {
    if (!selectedMonth) return [];
    return movimentacoes
      .filter(mov => {
        const isDateInRange = mov.dataISO.startsWith(selectedMonth);
        const isLojaSelected = selectedLojaIds.includes('all') || selectedLojaIds.includes(mov.lojaId);
        return isDateInRange && isLojaSelected;
      })
      .sort((a, b) => new Date(b.dataISO).getTime() - new Date(a.dataISO).getTime());
  }, [movimentacoes, selectedMonth, selectedLojaIds]);

  const handleOpenNewModal = () => {
    setEditingMov(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mov: Movimentacao) => {
    setEditingMov(mov);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setMovToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if(movToDelete) {
      await deleteMovimentacao(movToDelete);
    }
    setIsConfirmModalOpen(false);
    setMovToDelete(null);
  };

  const handleSave = async (movData: Omit<Movimentacao, 'id'>) => {
    if (editingMov) {
      await updateMovimentacao(editingMov.id, movData);
    } else {
      await addMovimentacao(movData);
    }
    setIsModalOpen(false);
  };
  
  const handleLojaSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    if (values.includes('all') || values.length === 0) {
        setSelectedLojaIds(['all']);
    } else {
        setSelectedLojaIds(values);
    }
  };

  return (
    <div className="space-y-6">
       <div className="p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="text-lg font-medium">Filtros</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700">Período</label>
                <input type="month" id="monthFilter" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="lojaFilter" className="block text-sm font-medium text-gray-700">Loja</label>
                <select id="lojaFilter" multiple value={selectedLojaIds} onChange={handleLojaSelection} className="block w-full h-24 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                  <option value="all">Todas</option>
                  {lojas.map(loja => <option key={loja.id} value={loja.id}>{loja.nome}</option>)}
                </select>
              </div>
            </div>
        </div>
      </div>

      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Lançamentos</h3>
            <button onClick={handleOpenNewModal} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <PlusIcon className="w-5 h-5 mr-2 -ml-1"/>
                Novo Lançamento
            </button>
        </div>
         {movimentacoes.length === 0 && lojas.length === 0 ? (
            <EmptyState title="Nenhum lançamento cadastrado" message="Cadastre uma loja e clique em 'Novo Lançamento' para adicionar o primeiro." />
        ) : movimentacoes.length === 0 ? (
            <EmptyState title="Nenhum lançamento cadastrado" message="Clique em 'Novo Lançamento' para adicionar o primeiro." />
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Data</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Loja</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Faturamento (%)</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Preconizado (%)</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMovimentacoes.map(mov => (
                            <tr key={mov.id}>
                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{formatDate(mov.dataISO)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{getLojaName(mov.lojaId)}</td>
                                <td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">{mov.faturamento.toFixed(1)}%</td>
                                <td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">{mov.preconizado.toFixed(1)}%</td>
                                <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                                    <div className="flex justify-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(mov)} className="text-primary hover:text-primary-dark transition-colors duration-200"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteRequest(mov.id)} className="text-red-600 hover:text-red-900 transition-colors duration-200"><DeleteIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredMovimentacoes.length === 0 && (
                            <tr>
                               <td colSpan={5} className="py-8 text-center text-gray-500">Nenhum registro encontrado para os filtros selecionados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      
      {isModalOpen && (
        <MovimentacaoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          movimentacao={editingMov}
        />
      )}

      {isConfirmModalOpen && (
         <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão"
            message="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
        />
      )}
    </div>
  );
};

export default RegistrosPage;