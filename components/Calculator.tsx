import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PLATFORMS, INITIAL_STATE } from '../constants';
import { CalculatorState, CalculationResult, SavedSimulation, PlanningScenario } from '../types';
import InputCurrency from './InputCurrency';
import ResultsChart from './ResultsChart';
import InfoTooltip from './InfoTooltip';
import ComparisonTable from './ComparisonTable';

// Icons simples
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
);
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

// --- HELPER FUNCTION: CÁLCULO DE CENÁRIO (FORA DO COMPONENTE) ---
const calculateScenarioResults = (inputs: CalculatorState, platformId: string, units: number | '') => {
  const platform = PLATFORMS.find(p => p.id === platformId) || PLATFORMS[0];
  const safeNum = (val: number | '') => (val === '' ? 0 : val);

  const cost = safeNum(inputs.cost);
  const salePrice = safeNum(inputs.salePrice);
  const quantity = inputs.isKit ? safeNum(inputs.quantity) : 1;
  const taxRate = safeNum(inputs.taxRate);
  const marketingRate = safeNum(inputs.marketingRate);
  const otherCosts = safeNum(inputs.otherCosts);
  const inputShipping = safeNum(inputs.shippingCost);

  // Regras da Plataforma
  const isShopeeFree = platformId === 'shopee_free';
  const isMercadoLivre = platformId.startsWith('ml_');
  const isMlBelow79 = isMercadoLivre && salePrice < 79;

  // Lógica de Frete (Pago pelo Vendedor?)
  const shippingCost = (isShopeeFree || isMlBelow79) ? 0 : inputShipping;

  // Comissão
  const commissionRate = inputs.customCommission ?? platform.defaultCommission;
  const commissionValue = salePrice * (commissionRate / 100);

  // Taxa Fixa
  let fixedFeeValue = 0;
  if (platform.alwaysApplyFixed) {
    fixedFeeValue = platform.defaultFixedFee;
  } else if (platform.threshold) {
    if (salePrice < platform.threshold) {
      fixedFeeValue = platform.defaultFixedFee;
    }
  }

  // Outros Custos Variáveis
  const taxValue = salePrice * (taxRate / 100);
  const marketingValue = salePrice * (marketingRate / 100);

  // Totais Unitários
  const totalDeductions = commissionValue + fixedFeeValue + taxValue + marketingValue + shippingCost + otherCosts;
  const totalProductCost = cost * quantity;
  const profitPerUnit = salePrice - totalDeductions - totalProductCost;

  // Agregados pelo Volume (Units)
  const safeUnits = units === '' ? 0 : units; // Trata string vazia como 0 para cálculos
  const projectedRevenue = salePrice * safeUnits;
  const totalCost = (totalProductCost + totalDeductions) * safeUnits; // Custo Total = Tudo que sai (Produto + Taxas + Frete)
  const projectedProfit = profitPerUnit * safeUnits;

  const margin = salePrice > 0 ? (profitPerUnit / salePrice) * 100 : 0;
  // ROI baseado no Custo do Produto (consistente com a calculadora principal)
  const roi = totalProductCost > 0 ? (profitPerUnit / totalProductCost) * 100 : 0;

  return {
    projectedRevenue,
    totalCost,
    projectedProfit,
    margin,
    roi
  };
};

