import React, { useState, useEffect, useMemo } from 'react';
import { PLATFORMS, INITIAL_STATE } from '../constants';
import { CalculatorState, CalculationResult, SavedSimulation } from '../types';
import InputCurrency from './InputCurrency';
import ResultsChart from './ResultsChart';
import InfoTooltip from './InfoTooltip';
import ComparisonTable from './ComparisonTable';

const Calculator: React.FC = () => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(PLATFORMS[0].id);
  // @ts-ignore - TS might complain about initial state types vs 'number | ""' but it works for logic
  const [inputs, setInputs] = useState<CalculatorState>(INITIAL_STATE);
  
  // History State
  const [productName, setProductName] = useState<string>('');
  const [history, setHistory] = useState<SavedSimulation[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gps_calc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
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

  // Platform specific flags
  const isShopeeFree = selectedPlatformId === 'shopee_free';
  const isMercadoLivre = selectedPlatformId.startsWith('ml_');
  
  // Helper to safely get number from potentially empty string input for render logic
  const salePriceNum = inputs.salePrice === '' ? 0 : inputs.salePrice;
  
  // ML Rule: Below 79, seller usually pays 0 shipping (buyer pays).
  const isMlBelow79 = isMercadoLivre && salePriceNum < 79;

  // Shipping Input Logic
  const isShippingDisabled = isShopeeFree || isMlBelow79;
  
  let shippingLabel = "Frete (Pago por você)";
  if (isShopeeFree) shippingLabel = "Frete (Incluso na comissão)";
  else if (isMlBelow79) shippingLabel = "Frete (Pago pelo Comprador)";
  else if (isMercadoLivre && salePriceNum >= 79) shippingLabel = "Frete (Grátis p/ Cliente)";

  const results: CalculationResult = useMemo(() => {
    const getVal = (val: number | '') => (val === '' ? 0 : val);

    const cost = getVal(inputs.cost);
    const salePrice = getVal(inputs.salePrice);
    
    // Shipping Logic:
    // 1. Shopee Free: Included in commission -> Cost 0
    // 2. ML < 79: Paid by Buyer -> Cost 0
    const shippingCost = (isShopeeFree || (isMercadoLivre && salePrice < 79)) 
      ? 0 
      : getVal(inputs.shippingCost);

    const taxRate = getVal(inputs.taxRate);
    const marketingRate = getVal(inputs.marketingRate);
    const otherCosts = getVal(inputs.otherCosts);
    const quantity = inputs.isKit ? getVal(inputs.quantity) : 1;
    
    // 1. Determine Commission %
    const commissionRate = inputs.customCommission !== null ? inputs.customCommission : selectedPlatform.defaultCommission;
    const commissionValue = salePrice * (commissionRate / 100);

    // 2. Determine Fixed Fee
    let fixedFeeValue = 0;
    if (selectedPlatform.alwaysApplyFixed) {
      fixedFeeValue = selectedPlatform.defaultFixedFee;
    } else if (selectedPlatform.threshold) {
      if (salePrice < selectedPlatform.threshold) {
        fixedFeeValue = selectedPlatform.defaultFixedFee;
      }
    }

    // 3. Other Deductions
    const taxValue = salePrice * (taxRate / 100);
    const marketingValue = salePrice * (marketingRate / 100); 
    
    // 4. Totals
    // Calculate total product cost based on Kit Quantity
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

  const handleInputChange = (field: keyof CalculatorState, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSimulation = () => {
    if (!productName.trim()) {
      alert("Por favor, insira o nome do produto para salvar.");
      return;
    }

    const newSimulation: SavedSimulation = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      productName: productName.trim(),
      platformId: selectedPlatformId,
      inputs: { ...inputs },
      resultsSummary: {
        profit: results.profit,
        margin: results.margin
      }
    };

    const updatedHistory = [newSimulation, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('gps_calc_history', JSON.stringify(updatedHistory));
    setProductName(''); // Reset name field
  };

  const handleLoadSimulation = (sim: SavedSimulation) => {
    setSelectedPlatformId(sim.platformId);
    setInputs(sim.inputs);
    setProductName(sim.productName); // Optional: load the name back too
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSimulation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('gps_calc_history', JSON.stringify(updatedHistory));
  };

  const currentCommission = inputs.customCommission ?? selectedPlatform.defaultCommission;

  return (
    <div className="pb-36 sm:pb-12">
      
      {/* Header Section - Black Style */}
      <div className="bg-black text-white pt-8 pb-24 px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">Calculadora de Lucro</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl">
            Simule a rentabilidade do seu negócio com precisão estratégica.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* Platform Selection Card - Modern Visual Selector */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-black text-white p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Plataforma</h2>
              </div>
              
              {/* Modern Grid Selector */}
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
                    {/* Brand Icon Image */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm overflow-hidden">
                      <img 
                        src={p.logoUrl} 
                        alt={p.name} 
                        className="w-full h-full object-contain"
                      />
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
                 
                 {/* KIT TOGGLE */}
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
              </div>
            </div>
            
            {/* History List Card */}
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
                                 <span>{platform?.name} ({platform?.type})</span>
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

            {/* Save Simulation Card - Moved to Bottom */}
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
                onClick={handleSaveSimulation}
                disabled={!productName.trim()}
                className="w-full sm:w-auto bg-black text-white px-6 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
               >
                 Salvar
               </button>
            </div>

          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            
            {/* Main Profit Card - #7CFC00 BACKGROUND, NO SHAPES, BLACK TEXT */}
            <div className={`rounded-sm shadow-lg border p-6 sm:p-8 transition-all duration-300 relative overflow-hidden ${results.profit >= 0 ? 'bg-[#7CFC00] border-[#7CFC00] text-black' : 'bg-white border-red-200 ring-1 ring-red-100'}`}>
              
              {/* Clean Background - No Shapes */}

              <div className="relative z-10">
                <div className="flex items-center mb-2">
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>Lucro Líquido</h3>
                  <InfoTooltip text="O valor que sobra no seu bolso após deduzir todos os custos (produto, taxas, impostos e frete)." className={results.profit >= 0 ? 'text-black opacity-60' : 'text-gray-400'} />
                </div>
                
                <div className={`text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight ${results.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                  <span className={`text-2xl align-top font-medium mr-1 ${results.profit >= 0 ? 'text-black opacity-60' : 'text-gray-400'}`}>R$</span>{results.profit.toFixed(2)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`px-4 py-4 border-l-4 ${results.profit >= 0 ? 'border-black bg-black/5' : 'border-red-500 bg-red-50'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>Margem</span>
                      <InfoTooltip text="Porcentagem do preço de venda que é lucro real. (Lucro ÷ Preço de Venda)" className={`ml-0.5 ${results.profit >= 0 ? 'text-black opacity-60' : ''}`} />
                    </div>
                    <span className={`text-2xl font-bold ${results.profit >= 0 ? 'text-black' : 'text-red-700'}`}>{results.margin.toFixed(1)}%</span>
                  </div>
                  
                  <div className={`px-4 py-4 border-l-4 ${results.profit >= 0 ? 'border-black bg-black/5' : 'border-gray-300 bg-gray-50'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${results.profit >= 0 ? 'text-black' : 'text-gray-500'}`}>ROI</span>
                      <InfoTooltip text="Retorno sobre Investimento. Quanto você ganha para cada R$1 investido no produto. (Lucro ÷ Custo Produto)" className={`ml-0.5 ${results.profit >= 0 ? 'text-black opacity-60' : ''}`} />
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
                        <InfoTooltip text="Valor total da venda pago pelo cliente." className="ml-1" />
                     </div>
                     <span className="font-bold text-gray-900 text-lg">R$ {(Number(inputs.salePrice)||0).toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                     {/* Product Cost Group */}
                     <div className="flex justify-between items-center text-gray-600 group">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                           <span className="flex items-center">
                             Custo Produto 
                             {inputs.isKit && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 text-gray-600 font-bold ml-2">x{inputs.quantity}</span>}
                             <InfoTooltip text="Custo de aquisição ou produção da mercadoria vendida." className="ml-1" />
                           </span>
                        </div>
                        <span className="font-medium">- R$ {results.totalProductCost.toFixed(2)}</span>
                     </div>

                    {/* Fees Group */}
                    <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                           <span className="flex items-center">
                             Comissão + Taxas
                             <InfoTooltip text="Taxas retidas pela plataforma (Comissão % + Taxa Fixa por venda)." className="ml-1" />
                           </span>
                        </div>
                       <span className="font-medium">- R$ {(results.commissionValue + results.fixedFeeValue).toFixed(2)}</span>
                    </div>
                    
                    {/* Tax Group */}
                     <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                           <span className="flex items-center">
                             Impostos
                             <InfoTooltip text="Impostos sobre a nota fiscal (ex: DAS Simples Nacional) aplicados ao preço de venda." className="ml-1" />
                           </span>
                        </div>
                       <span className="font-medium">- R$ {results.taxValue.toFixed(2)}</span>
                    </div>

                    {/* Marketing/Shipping Group */}
                    <div className="flex justify-between items-center text-gray-600">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                           <span className="flex items-center">
                             Frete, Ads & Extras
                             <InfoTooltip text="Custos de envio (se pago por você), campanhas de publicidade e custos extras (embalagem, etc)." className="ml-1" />
                           </span>
                        </div>
                       <span className="font-medium">- R$ {((isShippingDisabled ? 0 : Number(inputs.shippingCost)||0) + (Number(inputs.otherCosts)||0) + results.marketingValue).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-200 flex justify-between items-center">
                     <div className="flex items-center">
                        <span className="font-bold text-gray-900 uppercase text-xs tracking-wider">Custo Total</span>
                        <InfoTooltip text="Soma de todos os custos para realizar a venda." className="ml-1" />
                     </div>
                     <span className="font-bold text-gray-900">R$ {((Number(inputs.salePrice)||0) - results.profit).toFixed(2)}</span>
                  </div>

                  {/* PROFIT ROW - Highlighted #7CFC00 with Black text */}
                  <div className={`mt-3 py-3 px-3 -mx-3 rounded flex justify-between items-center ${results.profit >= 0 ? 'bg-[#7CFC00] text-black' : 'bg-red-50 text-red-600'}`}>
                     <div className="flex items-center">
                        <span className="font-bold uppercase text-xs tracking-wider">Resultado Líquido</span>
                     </div>
                     <span className="font-black text-lg">R$ {results.profit.toFixed(2)}</span>
                  </div>

               </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 hidden sm:block">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">Distribuição de Receita</h3>
              <ResultsChart inputs={inputs} results={results} />
            </div>

          </div>
          
          {/* BOTTOM COMPARISON TABLE (FULL WIDTH) */}
          <div className="lg:col-span-12">
            <ComparisonTable inputs={inputs} />
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] lg:hidden z-50">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* #7CFC00 Background mobile */}
            <div className={`flex flex-col px-3 py-1 rounded ${results.profit >= 0 ? 'bg-[#7CFC00]' : 'bg-red-50'}`}>
              <div className="flex items-center gap-1">
                 <span className={`text-[10px] font-bold uppercase tracking-wide ${results.profit >= 0 ? 'text-black' : 'text-red-500'}`}>Lucro</span>
                 <InfoTooltip text="O que sobra no bolso." position="top" className={`ml-0.5 ${results.profit >= 0 ? 'text-black opacity-60' : ''}`} />
              </div>
              <span className={`text-xl sm:text-2xl font-black ${results.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                R$ {results.profit.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2 sm:gap-4">
               <div className="flex flex-col items-end px-2 sm:px-4 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                     <span className="text-[10px] uppercase text-gray-400 font-bold">Margem</span>
                  </div>
                  <span className={`font-bold ${results.profit >= 0 ? 'text-black' : 'text-gray-900'}`}>{results.margin.toFixed(0)}%</span>
               </div>
               <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                     <span className="text-[10px] uppercase text-gray-400 font-bold">ROI</span>
                  </div>
                  <span className={`font-bold ${results.profit >= 0 ? 'text-black' : 'text-gray-900'}`}>{results.roi.toFixed(0)}%</span>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Calculator;
