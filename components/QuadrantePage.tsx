import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Legend, Label, LabelList
} from 'recharts';
import { stringToColor } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import EmptyState from './common/EmptyState';
import { ChevronUpIcon } from './icons';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const loja = payload[0];
    return (
      <div className="relative z-50 p-3 text-sm bg-white border rounded-lg shadow-lg">
        <p className="font-bold" style={{ color: loja.fill }}>{data.nome}</p>
        <p>Faturamento Médio: {data.faturamento.toFixed(1)}%</p>
        <p>Média Preconizado: {data.preconizado.toFixed(2)}%</p>
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
  
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  const [selectedPeriod, setSelectedPeriod] = useState(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
  const [selectedLojaIds, setSelectedLojaIds] = useState<string[]>(['all']);


  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSettings({ ...settings, [name]: Number(value) });
  };
  
  const filteredMovimentacoes = useMemo(() => {
    if (!selectedPeriod) return [];
    
    return movimentacoes.filter(mov => {
      const isDateInRange = mov.dataISO.startsWith(selectedPeriod);
      const isLojaSelected = selectedLojaIds.includes('all') || selectedLojaIds.includes(mov.lojaId);
      return isDateInRange && isLojaSelected;
    });
  }, [movimentacoes, selectedPeriod, selectedLojaIds]);

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
        potencial: chartData.filter(d => d.faturamento >= metaFaturamento && d.preconizado < metaPreconizado).length,
        risco: chartData.filter(d => d.faturamento < metaFaturamento && d.preconizado >= metaPreconizado).length,
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
      {/* Painel de Controle Retrátil */}
      <div className="bg-white rounded-xl shadow-md">
        <div 
          className="flex items-center justify-between p-6 transition-colors duration-200 cursor-pointer hover:bg-slate-50"
          onClick={() => setIsControlsVisible(!isControlsVisible)}
          role="button"
          aria-expanded={isControlsVisible}
          aria-controls="control-panel"
        >
          <h3 className="text-lg font-bold">Controles e Resumo</h3>
          <button className="p-1 rounded-full hover:bg-slate-200" title={isControlsVisible ? "Ocultar Controles" : "Mostrar Controles"}>
            <ChevronUpIcon className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${!isControlsVisible && 'rotate-180'}`}/>
          </button>
        </div>
        <div 
          id="control-panel"
          className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isControlsVisible ? 'max-h-[1000px] p-6 pt-0 border-t' : 'max-h-0 p-0'}`}>
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {/* Filtros */}
              <div className="space-y-4">
                  <h4 className="font-bold text-md">Filtros</h4>
                  <div>
                      <label htmlFor="period" className="block text-sm font-medium text-gray-700">Período</label>
                      <input 
                          type="month" 
                          id="period" 
                          value={selectedPeriod} 
                          onChange={e => setSelectedPeriod(e.target.value)} 
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                      <label htmlFor="lojas" className="block text-sm font-medium text-gray-700">Lojas</label>
                      <select id="lojas" multiple value={selectedLojaIds} onChange={handleLojaSelection} className="block w-full h-24 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                          <option value="all">Todas</option>
                          {lojas.map(loja => <option key={loja.id} value={loja.id}>{loja.nome}</option>)}
                      </select>
                  </div>
              </div>

               {/* Metas */}
              <div className="space-y-4">
                  <h4 className="font-bold text-md">Metas</h4>
                  <div>
                      <label htmlFor="metaPreconizado" className="block text-sm font-medium text-gray-700">Meta Média Preconizado (%)</label>
                      <input type="number" name="metaPreconizado" id="metaPreconizado" value={metaPreconizado} min="0" max="100" step="0.1" onChange={handleSettingsChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                      <label htmlFor="metaFaturamento" className="block text-sm font-medium text-gray-700">Meta Faturamento (%)</label>
                      <input type="number" name="metaFaturamento" id="metaFaturamento" value={metaFaturamento} onChange={handleSettingsChange} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
              </div>
              
              {/* Resumo */}
              <div className="space-y-4 md:col-span-2">
                  <h4 className="font-bold text-md">Resumo do Período</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-100 rounded-lg">
                          <p className="text-sm text-gray-500">Média Faturamento</p>
                          <p className="text-2xl font-semibold">{summaryData.mediaFaturamento.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-slate-100 rounded-lg">
                          <p className="text-sm text-gray-500">Média Preconizado</p>
                          <p className="text-2xl font-semibold">{summaryData.mediaPreconizado.toFixed(2)}%</p>
                      </div>
                  </div>
                  <h5 className="font-medium text-md">Distribuição nos Quadrantes</h5>
                  <div className="space-y-2 text-sm">
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

      {/* Gráfico */}
      <div className="p-6 bg-white rounded-xl shadow-md h-[calc(100vh-280px)] min-h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 80, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis type="number" dataKey="preconizado" name="Média Preconizado" unit="%" domain={[0, 100]}>
                <Label value="Média Preconizado (%)" offset={-25} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="faturamento" name="Faturamento" unit="%" domain={[0, Math.ceil(yDomainMax / 10) * 10]}>
                 <Label value="Faturamento Médio (%)" angle={-90} offset={-35} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            
            <ReferenceArea x1={metaPreconizado} y1={metaFaturamento} fill="rgba(74, 222, 128, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Sucesso" color="#4ade80" />} />
            <ReferenceArea x2={metaPreconizado} y1={metaFaturamento} fill="rgba(59, 130, 246, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Potencial" color="#60a5fa" />} />
            <ReferenceArea x1={metaPreconizado} y2={metaFaturamento} fill="rgba(250, 204, 21, 0.1)" strokeOpacity={0} label={<QuadrantLabel value="Risco" color="#facc15" />} />
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
                >
                  <LabelList dataKey="nome" position="right" style={{ fontSize: '10px', fill: 'rgba(0, 0, 0, 0.8)' }} />
                </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QuadrantePage;