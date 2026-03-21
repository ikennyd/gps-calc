
import React, { useState, useEffect, useMemo } from 'react';
import { PLATFORMS, INITIAL_STATE, ML_SHIPPING_TABLE_2026, TAX_REGIMES } from '../constants'; // ML_SHIPPING_TABLE_2026 used in weight <select>
import { CalculatorState, CalculationResult, SavedSimulation, PlanningScenario } from '../types';
import { getMLShippingCost, calculateResults, calculatePlanningScenario } from '../lib/calculations';
import InputCurrency from './InputCurrency';
import ResultsChart from './ResultsChart';
import InfoTooltip from './InfoTooltip';
import ComparisonTable from './ComparisonTable';

// Icons
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

interface CalculatorProps {
  view: 'calculator' | 'planning';
}

const Calculator: React.FC<CalculatorProps> = ({ view }) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(PLATFORMS[0].id);
  const [inputs, setInputs] = useState<CalculatorState>(INITIAL_STATE);
  
  const [targetMargin, setTargetMargin] = useState<number | ''>(20); 
  const [targetVolume, setTargetVolume] = useState<number | ''>(50); 
  const [planningScenarios, setPlanningScenarios] = useState<PlanningScenario[]>([]);

  const [productName, setProductName] = useState<string>('');
  const [history, setHistory] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('gps_calc_history');
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    const savedScenarios = localStorage.getItem('gps_planning_scenarios');
    if (savedScenarios) try { setPlanningScenarios(JSON.parse(savedScenarios)); } catch (e) {}
  }, []);

  const selectedPlatform = useMemo(() => 
    PLATFORMS.find(p => p.id === selectedPlatformId) || PLATFORMS[0], 
    [selectedPlatformId]
  );

  const isMercadoLivre = selectedPlatformId.startsWith('ml_');
  const isShopeeFree = selectedPlatformId === 'shopee_free';
  const salePriceNum = Number(inputs.salePrice) || 0;
  const weightNum = Number(inputs.weight) || 0.3;

  // Lógica de Frete Automática 2026
  const autoShippingCost = useMemo(() => {
      if (isMercadoLivre) return getMLShippingCost(salePriceNum, weightNum);
      return 0;
  }, [isMercadoLivre, salePriceNum, weightNum]);

  // Atualiza shippingCost quando as métricas do ML mudam
  useEffect(() => {
    if (isMercadoLivre) {
        setInputs(prev => ({ ...prev, shippingCost: autoShippingCost }));
    }
  }, [autoShippingCost, isMercadoLivre]);

  const results: CalculationResult = useMemo(
    () => calculateResults(inputs, selectedPlatformId),
    [inputs, selectedPlatformId]
  );

  const handleAddPlanningScenario = () => {
    if (!productName.trim()) { alert("Insira o nome do produto."); return; }
    const newScenario: PlanningScenario = {
      id: crypto.randomUUID(), createdAt: Date.now(),
      productName: productName.trim(), platformId: selectedPlatformId,
      targetUnits: targetVolume, savedInputs: { ...inputs }, 
      currentResults: calculatePlanningScenario({ ...inputs }, selectedPlatformId, targetVolume)
    };
    const updated = [newScenario, ...planningScenarios];
    setPlanningScenarios(updated);
    localStorage.setItem('gps_planning_scenarios', JSON.stringify(updated));
    setProductName('');
  };

  const handleInputChange = (field: keyof CalculatorState, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleTaxRegimeChange = (regimeId: string) => {
    const regime = TAX_REGIMES.find(r => r.id === regimeId);
    if (!regime) return;
    setInputs(prev => ({
      ...prev,
      taxRegime: regime.id,
      // Auto-fill taxRate for Simples and Lucro Presumido; leave it editable for Lucro Real
      ...(regime.id !== 'lucro_real' ? { taxRate: regime.rate } : {}),
    }));
  };

  const currentCommission = inputs.customCommission ?? selectedPlatform.defaultCommission;

  return (
    <div className="bg-[#f3f4f6] min-h-full pb-32 lg:pb-12 p-4 sm:p-6 lg:p-8">
        {view === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="bg-black text-white p-2 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Plataforma</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatformId(p.id)}
                      className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${selectedPlatformId === p.id ? 'border-black ring-1 ring-black bg-black text-white shadow-md transform scale-[1.02]' : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${selectedPlatformId === p.id ? 'text-gray-300' : 'text-gray-500'}`}>{p.name}</span>
                      <span className="font-semibold text-sm leading-tight">{p.type}</span>
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm overflow-hidden">
                        <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <InputCurrency label="Comissão (%)" value={currentCommission} onChange={(val) => handleInputChange('customCommission', val)} prefix="" suffix="%" step={0.5} />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Taxa Fixa</label>
                    <div className="py-3 px-4 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 text-base font-medium flex items-center justify-between h-[52px]">
                      <span>R$ {results.fixedFeeValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-8">
                 <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-gray-200 text-black p-2 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Venda e Custos</h2>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">É kit?</span>
                      <button onClick={() => handleInputChange('isKit', !inputs.isKit)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${inputs.isKit ? 'bg-black' : 'bg-gray-200'}`}><span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${inputs.isKit ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                   </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                 <div className="sm:col-span-2">
                    <InputCurrency label="Preço de Venda Final" value={inputs.salePrice} onChange={(val) => handleInputChange('salePrice', val)} highlight />
                 </div>

                 {isMercadoLivre && (
                     <div className="sm:col-span-2 flex flex-col gap-1.5 w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Peso do Produto (Março/2026)</label>
                        <div className="relative rounded-lg shadow-sm">
                          <select 
                              value={inputs.weight}
                              onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                              className="block w-full rounded-lg border-0 py-3.5 px-4 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-black sm:text-base font-bold text-gray-900 bg-white appearance-none transition-all duration-200"
                          >
                              {Object.keys(ML_SHIPPING_TABLE_2026).map(w => (
                                  <option key={w} value={w}>{Number(w) >= 999 ? 'Mais de 150 kg' : `Até ${w} kg`}</option>
                              ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                          </div>
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-400 italic">O custo de envio é calculado automaticamente conforme a nova política de fretes do ML.</p>
                     </div>
                 )}

                 <div className={inputs.isKit ? "sm:col-span-1" : "sm:col-span-2"}>
                   <InputCurrency label="Custo do Produto (Unit)" value={inputs.cost} onChange={(val) => handleInputChange('cost', val)} />
                 </div>
                 {inputs.isKit && <div><InputCurrency label="Qtd no Kit" value={inputs.quantity} onChange={(val) => handleInputChange('quantity', val)} prefix="" step={1} /></div>}
                 
                 <InputCurrency label={isMercadoLivre ? "Custo Envios (Auto)" : "Frete (Unitário)"} value={inputs.shippingCost} onChange={(val) => handleInputChange('shippingCost', val)} disabled={isMercadoLivre} />
                 <InputCurrency label="Extras (Embalagem)" value={inputs.otherCosts} onChange={(val) => handleInputChange('otherCosts', val)} />
                 {/* Tax Regime selector */}
                 <div className="sm:col-span-2 flex flex-col gap-1.5">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Regime Tributário</label>
                   <div className="grid grid-cols-3 gap-2">
                     {TAX_REGIMES.map(regime => (
                       <button
                         key={regime.id}
                         type="button"
                         onClick={() => handleTaxRegimeChange(regime.id)}
                         title={regime.description}
                         className={`py-2.5 px-3 rounded-lg border text-left transition-all duration-200 ${
                           inputs.taxRegime === regime.id
                             ? 'border-black ring-1 ring-black bg-black text-white'
                             : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                         }`}
                       >
                         <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
                           {regime.id === 'lucro_real' ? 'Customizado' : `${regime.rate}%`}
                         </span>
                         <span className="text-xs font-semibold leading-tight">{regime.label}</span>
                       </button>
                     ))}
                   </div>
                 </div>
                 <InputCurrency
                   label="Impostos (%)"
                   value={inputs.taxRate}
                   onChange={(val) => handleInputChange('taxRate', val)}
                   prefix=""
                   suffix="%"
                   disabled={inputs.taxRegime !== 'lucro_real'}
                 />
                 <InputCurrency label="Ads (%)" value={inputs.marketingRate} onChange={(val) => handleInputChange('marketingRate', val)} prefix="" suffix="%" />
               </div>
              </div>

              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nome do Produto</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Produto X" className="block w-full rounded-lg border-0 py-3 px-4 ring-1 ring-inset ring-gray-200 placeholder:text-gray-300 focus:ring-2 focus:ring-black sm:text-base font-medium bg-white text-gray-900" />
                 </div>
                 <button onClick={handleAddPlanningScenario} disabled={!productName.trim()} className="w-full sm:w-auto bg-black text-white px-6 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">Salvar</button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <div className={`rounded-sm shadow-lg border p-6 sm:p-8 transition-all duration-300 relative overflow-hidden ${results.profit >= 0 ? 'bg-[#7CFC00] border-[#7CFC00] text-black' : 'bg-white border-red-200'}`}>
                <div className="relative z-10">
                  <div className="flex items-center mb-2">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>Lucro Líquido</h3>
                    <InfoTooltip text="Dedução de todos os custos e taxas." className={results.profit >= 0 ? 'text-black opacity-60' : 'text-gray-400'} />
                  </div>
                  <div className={`text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight ${results.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                    <span className={`text-2xl align-top font-medium mr-1 ${results.profit >= 0 ? 'text-black opacity-60' : 'text-gray-400'}`}>R$</span>{results.profit.toFixed(2)}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`px-4 py-4 border-l-4 ${results.profit >= 0 ? 'border-black bg-black/5' : 'border-red-500 bg-red-50'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>Margem</span>
                      <span className={`text-2xl font-bold ${results.profit >= 0 ? 'text-black' : 'text-red-700'}`}>{results.margin.toFixed(1)}%</span>
                    </div>
                    <div className={`px-4 py-4 border-l-4 ${results.profit >= 0 ? 'border-black bg-black/5' : 'border-gray-300 bg-gray-50'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>ROI</span>
                      <span className={`text-2xl font-bold ${results.profit >= 0 ? 'text-black' : 'text-gray-900'}`}>{results.roi.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                 <div className="p-5 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Detalhamento</h3></div>
                 <div className="p-5 sm:p-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                       <span className="text-gray-500 font-semibold">Receita Bruta</span>
                       <span className="font-bold text-gray-900 text-lg">R$ {(Number(inputs.salePrice)||0).toFixed(2)}</span>
                    </div>
                    <div className="space-y-3 text-gray-600">
                       <div className="flex justify-between items-center"><span>Custo Produto {inputs.isKit && `(x${inputs.quantity})`}</span><span className="font-medium">- R$ {results.totalProductCost.toFixed(2)}</span></div>
                       <div className="flex justify-between items-center"><span>Taxas (Comissão + Fixa)</span><span className="font-medium">- R$ {(results.commissionValue + results.fixedFeeValue).toFixed(2)}</span></div>
                       <div className="flex justify-between items-center"><span>Frete (ML 2026)</span><span className="font-medium">- R$ {Number(inputs.shippingCost).toFixed(2)}</span></div>
                       <div className="flex justify-between items-center"><span>Impostos + Marketing</span><span className="font-medium">- R$ {(results.taxValue + results.marketingValue).toFixed(2)}</span></div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 sm:p-8">
                <ResultsChart inputs={inputs} results={results} />
              </div>
            </div>
            
            <div className="lg:col-span-12">
              <ComparisonTable inputs={inputs} />
            </div>
          </div>
        )}
        {view === 'planning' && (
            <div className="text-center p-20 text-gray-400">Em desenvolvimento com as novas regras ML 2026...</div>
        )}
    </div>
  );
};

export default Calculator;