const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'planning'>('calculator');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(PLATFORMS[0].id);
  // @ts-ignore
  const [inputs, setInputs] = useState<CalculatorState>(INITIAL_STATE);
  
  // Estados para o Planejamento
  const [targetMargin, setTargetMargin] = useState<number | ''>(20); 
  const [targetVolume, setTargetVolume] = useState<number | ''>(50); 
  const [planningScenarios, setPlanningScenarios] = useState<PlanningScenario[]>([]);

  // History State
  const [productName, setProductName] = useState<string>('');
  const [history, setHistory] = useState<SavedSimulation[]>([]);

  // Load history & Scenarios
  useEffect(() => {
    const savedHistory = localStorage.getItem('gps_calc_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) { console.error(e); }
    }

    const savedScenarios = localStorage.getItem('gps_planning_scenarios');
    if (savedScenarios) {
      try {
        setPlanningScenarios(JSON.parse(savedScenarios));
      } catch (e) { console.error(e); }
    }
  }, []);

  const selectedPlatform = useMemo(() => 
    PLATFORMS.find(p => p.id === selectedPlatformId) || PLATFORMS[0], 
    [selectedPlatformId]
  );

  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      customCommission: null
    }));
  }, [selectedPlatformId]);

  const isShopeeFree = selectedPlatformId === 'shopee_free';
  const isMercadoLivre = selectedPlatformId.startsWith('ml_');
  
  const salePriceNum = inputs.salePrice === '' ? 0 : inputs.salePrice;
  const isMlBelow79 = isMercadoLivre && salePriceNum < 79;
  const isShippingDisabled = isShopeeFree || isMlBelow79;
  
  let shippingLabel = "Frete (Pago por você)";
  if (isShopeeFree) shippingLabel = "Frete (Incluso na comissão)";
  else if (isMlBelow79) shippingLabel = "Frete (Pago pelo Comprador)";
  else if (isMercadoLivre && salePriceNum >= 79) shippingLabel = "Frete (Grátis p/ Cliente)";

  // --- LÓGICA PRINCIPAL DE CÁLCULO ---
  const results: CalculationResult = useMemo(() => {
    const getVal = (val: number | '') => (val === '' ? 0 : val);
    const cost = getVal(inputs.cost);
    const salePrice = getVal(inputs.salePrice);
    const shippingCost = (isShopeeFree || (isMercadoLivre && salePrice < 79)) 
      ? 0 
      : getVal(inputs.shippingCost);
    const taxRate = getVal(inputs.taxRate);
    const marketingRate = getVal(inputs.marketingRate);
    const otherCosts = getVal(inputs.otherCosts);
    const quantity = inputs.isKit ? getVal(inputs.quantity) : 1;
    const commissionRate = inputs.customCommission !== null ? inputs.customCommission : selectedPlatform.defaultCommission;
    const commissionValue = salePrice * (commissionRate / 100);

    let fixedFeeValue = 0;
    if (selectedPlatform.alwaysApplyFixed) {
      fixedFeeValue = selectedPlatform.defaultFixedFee;
    } else if (selectedPlatform.threshold) {
      if (salePrice < selectedPlatform.threshold) {
        fixedFeeValue = selectedPlatform.defaultFixedFee;
      }
    }

    const taxValue = salePrice * (taxRate / 100);
    const marketingValue = salePrice * (marketingRate / 100); 
    const totalProductCost = cost * quantity;
    const totalDeductions = commissionValue + fixedFeeValue + taxValue + marketingValue + shippingCost + otherCosts;
    const netRevenue = salePrice - totalDeductions; 
    const profit = salePrice - totalDeductions - totalProductCost;
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const roi = totalProductCost > 0 ? (profit / totalProductCost) * 100 : 0;
    const variableRate = (commissionRate + taxRate + marketingRate) / 100;
    const hardCosts = totalProductCost + shippingCost + otherCosts + (salePrice < (selectedPlatform.threshold || 0) ? selectedPlatform.defaultFixedFee : 0);
    const breakEven = hardCosts / (1 - variableRate);

    return {
      commissionValue,
      fixedFeeValue,
      taxValue,
      marketingValue,
      totalDeductions,
      netRevenue,
      profit,
      margin,
      roi,
      breakEven,
      totalProductCost
    };
  }, [inputs, selectedPlatform, isShopeeFree, isMercadoLivre]);

  // --- HANDLERS DO PLANEJAMENTO ---

  const handleAddPlanningScenario = () => {
    if (!productName.trim()) {
      alert("Por favor, insira o nome do produto para salvar.");
      return;
    }

    const newScenario: PlanningScenario = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      productName: productName.trim(),
      platformId: selectedPlatformId,
      targetUnits: targetVolume,
      savedInputs: { ...inputs }, // Snapshot dos inputs
      currentResults: calculateScenarioResults({ ...inputs }, selectedPlatformId, targetVolume)
    };

    const updatedScenarios = [newScenario, ...planningScenarios];
    setPlanningScenarios(updatedScenarios);
    localStorage.setItem('gps_planning_scenarios', JSON.stringify(updatedScenarios));
    
    // Opcional: Salvar também no histórico antigo se desejar manter a lista lateral
    // const newHistoryItem: SavedSimulation = { ... }
    // Mas focaremos no cenário novo.
    
    setProductName('');
    setActiveTab('planning');
  };

  const handleUpdateScenarioPlatform = (id: string, newPlatformId: string) => {
    const updated = planningScenarios.map(sc => {
      if (sc.id === id) {
        return {
          ...sc,
          platformId: newPlatformId,
          currentResults: calculateScenarioResults(sc.savedInputs, newPlatformId, sc.targetUnits)
        };
      }
      return sc;
    });
    setPlanningScenarios(updated);
    localStorage.setItem('gps_planning_scenarios', JSON.stringify(updated));
  };

  const handleUpdateScenarioUnits = (id: string, newUnits: number | '') => {
    const updated = planningScenarios.map(sc => {
      if (sc.id === id) {
        return {
          ...sc,
          targetUnits: newUnits,
          currentResults: calculateScenarioResults(sc.savedInputs, sc.platformId, newUnits)
        };
      }
      return sc;
    });
    setPlanningScenarios(updated);
    localStorage.setItem('gps_planning_scenarios', JSON.stringify(updated));
  };

  const handleDeleteScenario = (id: string) => {
    const updated = planningScenarios.filter(sc => sc.id !== id);
    setPlanningScenarios(updated);
    localStorage.setItem('gps_planning_scenarios', JSON.stringify(updated));
  };

  const handleInputChange = (field: keyof CalculatorState, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadSimulation = (sim: SavedSimulation) => {
    setSelectedPlatformId(sim.platformId);
    setInputs(sim.inputs);
    setProductName(sim.productName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSimulation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('gps_calc_history', JSON.stringify(updatedHistory));
  };

  const currentCommission = inputs.customCommission ?? selectedPlatform.defaultCommission;

  // Calculos para a aba de Planejamento (Visualização "Preço Sugerido")
  // Ainda precisamos dessa função para mostrar os cards de sugestão de preço na aba Planning
  const calculatePriceForMargin = (targetMarginPercent: number | '') => {
      const margin = targetMarginPercent === '' ? 0 : targetMarginPercent;
      const getVal = (val: number | '') => (val === '' ? 0 : val);
      const cost = getVal(inputs.cost);
      const quantity = inputs.isKit ? getVal(inputs.quantity) : 1;
      const totalProductCost = cost * quantity;
      const shippingInput = getVal(inputs.shippingCost);
      const otherCosts = getVal(inputs.otherCosts);
      const fixedFee = selectedPlatform.defaultFixedFee;
      const commissionRate = inputs.customCommission ?? selectedPlatform.defaultCommission;
      const taxRate = getVal(inputs.taxRate);
      const mktRate = getVal(inputs.marketingRate);
      const totalVariableRate = (commissionRate + taxRate + mktRate + margin) / 100;
      if (totalVariableRate >= 1) return 0;
      const hardCostsWithShipping = totalProductCost + otherCosts + shippingInput + fixedFee;
      return hardCostsWithShipping / (1 - totalVariableRate);
  };

  const breakEvenPrice = calculatePriceForMargin(0);
  const targetPrice = calculatePriceForMargin(targetMargin);

  // Variables for Planning Projection (ADDED)
  const safeTargetVolume = targetVolume === '' ? 0 : targetVolume;
  const safeTargetMargin = targetMargin === '' ? 0 : targetMargin;
  const projectedRevenue = targetPrice * safeTargetVolume;
  const projectedProfit = projectedRevenue * (safeTargetMargin / 100);

  return (
    <div className="pb-36 sm:pb-12 bg-[#f3f4f6] min-h-screen">
      
      {/* Header Section */}
      <div className="bg-black text-white pt-8 pb-24 px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">Calculadora de Lucro</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mb-6">
            Simule a rentabilidade do seu negócio com precisão estratégica.
          </p>
          
          {/* TABS NAVIGATION */}
          <div className="flex gap-2 p-1 bg-gray-900/50 backdrop-blur-sm rounded-lg w-fit">
            <button 
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'calculator' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <CalculatorIcon />
              Calculadora
            </button>
            <button 
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'planning' ? 'bg-[#7CFC00] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <TargetIcon />
              Planejamento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        
        {/* === ABA: CALCULADORA (VISUALIZAÇÃO PADRÃO) === */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: INPUTS */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              
              {/* Platform Selection */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="bg-black text-white p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Plataforma</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatformId(p.id)}
                      className={`
                        relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200
                        ${selectedPlatformId === p.id 
                          ? 'border-black ring-1 ring-black bg-black text-white shadow-md transform scale-[1.02]' 
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
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
                  <InputCurrency 
                    label="Comissão (%)"
                    value={currentCommission}
                    onChange={(val) => handleInputChange('customCommission', val)}
                    prefix=""
                    suffix="%"
                    step={0.5}
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Taxa Fixa</label>
                    <div className="py-3 px-4 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 text-base font-medium flex items-center justify-between h-[52px]">
                      <span>R$ {results.fixedFeeValue.toFixed(2)}</span>
                      {selectedPlatform.threshold && (Number(inputs.salePrice)||0) >= selectedPlatform.threshold && (
                        <span className="text-[10px] uppercase tracking-wide bg-[#7CFC00] text-black px-2 py-0.5 font-bold rounded">Isento</span>
                      )}
                      {selectedPlatform.threshold && (Number(inputs.salePrice)||0) < selectedPlatform.threshold && (
                        <span className="text-[10px] uppercase tracking-wide bg-gray-800 text-white px-2 py-0.5 font-bold rounded">Aplicado</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product & Costs Card */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-8">
                 <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-gray-200 text-black p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Custos</h2>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-bold text-gray-600 cursor-pointer uppercase tracking-wider" onClick={() => handleInputChange('isKit', !inputs.isKit)}>É kit?</span>
                      <button 
                        onClick={() => handleInputChange('isKit', !inputs.isKit)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${inputs.isKit ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inputs.isKit ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                   </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                 <div className="sm:col-span-2">
                    <InputCurrency 
                     label="Preço de Venda (Total)"
                     value={inputs.salePrice}
                     onChange={(val) => handleInputChange('salePrice', val)}
                     highlight
                   />
                 </div>

                 <div className={inputs.isKit ? "sm:col-span-1" : "sm:col-span-2"}>
                   <InputCurrency 
                     label="Custo do Produto (Unit)"
                     value={inputs.cost}
                     onChange={(val) => handleInputChange('cost', val)}
                   />
                 </div>

                 {inputs.isKit && (
                    <div>
                      <InputCurrency 
                       label="Qtd no Kit"
                       value={inputs.quantity}
                       onChange={(val) => handleInputChange('quantity', val)}
                       prefix=""
                       step={1}
                     />
                    </div>
                 )}
                 
                 <div className="sm:col-span-2 border-t border-gray-100 my-1"></div>

                 <InputCurrency 
                   label={shippingLabel}
                   value={isShippingDisabled ? 0 : inputs.shippingCost}
                   onChange={(val) => handleInputChange('shippingCost', val)}
                   disabled={isShippingDisabled}
                 />
                  <InputCurrency 
                   label="Extras (Emb/CAV)"
                   value={inputs.otherCosts}
                   onChange={(val) => handleInputChange('otherCosts', val)}
                 />
                 <InputCurrency 
                   label="Impostos (%)"
                   value={inputs.taxRate}
                   onChange={(val) => handleInputChange('taxRate', val)}
                   prefix=""
                   suffix="%"
                 />
                 <InputCurrency 
                   label="Marketing / Ads (%)"
                   value={inputs.marketingRate}
                   onChange={(val) => handleInputChange('marketingRate', val)}
                   prefix=""
                   suffix="%"
                 />

                  {/* NOVO CAMPO: CALCULAR POR META DE MARGEM */}
                  <div className="sm:col-span-2 border-t border-gray-100 mt-2 pt-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                          <div className="w-full sm:w-1/2">
                              <InputCurrency 
                                  label="Meta de Margem Desejada"
                                  value={targetMargin}
                                  onChange={(val) => setTargetMargin(val)}
                                  prefix=""
                                  suffix="%"
                                  placeholder="20"
                              />
                          </div>
                          <div className="w-full sm:w-1/2">
                               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Preço Sugerido</label>
                               <div className="relative rounded-lg shadow-sm">
                                  <div className="block w-full rounded-lg border-0 py-3.5 pl-4 pr-20 bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 font-bold sm:text-lg flex items-center">
                                      R$ {targetPrice > 0 ? targetPrice.toFixed(2) : '---'}
                                  </div>
                                  {targetPrice > 0 && (
                                       <button 
                                          onClick={() => handleInputChange('salePrice', Number(targetPrice.toFixed(2)))}
                                          className="absolute right-2 top-2 bottom-2 bg-green-200 hover:bg-green-300 text-green-800 text-[10px] font-bold uppercase px-3 rounded transition-colors"
                                       >
                                          Aplicar
                                       </button>
                                  )}
                               </div>
                          </div>
                      </div>
                  </div>

               </div>
              </div>
              
              {/* History List */}
              {history.length > 0 && (
                <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                     <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Histórico Salvo</h3>
                     <span className="text-xs text-gray-400">{history.length} simulações</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {history.map((sim) => {
                       const platform = PLATFORMS.find(p => p.id === sim.platformId);
                       return (
                       <div 
                         key={sim.id} 
                         onClick={() => handleLoadSimulation(sim)}
                         className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center group"
                       >
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center p-1">
                                  <img src={platform?.logoUrl} alt={platform?.name} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-gray-900">{sim.productName}</p>
                                 <div className="flex gap-2 text-xs text-gray-500">
                                   <span>{new Date(sim.createdAt).toLocaleDateString()}</span>
                                   <span>•</span>
                                   <span>{platform?.name}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="text-right">
                                 <p className={`font-bold text-sm ${sim.resultsSummary.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                                   R$ {sim.resultsSummary.profit.toFixed(2)}
                                 </p>
                                 <p className="text-xs text-gray-400">{sim.resultsSummary.margin.toFixed(0)}% Margem</p>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteSimulation(sim.id, e)}
                                className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                           </div>
                       </div>
                       )
                    })}
                  </div>
                </div>
              )}

              {/* Save Simulation Card */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nome do Produto</label>
                    <input 
                      type="text" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Ex: Fone de Ouvido Bluetooth"
                      className="block w-full rounded-lg border-0 py-3 px-4 ring-1 ring-inset ring-gray-200 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-base font-medium transition-all bg-white text-gray-900"
                    />
                 </div>
                 <button 
                  onClick={handleAddPlanningScenario}
                  disabled={!productName.trim()}
                  className="w-full sm:w-auto bg-black text-white px-6 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   Salvar
                 </button>
              </div>

            </div>

            {/* RIGHT COLUMN: RESULTS */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              
              {/* Main Profit Card */}
              <div className={`rounded-sm shadow-lg border p-6 sm:p-8 transition-all duration-300 relative overflow-hidden ${results.profit >= 0 ? 'bg-[#7CFC00] border-[#7CFC00] text-black' : 'bg-white border-red-200 ring-1 ring-red-100'}`}>
                <div className="relative z-10">
                  <div className="flex items-center mb-2">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>Lucro Líquido</h3>
                    <InfoTooltip text="O valor que sobra no seu bolso após deduzir todos os custos." className={results.profit >= 0 ? 'text-black opacity-60' : 'text-gray-400'} />
                  </div>
                  
                  <div className={`text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight ${results.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                    <span className={`text-2xl align-top font-medium mr-1 ${results.profit >= 0 ? 'text-black opacity-60' : 'text-gray-400'}`}>R$</span>{results.profit.toFixed(2)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`px-4 py-4 border-l-4 ${results.profit >= 0 ? 'border-black bg-black/5' : 'border-red-500 bg-red-50'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>Margem</span>
                      </div>
                      <span className={`text-2xl font-bold ${results.profit >= 0 ? 'text-black' : 'text-red-700'}`}>{results.margin.toFixed(1)}%</span>
                    </div>
                    
                    <div className={`px-4 py-4 border-l-4 ${results.profit >= 0 ? 'border-black bg-black/5' : 'border-gray-300 bg-gray-50'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>ROI</span>
                      </div>
                      <span className={`text-2xl font-bold ${results.profit >= 0 ? 'text-black' : 'text-gray-900'}`}>{results.roi.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                 <div className="p-5 border-b border-gray-100 bg-gray-50">
                   <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Detalhamento Financeiro</h3>
                 </div>
                 <div className="p-5 sm:p-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 border-dashed">
                       <div className="flex items-center">
                          <span className="text-gray-500 font-semibold">Receita Bruta</span>
                       </div>
                       <span className="font-bold text-gray-900 text-lg">R$ {(Number(inputs.salePrice)||0).toFixed(2)}</span>
                    </div>

                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-gray-600 group">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                             <span className="flex items-center">
                               Custo Produto 
                               {inputs.isKit && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 text-gray-600 font-bold ml-2">x{inputs.quantity}</span>}
                             </span>
                          </div>
                          <span className="font-medium">- R$ {results.totalProductCost.toFixed(2)}</span>
                       </div>

                       <div className="flex justify-between items-center text-gray-600">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                             <span className="flex items-center">Comissão + Taxas</span>
                          </div>
                         <span className="font-medium">- R$ {(results.commissionValue + results.fixedFeeValue).toFixed(2)}</span>
                      </div>
                      
                       <div className="flex justify-between items-center text-gray-600">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                             <span className="flex items-center">Impostos</span>
                          </div>
                         <span className="font-medium">- R$ {results.taxValue.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-gray-600">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                             <span className="flex items-center">Frete, Ads & Extras</span>
                          </div>
                         <span className="font-medium">- R$ {((isShippingDisabled ? 0 : Number(inputs.shippingCost)||0) + (Number(inputs.otherCosts)||0) + results.marketingValue).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200 flex justify-between items-center">
                       <div className="flex items-center">
                          <span className="font-bold text-gray-900 uppercase text-xs tracking-wider">Custo Total</span>
                       </div>
                       <span className="font-bold text-gray-900">R$ {((Number(inputs.salePrice)||0) - results.profit).toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 sm:p-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">Distribuição de Receita</h3>
                <ResultsChart inputs={inputs} results={results} />
              </div>

            </div>
            
            {/* BOTTOM COMPARISON TABLE */}
            <div className="lg:col-span-12">
              <ComparisonTable inputs={inputs} />
            </div>

          </div>
        )}

        {/* === ABA: PLANEJAMENTO (NOVA) === */}
        {activeTab === 'planning' && (
          <div className="space-y-6">
            
            {/* INSTRUÇÕES E INPUTS DE META */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-4 space-y-6">
                <div className="bg-black text-white p-6 rounded-sm shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Simulação Rápida</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    Descubra o preço ideal baseado na sua meta de margem para a plataforma selecionada na calculadora.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Meta de Margem (%)</label>
                      <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                        <input 
                          type="number" 
                          value={targetMargin} 
                          onChange={(e) => {
                             const val = e.target.value;
                             setTargetMargin(val === '' ? '' : Number(val));
                          }}
                          className="bg-transparent text-white font-bold text-lg w-full outline-none" 
                        />
                        <span className="text-gray-500 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
               </div>

               <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-sm p-6 relative overflow-hidden group hover:border-gray-300 transition-all">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Preço para Empatar</h4>
                      <div className="text-3xl font-bold text-gray-900">R$ {breakEvenPrice > 0 ? breakEvenPrice.toFixed(2) : "Erro*"}</div>
                      <div className="mt-2 text-xs text-red-500 font-medium bg-red-50 inline-block px-2 py-1 rounded">Margem 0%</div>
                    </div>
                    <div className="bg-[#f0fdf4] border border-green-200 rounded-sm p-6 relative overflow-hidden ring-1 ring-green-100">
                      <h4 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-1">Preço Sugerido</h4>
                      <div className="text-4xl font-black text-green-700">R$ {targetPrice > 0 ? targetPrice.toFixed(2) : "Verifique taxas"}</div>
                      <div className="mt-2 text-xs text-green-800 font-bold bg-green-200 inline-block px-2 py-1 rounded">Margem {targetMargin}%</div>
                    </div>
                  </div>

                  {/* PROJEÇÃO DE ESCALA */}
                  <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-8 mt-6">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7CFC00]"></span>
                      Projeção de Faturamento
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-gray-500 mb-1">
                          Vendendo <strong className="text-black">{safeTargetVolume} unidades</strong>
                        </p>
                        <p className="text-sm text-gray-500">
                          no preço sugerido de <strong className="text-black">R$ {targetPrice > 0 ? targetPrice.toFixed(2) : '0.00'}</strong>
                        </p>
                      </div>

                      <div className="h-10 w-px bg-gray-300 hidden sm:block"></div>

                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Faturamento Bruto</p>
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {projectedRevenue.toFixed(2)}
                        </p>
                      </div>

                      <div className="h-10 w-px bg-gray-300 hidden sm:block"></div>

                      <div className="text-center relative">
                        <div className="absolute -top-3 -right-3">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Lucro Líquido Total</p>
                        <p className="text-3xl font-black text-[#15803d]">
                          R$ {projectedProfit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-center text-xs text-gray-400">
                      *Cálculos baseados nas taxas atuais da plataforma {selectedPlatform.name}.
                    </p>
                  </div>
               </div>
            </div>

            {/* TABELA DE GERENCIAMENTO DE CENÁRIOS */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden mt-8">
                <div className="p-5 border-b border-gray-100 bg-black text-white flex justify-between items-center">
                  <h3 className="font-bold text-sm uppercase tracking-wide">Gerenciador de Cenários Salvos</h3>
                  <span className="text-xs text-gray-400">{planningScenarios.length} cenários</span>
                </div>
                
                {planningScenarios.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm">
                    Nenhum cenário salvo. Configure na calculadora e clique em "Salvar".
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-4 font-bold tracking-wider">Produto</th>
                          <th className="px-4 py-4 font-bold tracking-wider">Plataforma</th>
                          <th className="px-4 py-4 font-bold tracking-wider w-32">Unid. Vendidas</th>
                          <th className="px-4 py-4 font-bold tracking-wider text-right">Faturamento</th>
                          <th className="px-4 py-4 font-bold tracking-wider text-right">Custo Total</th>
                          <th className="px-4 py-4 font-bold tracking-wider text-right">Lucro</th>
                          <th className="px-4 py-4 font-bold tracking-wider text-right">ROI</th>
                          <th className="px-4 py-4 font-bold tracking-wider text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {planningScenarios.map((scenario) => {
                          const currentPlatform = PLATFORMS.find(p => p.id === scenario.platformId) || PLATFORMS[0];
                          
                          return (
                            <tr key={scenario.id} className="bg-white hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">
                                {scenario.productName}
                                <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                                  {new Date(scenario.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-white border border-gray-200 p-0.5 shrink-0">
                                    <img src={currentPlatform.logoUrl} alt="" className="w-full h-full object-contain" />
                                  </div>
                                  <select 
                                    value={scenario.platformId}
                                    onChange={(e) => handleUpdateScenarioPlatform(scenario.id, e.target.value)}
                                    className="block w-full text-xs py-1 pl-1 pr-6 border-gray-200 rounded focus:ring-black focus:border-black bg-transparent"
                                  >
                                    {PLATFORMS.map(p => (
                                      <option key={p.id} value={p.id}>{p.name} - {p.type}</option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <input 
                                  type="number"
                                  value={scenario.targetUnits}
                                  onChange={(e) => {
                                     const val = e.target.value;
                                     handleUpdateScenarioUnits(scenario.id, val === '' ? '' : Number(val));
                                  }}
                                  className="w-20 text-sm border-gray-200 rounded py-1 px-2 focus:ring-black focus:border-black font-medium"
                                />
                              </td>
                              <td className="px-4 py-4 font-medium text-gray-900 text-right whitespace-nowrap">
                                R$ {scenario.currentResults.projectedRevenue.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 text-gray-500 text-right whitespace-nowrap">
                                R$ {scenario.currentResults.totalCost.toFixed(2)}
                              </td>
                              <td className={`px-4 py-4 font-black text-right whitespace-nowrap ${scenario.currentResults.projectedProfit >= 0 ? 'text-[#15803d]' : 'text-red-600'}`}>
                                R$ {scenario.currentResults.projectedProfit.toFixed(2)}
                              </td>
                              <td className="px-4 py-4 font-bold text-gray-900 text-right">
                                {scenario.currentResults.roi.toFixed(0)}%
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button 
                                  onClick={() => handleDeleteScenario(scenario.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  title="Excluir Cenário"
                                >
                                  <TrashIcon />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

          </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR (Apenas na calculadora) */}
      {activeTab === 'calculator' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] lg:hidden z-50">
           <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className={`flex flex-col px-3 py-1 rounded ${results.profit >= 0 ? 'bg-[#7CFC00]' : 'bg-red-50'}`}>
                <div className="flex items-center gap-1">
                   <span className={`text-[10px] font-bold uppercase tracking-wide ${results.profit >= 0 ? 'text-black' : 'text-red-500'}`}>Lucro</span>
                </div>
                <span className={`text-xl sm:text-2xl font-black ${results.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                  R$ {results.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2 sm:gap-4">
                 <div className="flex flex-col items-end px-2 sm:px-4 border-r border-gray-200">
                    <span className="text-[10px] uppercase text-gray-400 font-bold">Margem</span>
                    <span className={`font-bold ${results.profit >= 0 ? 'text-black' : 'text-gray-900'}`}>{results.margin.toFixed(0)}%</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-gray-400 font-bold">ROI</span>
                    <span className={`font-bold ${results.profit >= 0 ? 'text-black' : 'text-gray-900'}`}>{results.roi.toFixed(0)}%</span>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Calculator;