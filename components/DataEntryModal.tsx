import React, { useState, useEffect, useMemo } from 'react';
import { Client, WeeklyMetric } from '../types';
import { PLATFORMS } from '../constants';
import InputCurrency from './InputCurrency';
import CustomDatePicker from './CustomDatePicker';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSave: (metric: WeeklyMetric) => void;
}

const DataEntryModal: React.FC<DataEntryModalProps> = ({ isOpen, onClose, clients, onSave }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPlatformId, setSelectedPlatformId] = useState('');
  const [weekDate, setWeekDate] = useState('');
  
  // Metrics State
  const [revenue, setRevenue] = useState<number | ''>('');
  const [adSpend, setAdSpend] = useState<number | ''>('');
  const [impressions, setImpressions] = useState<number | ''>('');
  const [clicks, setClicks] = useState<number | ''>('');
  const [orders, setOrders] = useState<number | ''>('');

  // Filter unique platforms by Name for the UI (grouping ML Classic/Premium into just "Mercado Livre")
  const uniquePlatforms = useMemo(() => {
    const seen = new Set();
    return PLATFORMS.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  }, []);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (clients.length > 0) setSelectedClientId(clients[0].id);
      // Default to the first unique platform
      if (uniquePlatforms.length > 0) setSelectedPlatformId(uniquePlatforms[0].id);
      
      // Keep weekDate empty initially to force user selection, or set today if preferred
      // setWeekDate(new Date().toISOString().split('T')[0]); 
      setWeekDate(''); 
      setRevenue('');
      setAdSpend('');
      setImpressions('');
      setClicks('');
      setOrders('');
    }
  }, [isOpen, clients, uniquePlatforms]);

  // Real-time calculations for feedback
  const safeRevenue = Number(revenue) || 0;
  const safeAdSpend = Number(adSpend) || 0;
  const safeImpressions = Number(impressions) || 0;
  const safeClicks = Number(clicks) || 0;
  const safeOrders = Number(orders) || 0;

  const roas = safeAdSpend > 0 ? safeRevenue / safeAdSpend : 0;
  const ctr = safeImpressions > 0 ? (safeClicks / safeImpressions) * 100 : 0;
  const conversionRate = safeClicks > 0 ? (safeOrders / safeClicks) * 100 : 0;

  if (!isOpen) return null;

  const handleSave = () => {
    if (!selectedClientId || !selectedPlatformId || !weekDate) {
        alert("Preencha os campos obrigatórios (Cliente, Plataforma, Data).");
        return;
    }

    const newMetric: WeeklyMetric = {
        id: crypto.randomUUID(),
        clientId: selectedClientId,
        platformId: selectedPlatformId,
        weekStart: weekDate,
        revenue: safeRevenue,
        adSpend: safeAdSpend,
        impressions: safeImpressions,
        clicks: safeClicks,
        orders: safeOrders
    };

    onSave(newMetric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 bg-white text-gray-900 flex justify-between items-center rounded-t-xl shrink-0">
            <div>
                <h3 className="font-bold text-lg tracking-tight">Inserir Dados Semanais</h3>
                <p className="text-gray-500 text-[11px] mt-0.5">Preencha as métricas manuais do marketplace.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
            
            {/* Top Row: Client & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Cliente</label>
                    <div className="relative">
                      <select 
                          value={selectedClientId}
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          className="w-full appearance-none rounded-lg border-gray-200 bg-white text-gray-900 focus:ring-black focus:border-black font-medium text-sm py-2.5 pl-3 pr-8"
                      >
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                </div>
                <div>
                    <CustomDatePicker 
                        label="Semana (Segunda)" 
                        value={weekDate} 
                        onChange={setWeekDate} 
                        placeholder="Selecione a data"
                    />
                </div>
            </div>

            {/* Platform Selection - Compact Chips */}
            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Selecione a Plataforma</label>
                <div className="flex flex-wrap gap-2">
                    {uniquePlatforms.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlatformId(p.id)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                                ${selectedPlatformId === p.id 
                                    ? 'border-black ring-1 ring-black bg-gray-900 text-white shadow-sm' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                }
                            `}
                        >
                            <div className="w-5 h-5 object-contain flex items-center justify-center bg-white rounded-full p-0.5 overflow-hidden">
                                <img src={p.logoUrl} alt={p.name} className="max-w-full max-h-full" />
                            </div>
                            <span className="text-xs font-bold">
                                {p.name}
                            </span>
                            {selectedPlatformId === p.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7CFC00] ml-1"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Metrics Inputs - Compact Grid */}
            <div className="grid grid-cols-12 gap-4">
                {/* Row 1: Key Financials */}
                <div className="col-span-12 sm:col-span-4">
                    <InputCurrency 
                        label="Faturamento (VGV)" 
                        value={revenue} 
                        onChange={setRevenue} 
                        highlight
                        compact
                    />
                </div>
                <div className="col-span-6 sm:col-span-4">
                    <InputCurrency 
                        label="Ads (Investimento)" 
                        value={adSpend} 
                        onChange={setAdSpend}
                        compact
                    />
                </div>
                <div className="col-span-6 sm:col-span-4">
                     <InputCurrency 
                        label="Pedidos" 
                        value={orders} 
                        onChange={setOrders}
                        prefix=""
                        step={1}
                        compact
                    />
                </div>

                {/* Row 2: Traffic */}
                <div className="col-span-6">
                    <InputCurrency 
                        label="Impressões" 
                        value={impressions} 
                        onChange={setImpressions}
                        prefix=""
                        step={1}
                        compact
                    />
                </div>
                <div className="col-span-6">
                    <InputCurrency 
                        label="Cliques" 
                        value={clicks} 
                        onChange={setClicks}
                        prefix=""
                        step={1}
                        compact
                    />
                </div>
            </div>

            {/* Live Calculations Banner - Compact */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Conversão</span>
                        <span className="font-bold text-gray-900">{conversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex flex-col gap-0.5 text-center">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ROAS</span>
                        <span className={`font-bold ${roas >= 5 ? 'text-green-600' : 'text-gray-900'}`}>
                            {roas.toFixed(2)}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">CTR</span>
                        <span className="font-bold text-gray-900">{ctr.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer - Sticky */}
        <div className="px-5 py-3 bg-gray-50 flex justify-end gap-3 border-t border-gray-200 rounded-b-xl shrink-0">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 shadow-md shadow-black/10 transition-colors"
            >
                Salvar Dados
            </button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryModal;