import React, { useState } from 'react';
import type { Loja } from '../types';
import { EditIcon, DeleteIcon, CheckIcon, CancelIcon, PlusIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';
import ConfirmationModal from './common/ConfirmationModal';
import EmptyState from './common/EmptyState';


const LojaPage: React.FC = () => {
  const { lojas, movimentacoes, addLoja, updateLoja, deleteLoja } = useAppContext();

  const [newLojaName, setNewLojaName] = useState('');
  const [editingLojaId, setEditingLojaId] = useState<string | null>(null);
  const [editingLojaName, setEditingLojaName] = useState('');
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [lojaToDelete, setLojaToDelete] = useState<{id: string, hasMovs: boolean} | null>(null);

  const handleAddLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLojaName.trim()) {
      addLoja(newLojaName);
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

  const handleEditSave = (id: string) => {
    if (editingLojaName.trim()) {
      updateLoja(id, editingLojaName);
      handleEditCancel();
    }
  };

  const handleDeleteRequest = (id: string) => {
    const hasMovs = movimentacoes.some(mov => mov.lojaId === id);
    setLojaToDelete({ id, hasMovs });
    setIsConfirmModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (lojaToDelete) {
      deleteLoja(lojaToDelete.id);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-sm">
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

      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold">Lojas Cadastradas</h2>
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {lojas.length > 0 ? lojas.map(loja => (
            <div key={loja.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              {editingLojaId === loja.id ? (
                <input
                  type="text"
                  value={editingLojaName}
                  onChange={(e) => setEditingLojaName(e.target.value)}
                  className="flex-grow mr-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave(loja.id)}
                />
              ) : (
                <span className="text-sm">{loja.nome}</span>
              )}
              
              <div className="flex items-center space-x-3">
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
          )) : (
            <EmptyState title="Nenhuma loja cadastrada" message="Use o formulário acima para adicionar sua primeira loja." />
          )}
        </div>
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