import React, { useState, useMemo, useEffect } from 'react';
import { WinterProduct, CostItem, MonthlyTarget, WinterScenario, CashFlowEntry } from '../types';
import { toast } from './Toast';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../constants/storage';
import InputCurrency from './InputCurrency';

// Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const SnowflakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>
);
const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

// Cores disponíveis para os tecidos
const AVAILABLE_COLORS: { id: string; name: string; hex: string }[] = [
  { id: 'preto', name: 'Preto', hex: '#1a1a1a' },
  { id: 'cinza', name: 'Cinza', hex: '#6b7280' },
  { id: 'marrom', name: 'Marrom', hex: '#78350f' },
  { id: 'rosa', name: 'Rosa', hex: '#ec4899' },
  { id: 'bege', name: 'Bege', hex: '#d4b896' },
  { id: 'branco', name: 'Branco', hex: '#f5f5f5' },
  { id: 'azul_marinho', name: 'Azul Marinho', hex: '#1e3a5f' },
  { id: 'verde_militar', name: 'Verde Militar', hex: '#4a5d23' },
  { id: 'vinho', name: 'Vinho', hex: '#722f37' },
  { id: 'caramelo', name: 'Caramelo', hex: '#c68642' },
];

// Interface para cor selecionada com quantidade
interface SelectedColor {
  id: string;
  name: string;
  hex: string;
  quantity: number; // quantidade de peças dessa cor
}

// Meses do Inverno 2026 (período de vendas)
const SALES_MONTHS: { value: string; label: string }[] = [
  { value: '2026-02', label: 'Fevereiro' },
  { value: '2026-03', label: 'Março' },
  { value: '2026-04', label: 'Abril' },
  { value: '2026-05', label: 'Maio' },
  { value: '2026-06', label: 'Junho' },
  { value: '2026-07', label: 'Julho' },
  { value: '2026-08', label: 'Agosto' },
];

// Calendário completo do ano 2026
const ALL_MONTHS: { value: string; label: string; short: string }[] = [
  { value: '2026-01', label: 'Janeiro', short: 'Jan' },
  { value: '2026-02', label: 'Fevereiro', short: 'Fev' },
  { value: '2026-03', label: 'Março', short: 'Mar' },
  { value: '2026-04', label: 'Abril', short: 'Abr' },
  { value: '2026-05', label: 'Maio', short: 'Mai' },
  { value: '2026-06', label: 'Junho', short: 'Jun' },
  { value: '2026-07', label: 'Julho', short: 'Jul' },
  { value: '2026-08', label: 'Agosto', short: 'Ago' },
  { value: '2026-09', label: 'Setembro', short: 'Set' },
  { value: '2026-10', label: 'Outubro', short: 'Out' },
  { value: '2026-11', label: 'Novembro', short: 'Nov' },
  { value: '2026-12', label: 'Dezembro', short: 'Dez' },
];

// Ficha técnica inicial baseada nos dados do usuário
const DEFAULT_COST_ITEMS: CostItem[] = [
  { id: '1', name: 'Tecido (por kg)', costPerUnit: 35, paymentTerm: 90, isPerKg: true },
  { id: '2', name: 'Costura', costPerUnit: 8, paymentTerm: 0 },
  { id: '3', name: 'Ilhós', costPerUnit: 0, paymentTerm: 0 },
  { id: '4', name: 'Punho', costPerUnit: 2, paymentTerm: 90 },
  { id: '5', name: 'Corte', costPerUnit: 1, paymentTerm: 0 },
  { id: '6', name: 'Zíper', costPerUnit: 0.7, paymentTerm: 0 },
];

const WinterPlanningView: React.FC = () => {
  // Estado do produto atual
  const [productName, setProductName] = useState('Moletom Inverno');
  const [costItems, setCostItems] = useState<CostItem[]>(DEFAULT_COST_ITEMS);
  const [kgYield, setKgYield] = useState<number | ''>(3); // 1kg rende 3 unidades
  const [salePrice, setSalePrice] = useState<number | ''>(89.90);

  // Estado das metas mensais (apenas meses de vendas: Fev-Ago)
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>(
    SALES_MONTHS.map(m => ({
      month: m.value,
      monthLabel: m.label,
      targetUnits: 100, // Faturado
      targetRevenue: 0,
      manufacturedUnits: 100 // Fabricado
    }))
  );

  // Cenários salvos
  const [savedScenarios, setSavedScenarios] = useState<WinterScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('');

  // Novo item de custo
  const [newCostName, setNewCostName] = useState('');
  const [newCostValue, setNewCostValue] = useState<number | ''>(0);
  const [newCostTerm, setNewCostTerm] = useState<number | ''>(0);
  const [newCostIsPerKg, setNewCostIsPerKg] = useState(false);

  // Estado das cores selecionadas
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([
    { id: 'preto', name: 'Preto', hex: '#1a1a1a', quantity: 50 },
    { id: 'cinza', name: 'Cinza', hex: '#6b7280', quantity: 30 },
    { id: 'marrom', name: 'Marrom', hex: '#78350f', quantity: 20 },
  ]);

  // Carregar cenários salvos
  useEffect(() => {
    const saved = getFromStorage<WinterScenario[]>(STORAGE_KEYS.WINTER_SCENARIOS, []);
    setSavedScenarios(saved);
  }, []);

  // Cálculo do custo unitário do produto
  const unitCost = useMemo(() => {
    const yield_ = kgYield === '' ? 1 : kgYield;
    let total = 0;

    costItems.forEach(item => {
      if (item.isPerKg) {
        // Custo por kg dividido pelo rendimento
        total += item.costPerUnit / yield_;
      } else {
        total += item.costPerUnit;
      }
    });

    return total;
  }, [costItems, kgYield]);

  // Custo à vista vs a prazo
  const { immediateCost, deferredCost } = useMemo(() => {
    const yield_ = kgYield === '' ? 1 : kgYield;
    let immediate = 0;
    let deferred = 0;

    costItems.forEach(item => {
      const cost = item.isPerKg ? item.costPerUnit / yield_ : item.costPerUnit;
      if (item.paymentTerm === 0) {
        immediate += cost;
      } else {
        deferred += cost;
      }
    });

    return { immediateCost: immediate, deferredCost: deferred };
  }, [costItems, kgYield]);

  // Lucro por unidade
  const profitPerUnit = useMemo(() => {
    const price = salePrice === '' ? 0 : salePrice;
    return price - unitCost;
  }, [salePrice, unitCost]);

  // Margem
  const margin = useMemo(() => {
    const price = salePrice === '' ? 0 : salePrice;
    if (price <= 0) return 0;
    return (profitPerUnit / price) * 100;
  }, [profitPerUnit, salePrice]);

  // Atualizar receita quando preço ou unidades mudam
  useEffect(() => {
    const price = salePrice === '' ? 0 : salePrice;
    setMonthlyTargets(prev => prev.map(t => ({
      ...t,
      targetRevenue: t.targetUnits * price
    })));
  }, [salePrice]);

  // Totais
  const totals = useMemo(() => {
    const totalUnits = monthlyTargets.reduce((sum, t) => sum + t.targetUnits, 0);
    const totalManufactured = monthlyTargets.reduce((sum, t) => sum + t.manufacturedUnits, 0);
    const price = salePrice === '' ? 0 : salePrice;
    const totalRevenue = totalUnits * price;
    const totalCost = totalUnits * unitCost;
    const totalProfit = totalUnits * profitPerUnit;
    const totalImmediate = totalUnits * immediateCost;
    const totalDeferred = totalUnits * deferredCost;
    // Giro de estoque: quantas vezes o estoque girou (faturado / fabricado)
    const inventoryTurnover = totalManufactured > 0 ? totalUnits / totalManufactured : 0;

    return { totalUnits, totalManufactured, totalRevenue, totalCost, totalProfit, totalImmediate, totalDeferred, inventoryTurnover };
  }, [monthlyTargets, salePrice, unitCost, profitPerUnit, immediateCost, deferredCost]);

  // Criar mapa de vendas por mês para fácil acesso
  const salesByMonth = useMemo(() => {
    const map: { [key: string]: number } = {};
    monthlyTargets.forEach(t => {
      map[t.month] = t.targetUnits;
    });
    return map;
  }, [monthlyTargets]);

  // Calcular prazo máximo em meses
  const maxPaymentTermMonths = useMemo(() => {
    const maxDays = Math.max(...costItems.map(item => item.paymentTerm), 0);
    return Math.ceil(maxDays / 30);
  }, [costItems]);

  // Calcular custos por prazo específico
  const costsByTerm = useMemo(() => {
    const yield_ = kgYield === '' ? 1 : kgYield;
    const terms: { [days: number]: number } = {};

    costItems.forEach(item => {
      const cost = item.isPerKg ? item.costPerUnit / yield_ : item.costPerUnit;
      if (!terms[item.paymentTerm]) {
        terms[item.paymentTerm] = 0;
      }
      terms[item.paymentTerm] += cost;
    });

    return terms;
  }, [costItems, kgYield]);

  // Fluxo de caixa mensal - ANO COMPLETO
  const cashFlow = useMemo((): CashFlowEntry[] => {
    const price = salePrice === '' ? 0 : salePrice;
    let accumulated = 0;

    return ALL_MONTHS.map((monthInfo) => {
      // Receita: só tem nos meses de venda (Fev-Ago)
      const units = salesByMonth[monthInfo.value] || 0;
      const revenue = units * price;

      // Pagamentos à vista: no mesmo mês da venda
      const immediatePayments = units * immediateCost;

      // Pagamentos a prazo: aparecem X meses depois conforme prazo de cada item
      let deferredPayments = 0;

      // Para cada prazo de pagamento, verificar se há vendas X meses atrás
      Object.entries(costsByTerm).forEach(([days, costPerUnit]) => {
        if (Number(days) === 0) return; // À vista já foi contado

        const monthsDelay = Math.ceil(Number(days) / 30);
        const monthIndex = ALL_MONTHS.findIndex(m => m.value === monthInfo.value);
        const sourceMonthIndex = monthIndex - monthsDelay;

        if (sourceMonthIndex >= 0 && sourceMonthIndex < ALL_MONTHS.length) {
          const sourceMonth = ALL_MONTHS[sourceMonthIndex].value;
          const sourceUnits = salesByMonth[sourceMonth] || 0;
          deferredPayments += sourceUnits * costPerUnit;
        }
      });

      const netCashFlow = revenue - immediatePayments - deferredPayments;
      accumulated += netCashFlow;

      return {
        month: monthInfo.value,
        monthLabel: monthInfo.label,
        revenue,
        immediatePayments,
        deferredPayments,
        netCashFlow,
        accumulatedCashFlow: accumulated
      };
    });
  }, [salesByMonth, salePrice, immediateCost, costsByTerm]);

  // =====================================
  // CÁLCULOS DE COMPRAS E PEDIDOS
  // =====================================

  // Total de peças por cor
  const totalPiecesByColor = useMemo(() => {
    return selectedColors.reduce((sum, c) => sum + c.quantity, 0);
  }, [selectedColors]);

  // Quilos necessários de tecido (baseado no rendimento)
  const totalKgNeeded = useMemo(() => {
    const yield_ = kgYield === '' ? 1 : kgYield;
    return totalPiecesByColor / yield_;
  }, [totalPiecesByColor, kgYield]);

  // Quilos por cor
  const kgByColor = useMemo(() => {
    const yield_ = kgYield === '' ? 1 : kgYield;
    return selectedColors.map(color => ({
      ...color,
      kg: color.quantity / yield_
    }));
  }, [selectedColors, kgYield]);

  // Pedido para fornecedores (valor total por item)
  const supplierOrders = useMemo(() => {
    const yield_ = kgYield === '' ? 1 : kgYield;

    return costItems.map(item => {
      let totalQuantity: number;
      let unit: string;
      let totalCost: number;

      if (item.isPerKg) {
        // Para itens por kg, calcular quilos necessários
        totalQuantity = totalKgNeeded;
        unit = 'kg';
        totalCost = totalQuantity * item.costPerUnit;
      } else {
        // Para itens por unidade, multiplicar pelo total de peças
        totalQuantity = totalPiecesByColor;
        unit = 'unid';
        totalCost = totalQuantity * item.costPerUnit;
      }

      return {
        ...item,
        totalQuantity,
        unit,
        totalCost,
        paymentLabel: item.paymentTerm === 0 ? 'À Vista' : `${item.paymentTerm} dias`
      };
    });
  }, [costItems, totalKgNeeded, totalPiecesByColor, kgYield]);

  // Total do pedido
  const totalOrderValue = useMemo(() => {
    return supplierOrders.reduce((sum, item) => sum + item.totalCost, 0);
  }, [supplierOrders]);

  // Handlers
  const handleUpdateTarget = (month: string, units: number) => {
    const price = salePrice === '' ? 0 : salePrice;
    setMonthlyTargets(prev => prev.map(t =>
      t.month === month
        ? { ...t, targetUnits: units, targetRevenue: units * price }
        : t
    ));
  };

  const handleUpdateManufactured = (month: string, units: number) => {
    setMonthlyTargets(prev => prev.map(t =>
      t.month === month
        ? { ...t, manufacturedUnits: units }
        : t
    ));
  };

  const handleUpdateCostItem = (id: string, field: keyof CostItem, value: number | string | boolean) => {
    setCostItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddCostItem = () => {
    if (!newCostName.trim()) {
      toast.warning('Digite o nome do item de custo');
      return;
    }

    const newItem: CostItem = {
      id: crypto.randomUUID(),
      name: newCostName.trim(),
      costPerUnit: newCostValue === '' ? 0 : newCostValue,
      paymentTerm: newCostTerm === '' ? 0 : newCostTerm,
      isPerKg: newCostIsPerKg
    };

    setCostItems(prev => [...prev, newItem]);
    setNewCostName('');
    setNewCostValue(0);
    setNewCostTerm(0);
    setNewCostIsPerKg(false);
    toast.success('Item adicionado!');
  };

  const handleRemoveCostItem = (id: string) => {
    setCostItems(prev => prev.filter(item => item.id !== id));
  };

  // Handlers para cores
  const handleAddColor = (color: typeof AVAILABLE_COLORS[0]) => {
    if (selectedColors.find(c => c.id === color.id)) {
      toast.warning('Cor já adicionada!');
      return;
    }
    setSelectedColors(prev => [...prev, { ...color, quantity: 10 }]);
  };

  const handleRemoveColor = (colorId: string) => {
    setSelectedColors(prev => prev.filter(c => c.id !== colorId));
  };

  const handleUpdateColorQuantity = (colorId: string, quantity: number) => {
    setSelectedColors(prev => prev.map(c =>
      c.id === colorId ? { ...c, quantity: Math.max(0, quantity) } : c
    ));
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast.warning('Digite um nome para o cenário');
      return;
    }

    const scenario: WinterScenario = {
      id: crypto.randomUUID(),
      name: scenarioName.trim(),
      product: {
        id: crypto.randomUUID(),
        name: productName,
        costItems: [...costItems],
        kgYield: kgYield === '' ? 1 : kgYield,
        salePrice: salePrice === '' ? 0 : salePrice,
        createdAt: Date.now()
      },
      monthlyTargets: [...monthlyTargets],
      createdAt: Date.now()
    };

    const updated = [scenario, ...savedScenarios];
    setSavedScenarios(updated);
    saveToStorage(STORAGE_KEYS.WINTER_SCENARIOS, updated);
    setScenarioName('');
    toast.success('Cenário salvo com sucesso!');
  };

  const handleLoadScenario = (scenario: WinterScenario) => {
    setProductName(scenario.product.name);
    setCostItems(scenario.product.costItems);
    setKgYield(scenario.product.kgYield);
    setSalePrice(scenario.product.salePrice);
    setMonthlyTargets(scenario.monthlyTargets);
    toast.success('Cenário carregado!');
  };

  const handleDeleteScenario = (id: string) => {
    const updated = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updated);
    saveToStorage(STORAGE_KEYS.WINTER_SCENARIOS, updated);
    toast.success('Cenário excluído!');
  };

  // Encontrar o valor máximo para escala do gráfico
  const maxValue = useMemo(() => {
    const maxRevenue = Math.max(...cashFlow.map(c => c.revenue));
    const maxPayment = Math.max(...cashFlow.map(c => c.immediatePayments + c.deferredPayments));
    return Math.max(maxRevenue, maxPayment, 1);
  }, [cashFlow]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-3 rounded-lg">
            <SnowflakeIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planejamento Inverno 2026</h1>
            <p className="text-gray-500 text-sm">Fevereiro a Agosto - Ficha Técnica e Fluxo de Caixa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUNA ESQUERDA: Ficha Técnica */}
        <div className="lg:col-span-5 space-y-6">

          {/* Card: Dados do Produto */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Dados do Produto</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border-gray-200 focus:ring-black focus:border-black"
                  placeholder="Ex: Moletom Canguru"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputCurrency
                  label="Preço de Venda"
                  value={salePrice}
                  onChange={setSalePrice}
                  highlight
                />
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Rendimento (1kg = ? unid)</label>
                  <input
                    type="number"
                    value={kgYield}
                    onChange={(e) => setKgYield(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg border-gray-200 focus:ring-black focus:border-black"
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Ficha Técnica de Custos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Ficha Técnica de Custos</h2>
              <span className="text-xs text-gray-500">Custo Unit: <strong className="text-gray-900">R$ {unitCost.toFixed(2)}</strong></span>
            </div>

            <div className="divide-y divide-gray-100">
              {costItems.map(item => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateCostItem(item.id, 'name', e.target.value)}
                        className="w-full text-sm font-medium border-0 bg-transparent p-0 focus:ring-0"
                      />
                      {item.isPerKg && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">POR KG</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.costPerUnit}
                          onChange={(e) => handleUpdateCostItem(item.id, 'costPerUnit', Number(e.target.value))}
                          className="w-full text-sm text-right rounded border-gray-200 py-1 px-2"
                          step="0.01"
                        />
                      </div>

                      <div className="w-20">
                        <select
                          value={item.paymentTerm}
                          onChange={(e) => handleUpdateCostItem(item.id, 'paymentTerm', Number(e.target.value))}
                          className={`w-full text-xs rounded py-1 px-2 font-medium ${
                            item.paymentTerm === 0
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-orange-50 border-orange-200 text-orange-700'
                          }`}
                        >
                          <option value={0}>À vista</option>
                          <option value={30}>30 dias</option>
                          <option value={60}>60 dias</option>
                          <option value={90}>90 dias</option>
                          <option value={120}>120 dias</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleRemoveCostItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Adicionar novo item */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome</label>
                  <input
                    type="text"
                    value={newCostName}
                    onChange={(e) => setNewCostName(e.target.value)}
                    className="w-full text-sm rounded border-gray-200 py-1.5 px-2"
                    placeholder="Novo item..."
                  />
                </div>
                <div className="w-20">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor</label>
                  <input
                    type="number"
                    value={newCostValue}
                    onChange={(e) => setNewCostValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm rounded border-gray-200 py-1.5 px-2"
                    step="0.01"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Prazo</label>
                  <select
                    value={newCostTerm}
                    onChange={(e) => setNewCostTerm(Number(e.target.value))}
                    className="w-full text-xs rounded border-gray-200 py-1.5 px-2"
                  >
                    <option value={0}>À vista</option>
                    <option value={30}>30d</option>
                    <option value={60}>60d</option>
                    <option value={90}>90d</option>
                  </select>
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCostIsPerKg}
                    onChange={(e) => setNewCostIsPerKg(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Por kg
                </label>
                <button
                  onClick={handleAddCostItem}
                  className="bg-black text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-800"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Card: Resumo de Custos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Resumo por Unidade</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Custo Total</span>
                <span className="font-bold text-gray-900">R$ {unitCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  À Vista
                </span>
                <span className="font-medium text-red-600">R$ {immediateCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  A Prazo
                </span>
                <span className="font-medium text-orange-600">R$ {deferredCost.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lucro por Unidade</span>
                  <span className={`font-bold text-lg ${profitPerUnit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {profitPerUnit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-500 text-sm">Margem</span>
                  <span className={`font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Metas e Gráfico */}
        <div className="lg:col-span-7 space-y-6">

          {/* Card: Metas Mensais */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Metas Mensais - Inverno 2026</h2>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  Fab: <strong className="text-blue-600">{totals.totalManufactured.toLocaleString()}</strong>
                </span>
                <span className="text-xs text-gray-500">
                  Fat: <strong className="text-green-600">{totals.totalUnits.toLocaleString()}</strong>
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                  Giro: {totals.inventoryTurnover.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Header dos Meses */}
              <div className="grid grid-cols-8 gap-2">
                <div className="text-right pr-2"></div>
                {monthlyTargets.map(target => (
                  <div key={target.month} className="text-center">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">
                      {target.monthLabel.substring(0, 3)}
                    </label>
                  </div>
                ))}
              </div>

              {/* Linha: Fabricado */}
              <div className="grid grid-cols-8 gap-2 items-center">
                <div className="text-right pr-2">
                  <span className="text-xs font-bold text-blue-600 uppercase">Fabricado</span>
                </div>
                {monthlyTargets.map(target => (
                  <div key={target.month} className="text-center">
                    <input
                      type="number"
                      value={target.manufacturedUnits}
                      onChange={(e) => handleUpdateManufactured(target.month, Number(e.target.value) || 0)}
                      className="w-full text-center text-sm font-medium rounded border-blue-200 bg-blue-50 py-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                ))}
              </div>

              {/* Separador */}
              <div className="border-t-2 border-dashed border-gray-300"></div>

              {/* Linha: Faturado */}
              <div className="grid grid-cols-8 gap-2 items-center">
                <div className="text-right pr-2">
                  <span className="text-xs font-bold text-green-600 uppercase">Faturado</span>
                </div>
                {monthlyTargets.map(target => (
                  <div key={target.month} className="text-center">
                    <input
                      type="number"
                      value={target.targetUnits}
                      onChange={(e) => handleUpdateTarget(target.month, Number(e.target.value) || 0)}
                      className="w-full text-center text-sm font-medium rounded border-green-200 bg-green-50 py-2 focus:ring-green-500 focus:border-green-500"
                      min="0"
                    />
                    <div className="text-[10px] text-gray-400 mt-1">
                      R$ {target.targetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Separador */}
              <div className="border-t-2 border-dashed border-gray-300"></div>

              {/* Linha: Giro de Estoque */}
              <div className="grid grid-cols-8 gap-2 items-center">
                <div className="text-right pr-2">
                  <span className="text-xs font-bold text-purple-600 uppercase">Giro</span>
                </div>
                {monthlyTargets.map(target => {
                  const giro = target.manufacturedUnits > 0
                    ? target.targetUnits / target.manufacturedUnits
                    : 0;
                  return (
                    <div key={target.month} className="text-center">
                      <div className={`text-sm font-bold py-2 rounded ${
                        giro >= 2 ? 'bg-purple-100 text-purple-700' :
                        giro >= 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {giro.toFixed(1)}x
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Gráfico de Fluxo de Caixa - Ano Completo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Fluxo de Caixa 2026 - Ano Completo</h2>
              <p className="text-xs text-gray-500 mt-1">Vendas (Fev-Ago) + Pagamentos de dívidas até quitação</p>
            </div>

            <div className="p-5">
              {/* Legenda */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-green-500"></span>
                  Faturamento
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500"></span>
                  Pagamento À Vista
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500"></span>
                  Pagamento A Prazo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500"></span>
                  Saldo Acumulado
                </span>
              </div>

              {/* Gráfico de Barras - Ano Completo */}
              <div className="space-y-3">
                {cashFlow.map((entry, index) => {
                  const isSalesMonth = entry.revenue > 0;
                  const hasPayments = entry.immediatePayments > 0 || entry.deferredPayments > 0;
                  const isInactive = !isSalesMonth && !hasPayments;

                  return (
                    <div
                      key={entry.month}
                      className={`p-3 rounded-lg border transition-all ${
                        isSalesMonth
                          ? 'bg-green-50 border-green-200'
                          : hasPayments
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-gray-50 border-gray-100 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isSalesMonth ? 'text-green-800' : hasPayments ? 'text-orange-800' : 'text-gray-400'}`}>
                            {ALL_MONTHS[index].short}
                          </span>
                          {isSalesMonth && (
                            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-bold">VENDAS</span>
                          )}
                          {!isSalesMonth && hasPayments && (
                            <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded font-bold">DÍVIDAS</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold ${entry.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.netCashFlow >= 0 ? '+' : ''}R$ {entry.netCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            entry.accumulatedCashFlow >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            Saldo: R$ {entry.accumulatedCashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      {!isInactive && (
                        <div className="space-y-1">
                          {/* Barra de Entrada (Verde) */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-14 text-right">Entrada</span>
                            <div className="flex-1 h-4 bg-gray-200/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${maxValue > 0 ? (entry.revenue / maxValue) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-gray-600 w-20 text-right font-medium">
                              R$ {entry.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          </div>

                          {/* Barra de Saída (Vermelho + Laranja) */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-14 text-right">Saída</span>
                            <div className="flex-1 h-4 bg-gray-200/50 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-red-500 transition-all duration-300"
                                style={{ width: `${maxValue > 0 ? (entry.immediatePayments / maxValue) * 100 : 0}%` }}
                              ></div>
                              <div
                                className="h-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${maxValue > 0 ? (entry.deferredPayments / maxValue) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-gray-600 w-20 text-right font-medium">
                              R$ {(entry.immediatePayments + entry.deferredPayments).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Resumo Final */}
              <div className="mt-6 p-4 bg-gray-900 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Saldo Final em Dezembro</p>
                    <p className={`text-2xl font-black ${cashFlow[11]?.accumulatedCashFlow >= 0 ? 'text-[#7CFC00]' : 'text-red-400'}`}>
                      R$ {(cashFlow[11]?.accumulatedCashFlow || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                    <p className={`text-lg font-bold ${cashFlow[11]?.accumulatedCashFlow >= 0 ? 'text-[#7CFC00]' : 'text-red-400'}`}>
                      {cashFlow[11]?.accumulatedCashFlow >= 0 ? 'DÍVIDAS QUITADAS' : 'SALDO NEGATIVO'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Resumo Total */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-bold text-green-800 uppercase">Faturamento Total</p>
              <p className="text-xl font-black text-green-700">
                R$ {totals.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs font-bold text-red-800 uppercase">Custos À Vista</p>
              <p className="text-xl font-black text-red-700">
                R$ {totals.totalImmediate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs font-bold text-orange-800 uppercase">Custos A Prazo</p>
              <p className="text-xl font-black text-orange-700">
                R$ {totals.totalDeferred.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`${totals.totalProfit >= 0 ? 'bg-[#7CFC00]' : 'bg-red-100'} border ${totals.totalProfit >= 0 ? 'border-green-300' : 'border-red-300'} rounded-lg p-4`}>
              <p className={`text-xs font-bold uppercase ${totals.totalProfit >= 0 ? 'text-black' : 'text-red-800'}`}>Lucro Total</p>
              <p className={`text-xl font-black ${totals.totalProfit >= 0 ? 'text-black' : 'text-red-700'}`}>
                R$ {totals.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =====================================
          SEÇÃO DE COMPRAS E PEDIDOS
          ===================================== */}
      <div className="mt-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 text-white p-3 rounded-lg">
            <ShoppingCartIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pedido de Compras</h2>
            <p className="text-gray-500 text-sm">Calcule os materiais e valores para seus fornecedores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUNA ESQUERDA: Cores */}
          <div className="lg:col-span-5 space-y-6">

            {/* Card: Seleção de Cores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                <h3 className="font-bold text-purple-900">Cores do Tecido</h3>
                <span className="text-xs text-purple-600 font-medium">
                  {selectedColors.length} cores | {totalPiecesByColor} peças
                </span>
              </div>

              {/* Cores selecionadas */}
              <div className="divide-y divide-gray-100">
                {selectedColors.map(color => (
                  <div key={color.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{color.name}</span>
                      <div className="text-xs text-gray-500">
                        {(color.quantity / (kgYield === '' ? 1 : kgYield)).toFixed(1)} kg
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={color.quantity}
                        onChange={(e) => handleUpdateColorQuantity(color.id, Number(e.target.value) || 0)}
                        className="w-20 text-sm text-center rounded border-gray-200 py-1 px-2"
                        min="0"
                      />
                      <span className="text-xs text-gray-400">peças</span>
                      <button
                        onClick={() => handleRemoveColor(color.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar cor */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Adicionar Cor</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.filter(c => !selectedColors.find(sc => sc.id === c.id)).map(color => (
                    <button
                      key={color.id}
                      onClick={() => handleAddColor(color)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <span className="text-xs font-medium text-gray-700">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card: Resumo de Quilos por Cor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Quilos por Cor</h3>
              <div className="space-y-3">
                {kgByColor.map(color => (
                  <div key={color.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <span className="text-sm text-gray-700">{color.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{color.kg.toFixed(2)} kg</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total de Tecido</span>
                  <span className="text-xl font-black text-purple-600">{totalKgNeeded.toFixed(2)} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Pedido para Fornecedores */}
          <div className="lg:col-span-7 space-y-6">

            {/* Card: Pedido Detalhado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 bg-gray-900 text-white flex justify-between items-center">
                <h3 className="font-bold">Pedido para Fornecedores</h3>
                <span className="text-xs text-gray-400">Baseado em {totalPiecesByColor} peças</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Qtd</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Preço Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Prazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {supplierOrders.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          {item.isPerKg && (
                            <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">POR KG</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {item.totalQuantity.toFixed(item.unit === 'kg' ? 2 : 0)} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          R$ {item.costPerUnit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            item.paymentTerm === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.paymentLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-900 text-white">
                    <tr>
                      <td colSpan={3} className="px-4 py-4 font-bold text-lg">
                        TOTAL DO PEDIDO
                      </td>
                      <td className="px-4 py-4 text-right font-black text-xl text-[#7CFC00]">
                        R$ {totalOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Resumo de Pagamentos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs font-bold text-red-800 uppercase">Pagamento À Vista</p>
                <p className="text-xl font-black text-red-700">
                  R$ {supplierOrders
                    .filter(i => i.paymentTerm === 0)
                    .reduce((sum, i) => sum + i.totalCost, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs font-bold text-orange-800 uppercase">Pagamento A Prazo</p>
                <p className="text-xl font-black text-orange-700">
                  R$ {supplierOrders
                    .filter(i => i.paymentTerm > 0)
                    .reduce((sum, i) => sum + i.totalCost, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================
          SEÇÃO DE CENÁRIOS
          ===================================== */}
      <div className="mt-8 max-w-7xl mx-auto space-y-6">

        {/* Card: Salvar Cenário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Nome do cenário (ex: Cenário Conservador)"
              className="flex-1 rounded-lg border-gray-200 focus:ring-black focus:border-black"
            />
            <button
              onClick={handleSaveScenario}
              disabled={!scenarioName.trim()}
              className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Salvar Cenário
            </button>
          </div>
        </div>

          {/* Card: Cenários Salvos */}
          {savedScenarios.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 bg-black text-white flex justify-between items-center">
                <h2 className="font-bold text-sm">Cenários Salvos</h2>
                <span className="text-xs text-gray-400">{savedScenarios.length} cenários</span>
              </div>

              <div className="divide-y divide-gray-100">
                {savedScenarios.map(scenario => (
                  <div key={scenario.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{scenario.name}</p>
                      <p className="text-xs text-gray-500">
                        {scenario.product.name} - R$ {scenario.product.salePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadScenario(scenario)}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium hover:bg-gray-200"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => handleDeleteScenario(scenario.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default WinterPlanningView;
