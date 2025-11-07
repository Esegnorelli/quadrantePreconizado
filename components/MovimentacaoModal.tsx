import React, { useState, useEffect } from 'react';
import type { Movimentacao } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface MovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mov: Omit<Movimentacao, 'id'>) => void;
  movimentacao: Movimentacao | null;
}

const MovimentacaoModal: React.FC<MovimentacaoModalProps> = ({ isOpen, onClose, onSave, movimentacao }) => {
  const { lojas } = useAppContext();
  const [formData, setFormData] = useState({
    dataISO: new Date().toISOString().split('T')[0],
    lojaId: '',
    faturamento: '',
    preconizado: '',
  });
  const [errors, setErrors] = useState({ faturamento: '', preconizado: '' });

  useEffect(() => {
    if (movimentacao) {
      setFormData({
        dataISO: movimentacao.dataISO,
        lojaId: movimentacao.lojaId,
        faturamento: movimentacao.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        preconizado: String(movimentacao.preconizado),
      });
    } else {
       setFormData({
        dataISO: new Date().toISOString().split('T')[0],
        lojaId: lojas.length > 0 ? lojas[0].id : '',
        faturamento: '',
        preconizado: '',
      });
    }
  }, [movimentacao, lojas, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    const faturamentoNum = parseFloat(formData.faturamento.replace(/\./g, '').replace(',', '.'));
    const preconizadoNum = parseFloat(formData.preconizado.replace(',', '.'));

    let hasError = false;
    const newErrors = { faturamento: '', preconizado: '' };

    if (isNaN(faturamentoNum) || faturamentoNum < 0) {
        newErrors.faturamento = 'Valor inválido';
        hasError = true;
    }
    if (isNaN(preconizadoNum) || preconizadoNum < 0 || preconizadoNum > 100) {
        newErrors.preconizado = 'Valor deve ser entre 0 e 100';
        hasError = true;
    }
    if (!formData.lojaId) {
        alert('Selecione uma loja.');
        hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      onSave({
        dataISO: formData.dataISO,
        lojaId: formData.lojaId,
        faturamento: faturamentoNum,
        preconizado: Math.round(preconizadoNum * 10) / 10,
      });
    }
  };
  
  const formatBRLInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') {
        setFormData(prev => ({...prev, faturamento: ''}));
        return;
    }
    value = (Number(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    setFormData(prev => ({ ...prev, faturamento: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl m-4 transform transition-all duration-300 scale-100">
        <h2 className="text-xl font-bold">{movimentacao ? 'Editar' : 'Novo'} Lançamento</h2>
        <form onSubmit={validateAndSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dataISO" className="block text-sm font-medium text-gray-700">Data</label>
              <input type="date" name="dataISO" id="dataISO" value={formData.dataISO} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="lojaId" className="block text-sm font-medium text-gray-700">Loja</label>
              <select name="lojaId" id="lojaId" value={formData.lojaId} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                {lojas.length > 0 ? (
                    lojas.map(loja => <option key={loja.id} value={loja.id}>{loja.nome}</option>)
                ) : (
                    <option disabled>Cadastre uma loja primeiro</option>
                )}
              </select>
            </div>
             <div>
              <label htmlFor="faturamento" className="block text-sm font-medium text-gray-700">Faturamento (R$)</label>
              <input type="text" name="faturamento" id="faturamento" value={formData.faturamento} onChange={formatBRLInput} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="1.234,56"/>
              {errors.faturamento && <p className="mt-1 text-xs text-red-500">{errors.faturamento}</p>}
            </div>
            <div>
              <label htmlFor="preconizado" className="block text-sm font-medium text-gray-700">Preconizado (%)</label>
              <input type="text" name="preconizado" id="preconizado" value={formData.preconizado} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="85,5"/>
              {errors.preconizado && <p className="mt-1 text-xs text-red-500">{errors.preconizado}</p>}
            </div>
          </div>
          <div className="pt-4 text-right space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovimentacaoModal;