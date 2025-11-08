import React, { useState, useEffect, useMemo } from 'react';
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
    padronizacao: '',
    layout: '',
    cultura: '',
  });
  const [errors, setErrors] = useState({ faturamento: '', padronizacao: '', layout: '', cultura: '' });

  useEffect(() => {
    if (movimentacao) {
      setFormData({
        dataISO: movimentacao.dataISO,
        lojaId: movimentacao.lojaId,
        faturamento: String(movimentacao.faturamento),
        padronizacao: String(movimentacao.padronizacao || ''),
        layout: String(movimentacao.layout || ''),
        cultura: String(movimentacao.cultura || ''),
      });
    } else {
       setFormData({
        dataISO: new Date().toISOString().split('T')[0],
        lojaId: lojas.length > 0 ? lojas[0].id : '',
        faturamento: '',
        padronizacao: '',
        layout: '',
        cultura: '',
      });
    }
  }, [movimentacao, lojas, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatedPreconizado = useMemo(() => {
    const padronizacaoNum = parseFloat(formData.padronizacao.replace(',', '.')) || 0;
    const layoutNum = parseFloat(formData.layout.replace(',', '.')) || 0;
    const culturaNum = parseFloat(formData.cultura.replace(',', '.')) || 0;
    
    const values = [padronizacaoNum, layoutNum, culturaNum].filter(v => formData.padronizacao || formData.layout || formData.cultura ? v >= 0 : v > 0);
    const count = values.length || 1;
    
    const average = (padronizacaoNum + layoutNum + culturaNum) / count;
    return average;
  }, [formData.padronizacao, formData.layout, formData.cultura]);
  
  const validateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    const faturamentoNum = parseFloat(formData.faturamento.replace(',', '.'));
    const padronizacaoNum = parseFloat(formData.padronizacao.replace(',', '.'));
    const layoutNum = parseFloat(formData.layout.replace(',', '.'));
    const culturaNum = parseFloat(formData.cultura.replace(',', '.'));

    let hasError = false;
    const newErrors = { faturamento: '', padronizacao: '', layout: '', cultura: '' };

    if (isNaN(faturamentoNum) || faturamentoNum < 0) {
        newErrors.faturamento = 'Valor inválido';
        hasError = true;
    }
    
    if (isNaN(padronizacaoNum) || padronizacaoNum < 0 || padronizacaoNum > 100) {
        newErrors.padronizacao = 'Valor deve ser entre 0 e 100';
        hasError = true;
    }
    if (isNaN(layoutNum) || layoutNum < 0 || layoutNum > 100) {
        newErrors.layout = 'Valor deve ser entre 0 e 100';
        hasError = true;
    }
    if (isNaN(culturaNum) || culturaNum < 0 || culturaNum > 100) {
        newErrors.cultura = 'Valor deve ser entre 0 e 100';
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
        faturamento: Math.round(faturamentoNum * 10) / 10,
        padronizacao: Math.round(padronizacaoNum * 10) / 10,
        layout: Math.round(layoutNum * 10) / 10,
        cultura: Math.round(culturaNum * 10) / 10,
        preconizado: Math.round(calculatedPreconizado * 100) / 100,
      });
    }
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
              <label htmlFor="faturamento" className="block text-sm font-medium text-gray-700">Faturamento (%)</label>
              <input type="text" name="faturamento" id="faturamento" value={formData.faturamento} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="95,2"/>
              {errors.faturamento && <p className="mt-1 text-xs text-red-500">{errors.faturamento}</p>}
            </div>
            <div>
              <label htmlFor="padronizacao" className="block text-sm font-medium text-gray-700">Padronização Processos (%)</label>
              <input type="text" name="padronizacao" id="padronizacao" value={formData.padronizacao} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="80"/>
              {errors.padronizacao && <p className="mt-1 text-xs text-red-500">{errors.padronizacao}</p>}
            </div>
             <div>
              <label htmlFor="layout" className="block text-sm font-medium text-gray-700">Layout (%)</label>
              <input type="text" name="layout" id="layout" value={formData.layout} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="80"/>
              {errors.layout && <p className="mt-1 text-xs text-red-500">{errors.layout}</p>}
            </div>
             <div>
              <label htmlFor="cultura" className="block text-sm font-medium text-gray-700">Cultura (%)</label>
              <input type="text" name="cultura" id="cultura" value={formData.cultura} onChange={handleChange} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" placeholder="60"/>
              {errors.cultura && <p className="mt-1 text-xs text-red-500">{errors.cultura}</p>}
            </div>
            <div className="sm:col-span-2 p-3 bg-slate-100 rounded-md text-center">
              <p className="text-sm text-gray-500">Média Preconizado Calculada</p>
              <p className="text-2xl font-bold text-primary">{calculatedPreconizado.toFixed(2)}%</p>
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