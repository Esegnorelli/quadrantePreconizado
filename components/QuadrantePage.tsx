import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Legend, Label
} from 'recharts';
import { formatCurrencyBRL, stringToColor } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import EmptyState from './common/EmptyState';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const loja = payload[0];
    return (
      <div className="relative z-50 p-3 text-sm bg-white border rounded-md shadow-lg">
        <p className="font-bold" style={{ color: loja.fill }}>{data.nome}</p>
        <p>Faturamento: {formatCurrencyBRL(data.faturamento)}</p>
        <p>Preconizado Médio: {data.preconizado.toFixed(1)}%</p>
        <p>Lançamentos: {data.count}</p>
      </div>
    );
  }
  return null;
};

const QuadrantePage: React.FC = () => {
  const { lojas, movimentacoes, settings, updateSettings } = useAppContext();

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [selectedLojaIds, setSelectedLojaIds] = useState<string[]>(['all']);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSettings({ ...settings, [name]: Number(value) });
  };
  
  const filteredMovimentacoes = useMemo(() => {
    return movimentacoes.filter(mov => {
      const movDate = new Date(mov.dataISO);
      const isDateInRange = movDate >= new Date(startDate) && movDate <= new Date(endDate);
      const isLojaSelected = selectedLojaIds.includes('all') || selectedLojaIds.includes(mov.lojaId);
      return isDateInRange && isLojaSelected;
    });
  }, [movimentacoes, startDate, endDate, selectedLojaIds]);

  const chartData = useMemo(() => {
    const groupedByLoja: { [key: string]: { faturamento: number; preconizadoSum: number; count: number } } = {};

    filteredMovimentacoes.forEach(mov => {
      if (!groupedByLoja[mov.lojaId]) {
        groupedByLoja[mov.lojaId] = { faturamento: 0, preconizadoSum: 0, count: 0 };
      }
      groupedByLoja[mov.lojaId].faturamento += mov.faturamento;
      groupedByLoja[mov.lojaId].preconizadoSum += mov.preconizado;
      groupedByLoja[mov.lojaId].count++;
    });

    return Object.keys(groupedByLoja).map(lojaId => {
      const loja = lojas.find(l => l.id === lojaId);
      const data = groupedByLoja[lojaId];
      return {
        lojaId,
        nome: loja ? loja.nome : 'Loja Desconhecida',
        faturamento: data.faturamento,
        preconizado: data.preconizadoSum / data.count,
        count: data.count,
      };
    });
  }, [filteredMovimentacoes, lojas]);
  
  const lojasComDados = useMemo(() => {
     return lojas.filter(loja => chartData.some(d => d.lojaId === loja.id));
  }, [lojas, chartData]);

  const summary = useMemo(() => {
    const totalFaturamento = chartData.reduce((sum, item) => sum + item.faturamento, 0);
    const totalPreconizadoSum = chartData.reduce((sum, item) => sum + item.preconizado * item.count, 0);
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
    const mediaPreconizado = totalCount > 0 ? totalPreconizadoSum / totalCount : 0;
    return { totalFaturamento, mediaPreconizado };
  }, [chartData]);

  const handleLojaSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedLojaIds(values);
  };
  
  const { metaFaturamento, metaPreconizado } = settings;

  if (movimentacoes.length === 0) {
      return <EmptyState title="Nenhum lançamento encontrado" message="Adicione um lançamento na página de Registros para começar a ver os dados." />;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Filtros e Metas</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data Início</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data Fim</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="lojas" className="block text-sm font-medium text-gray-700">Lojas</label>
            <select id="lojas" multiple value={selectedLojaIds} onChange={handleLojaSelection} className="block w-full h-24 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
              <option value="all">Todas</option>
              {lojas.map(loja => <option key={loja.id} value={loja.id}>{loja.nome}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <div>
                <label htmlFor="metaPreconizado" className="block text-sm font-medium text-gray-700">Meta Preconizado (%)</label>
                <input type="number" name="metaPreconizado" id="metaPreconizado" value={metaPreconizado} min="0" max="100" step="0.1" onChange={handleSettingsChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
             <div>
                <label htmlFor="metaFaturamento" className="block text-sm font-medium text-gray-700">Meta Faturamento (R$)</label>
                <input type="number" name="metaFaturamento" id="metaFaturamento" value={metaFaturamento} onChange={handleSettingsChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border rounded-lg shadow-sm h-[calc(100vh-350px)] min-h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis type="number" dataKey="preconizado" name="Preconizado" unit="%" domain={[0, 100]}>
                <Label value="Preconizado Médio (%)" offset={-25} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="faturamento" name="Faturamento" unit=" R$" domain={['dataMin', 'dataMax']} tickFormatter={(value: number) => new Intl.NumberFormat('pt-BR').format(value)}>
                 <Label value="Faturamento Total (R$)" angle={-90} offset={-35} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            
            <ReferenceArea x1={metaPreconizado} y1={metaFaturamento} fill="rgba(74, 222, 128, 0.2)" strokeOpacity={0}/>
            <ReferenceArea x1={metaPreconizado} y2={metaFaturamento} fill="rgba(250, 204, 21, 0.2)" strokeOpacity={0}/>
            <ReferenceArea y1={metaFaturamento} x2={metaPreconizado} fill="rgba(250, 204, 21, 0.2)" strokeOpacity={0}/>
            <ReferenceArea x2={metaPreconizado} y2={metaFaturamento} fill="rgba(239, 68, 68, 0.2)" strokeOpacity={0}/>
            
            <ReferenceLine x={metaPreconizado} stroke="grey" strokeDasharray="3 3">
                <Label value={`Meta ${metaPreconizado}%`} position="top" fill="grey" fontSize={12}/>
            </ReferenceLine>
            <ReferenceLine y={metaFaturamento} stroke="grey" strokeDasharray="3 3">
                 <Label value={`Meta ${formatCurrencyBRL(metaFaturamento)}`} position="insideRight" fill="grey" fontSize={12} style={{ textAnchor: 'start' }}/>
            </ReferenceLine>

            {lojasComDados.map(loja => (
                <Scatter
                    key={loja.id}
                    name={loja.nome}
                    data={chartData.filter(d => d.lojaId === loja.id)}
                    fill={stringToColor(loja.id)}
                    shape="circle"
                />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

       <div className="p-4 bg-white border rounded-lg shadow-sm">
        <h3 className="text-lg font-medium">Resumo do Período</h3>
        <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
          <div className="p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-gray-500">Faturamento Total</p>
            <p className="text-2xl font-semibold">{formatCurrencyBRL(summary.totalFaturamento)}</p>
          </div>
          <div className="p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-gray-500">Média Geral de Preconizado</p>
            <p className="text-2xl font-semibold">{summary.mediaPreconizado.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuadrantePage;