import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Legend, Label
} from 'recharts';
import { stringToColor } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import EmptyState from './common/EmptyState';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const loja = payload[0];
    return (
      <div className="relative z-50 p-3 text-sm bg-white border rounded-md shadow-lg">
        <p className="font-bold" style={{ color: loja.fill }}>{data.nome}</p>
        <p>Faturamento Médio: {data.faturamento.toFixed(1)}%</p>
        <p>Preconizado Médio: {data.preconizado.toFixed(1)}%</p>
        <p>Lançamentos: {data.count}</p>
      </div>
    );
  }
  return null;
};

const QuadrantLabel = ({ value, viewBox, color }: { value: string, viewBox?: { x: number, y: number, width: number, height: number }, color: string }) => {
  if (!viewBox) return null;
  const { x, y, width, height } = viewBox;
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        className="text-2xl md:text-4xl font-black uppercase opacity-40 select-none pointer-events-none"
      >
        {value}
      </text>
    </g>
  );
};

const QuadrantePage: React.FC = () => {
  const { lojas, movimentacoes, settings, updateSettings } = useAppContext();

  const today = new Date();
  const currentMonth = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedLojaIds, setSelectedLojaIds] = useState<string[]>(['all']);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSettings({ ...settings, [name]: Number(value) });
  };
  
  const filteredMovimentacoes = useMemo(() => {
    if (!selectedMonth) return [];
    return movimentacoes.filter(mov => {
      const isDateInRange = mov.dataISO.startsWith(selectedMonth);
      const isLojaSelected = selectedLojaIds.includes('all') || selectedLojaIds.includes(mov.lojaId);
      return isDateInRange && isLojaSelected;
    });
  }, [movimentacoes, selectedMonth, selectedLojaIds]);

  const chartData = useMemo(() => {
    const groupedByLoja: { [key: string]: { faturamentoSum: number; preconizadoSum: number; count: number } } = {};

    filteredMovimentacoes.forEach(mov => {
      if (!groupedByLoja[mov.lojaId]) {
        groupedByLoja[mov.lojaId] = { faturamentoSum: 0, preconizadoSum: 0, count: 0 };
      }
      groupedByLoja[mov.lojaId].faturamentoSum += mov.faturamento;
      groupedByLoja[mov.lojaId].preconizadoSum += mov.preconizado;
      groupedByLoja[mov.lojaId].count++;
    });

    return Object.keys(groupedByLoja).map(lojaId => {
      const loja = lojas.find(l => l.id === lojaId);
      const data = groupedByLoja[lojaId];
      return {
        lojaId,
        nome: loja ? loja.nome : 'Loja Desconhecida',
        faturamento: data.faturamentoSum / data.count,
        preconizado: data.preconizadoSum / data.count,
        count: data.count,
      };
    });
  }, [filteredMovimentacoes, lojas]);
  
  const lojasComDados = useMemo(() => {
     return lojas.filter(loja => chartData.some(d => d.lojaId === loja.id));
  }, [lojas, chartData]);

  const { metaFaturamento, metaPreconizado } = settings;

  const summaryData = useMemo(() => {
    const totalFaturamentoSum = chartData.reduce((sum, item) => sum + item.faturamento * item.count, 0);
    const totalPreconizadoSum = chartData.reduce((sum, item) => sum + item.preconizado * item.count, 0);
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);
    
    return {
        mediaFaturamento: totalCount > 0 ? totalFaturamentoSum / totalCount : 0,
        mediaPreconizado: totalCount > 0 ? totalPreconizadoSum / totalCount : 0,
        sucesso: chartData.filter(d => d.faturamento >= metaFaturamento && d.preconizado >= metaPreconizado).length,
        potencial: chartData.filter(d => d.faturamento < metaFaturamento && d.preconizado >= metaPreconizado).length,
        risco: chartData.filter(d => d.faturamento >= metaFaturamento && d.preconizado < metaPreconizado).length,
        critico: chartData.filter(d => d.faturamento < metaFaturamento && d.preconizado < metaPreconizado).length,
    };
  }, [chartData, metaFaturamento, metaPreconizado]);

  const handleLojaSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedLojaIds(values);
  };
  
  const yDomainMax = useMemo(() => Math.max(100, ...chartData.map(d => d.faturamento)) * 1.1, [chartData]);


  if (movimentacoes.length === 0) {
      return <EmptyState title="Nenhum lançamento encontrado" message="Adicione um lançamento na página de Registros para começar a ver os dados." />;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Coluna de Filtros e Metas */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Filtros e Metas</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700">Período</label>
                        <input type="month" id="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="lojas" className="block text-sm font-medium text-gray-700">Lojas</label>
                        <select id="lojas" multiple value={selectedLojaIds} onChange={handleLojaSelection} className="block w-full h-24 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="all">Todas</option>
                        {lojas.map(loja => <option key={loja.id} value={loja.id}>{loja.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="metaPreconizado" className="block text-sm font-medium text-gray-700">Meta Preconizado (%)</label>
                        <input type="number" name="metaPreconizado" id="metaPreconizado" value={metaPreconizado} min="0" max="100" step="0.1" onChange={handleSettingsChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="metaFaturamento" className="block text-sm font-medium text-gray-700">Meta Faturamento (%)</label>
                        <input type="number" name="metaFaturamento" id="metaFaturamento" value={metaFaturamento} onChange={handleSettingsChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                </div>
            </div>
            {/* Coluna de Resumo */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Resumo do Período</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-gray-500">Média Geral de Faturamento</p>
                        <p className="text-2xl font-semibold">{summaryData.mediaFaturamento.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-gray-500">Média Geral de Preconizado</p>
                        <p className="text-2xl font-semibold">{summaryData.mediaPreconizado.toFixed(1)}%</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-md">Distribuição nos Quadrantes</h4>
                    <div className="mt-2 space-y-2 text-sm">
                       <div className="flex items-center justify-between p-2 rounded-md bg-green-50">
                            <div className="flex items-center">
                                <span className="w-3 h-3 mr-2 bg-green-500 rounded-full"></span>
                                <span>Sucesso</span>
                            </div>
                            <span className="font-bold">{summaryData.sucesso} lojas</span>
                       </div>
                       <div className="flex items-center justify-between p-2 rounded-md bg-blue-50">
                            <div className="flex items-center">
                                <span className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>
                                <span>Potencial</span>
                            </div>
                            <span className="font-bold">{summaryData.potencial} lojas</span>
                       </div>
                       <div className="flex items-center justify-between p-2 rounded-md bg-yellow-50">
                            <div className="flex items-center">
                                <span className="w-3 h-3 mr-2 bg-yellow-500 rounded-full"></span>
                                <span>Risco</span>
                            </div>
                            <span className="font-bold">{summaryData.risco} lojas</span>
                       </div>
                       <div className="flex items-center justify-between p-2 rounded-md bg-red-50">
                            <div className="flex items-center">
                                <span className="w-3 h-3 mr-2 bg-red-500 rounded-full"></span>
                                <span>Crítico</span>
                            </div>
                            <span className="font-bold">{summaryData.critico} lojas</span>
                       </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border rounded-lg shadow-sm h-[calc(100vh-420px)] min-h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis type="number" dataKey="preconizado" name="Preconizado" unit="%" domain={[0, 100]}>
                <Label value="Preconizado Médio (%)" offset={-25} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="faturamento" name="Faturamento" unit="%" domain={[0, Math.ceil(yDomainMax / 10) * 10]}>
                 <Label value="Faturamento Médio (%)" angle={-90} offset={-35} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            
            {/* Quadrante Sucesso (Top-Right) */}
            <ReferenceArea x1={metaPreconizado} y1={metaFaturamento} fill="rgba(74, 222, 128, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Sucesso" color="#4ade80" />} />
            {/* Quadrante Risco (Top-Left) */}
            <ReferenceArea x2={metaPreconizado} y1={metaFaturamento} fill="rgba(250, 204, 21, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Risco" color="#facc15" />} />
            {/* Quadrante Potencial (Bottom-Right) */}
            <ReferenceArea x1={metaPreconizado} y2={metaFaturamento} fill="rgba(59, 130, 246, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Potencial" color="#60a5fa" />} />
            {/* Quadrante Crítico (Bottom-Left) */}
            <ReferenceArea x2={metaPreconizado} y2={metaFaturamento} fill="rgba(239, 68, 68, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Crítico" color="#f87171" />} />

            <ReferenceLine x={metaPreconizado} stroke="grey" strokeDasharray="3 3">
                <Label value={`Meta ${metaPreconizado}%`} position="top" fill="grey" fontSize={12}/>
            </ReferenceLine>
            <ReferenceLine y={metaFaturamento} stroke="grey" strokeDasharray="3 3">
                 <Label value={`Meta ${metaFaturamento}%`} position="insideRight" fill="grey" fontSize={12} style={{ textAnchor: 'start' }}/>
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
    </div>
  );
};

export default QuadrantePage;
