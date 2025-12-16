import React, { useMemo, useState } from 'react';
import { Client, WeeklyMetric } from '../types';
import { PLATFORMS } from '../constants';
import CustomDatePicker from './CustomDatePicker';

// Icons
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
);
const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const MousePointerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
);
const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15"/><line x1="12" x2="12" y1="3"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

interface KpiCardProps {
  title: string;
  value: string;
  trendValue: string;
  trendLabel: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trendValue, trendLabel, icon, iconBgColor = "bg-black", iconColor = "text-white" }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4 relative z-10">
       <div>
         <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
         <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
       </div>
       <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
         {icon}
       </div>
    </div>
    
    <div className="flex items-center gap-2 relative z-10">
       <span className="flex items-center gap-0.5 text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
         <TrendingUpIcon />
         {trendValue}
       </span>
       <span className="text-xs text-gray-400 font-medium">{trendLabel}</span>
    </div>
  </div>
);

interface DashboardViewProps {
  clients: Client[];
  metrics: WeeklyMetric[];
  onOpenDataEntry: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ clients, metrics, onOpenDataEntry }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'client_detail'>('overview');
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedPlatformName, setSelectedPlatformName] = useState<string>('all');
  
  // Date Filtering State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Derive Unique Platforms for Filter Dropdown
  const uniquePlatforms = useMemo(() => {
    const seen = new Set();
    return PLATFORMS.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  }, []);
  
  // Memoize active client IDs for filtering
  const activeClientIds = useMemo(() => {
    return new Set(clients.filter(c => c.isActive).map(c => c.id));
  }, [clients]);

  // --- FILTERING HELPERS ---

  const dateFilterRange = useMemo(() => {
      const now = new Date();
      // Reset to start of day for comparison
      now.setHours(0,0,0,0);
      
      let start: Date | null = null;
      let end: Date | null = null; // null end means "up to now" or "no limit"

      switch (selectedPeriod) {
          case '7d':
              start = new Date(now);
              start.setDate(now.getDate() - 7);
              break;
          case '30d':
              start = new Date(now);
              start.setDate(now.getDate() - 30);
              break;
          case 'month':
              start = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
          case 'year':
              start = new Date(now.getFullYear(), 0, 1);
              break;
          case 'custom':
              if (customStartDate) start = new Date(customStartDate + 'T00:00:00');
              if (customEndDate) end = new Date(customEndDate + 'T23:59:59');
              break;
          default: // 'all'
              break;
      }
      return { start, end };
  }, [selectedPeriod, customStartDate, customEndDate]);

  const isMetricInDateRange = (metricDateStr: string) => {
      if (!dateFilterRange.start && !dateFilterRange.end) return true;
      
      const mDate = new Date(metricDateStr + 'T00:00:00');
      if (dateFilterRange.start && mDate < dateFilterRange.start) return false;
      if (dateFilterRange.end && mDate > dateFilterRange.end) return false;
      
      return true;
  };

  // --- OVERVIEW LOGIC ---
  
  // Filter Data
  const filteredMetrics = useMemo(() => {
    return metrics.filter(m => {
        // Only include active clients in dashboard calculation
        if (!activeClientIds.has(m.clientId)) return false;

        const clientMatch = selectedClientId === 'all' || m.clientId === selectedClientId;
        
        let platformMatch = true;
        if (selectedPlatformName !== 'all') {
            const platformConfig = PLATFORMS.find(p => p.id === m.platformId);
            platformMatch = platformConfig?.name === selectedPlatformName;
        }

        const dateMatch = isMetricInDateRange(m.weekStart);
        
        return clientMatch && platformMatch && dateMatch;
    });
  }, [metrics, selectedClientId, selectedPlatformName, dateFilterRange, activeClientIds]);

  // Calculate Totals for Overview
  const totals = useMemo(() => {
    return filteredMetrics.reduce((acc, curr) => ({
        revenue: acc.revenue + curr.revenue,
        adSpend: acc.adSpend + curr.adSpend,
        impressions: acc.impressions + curr.impressions,
        clicks: acc.clicks + curr.clicks,
        orders: acc.orders + curr.orders
    }), { revenue: 0, adSpend: 0, impressions: 0, clicks: 0, orders: 0 });
  }, [filteredMetrics]);

  const globalRoas = useMemo(() => {
    return totals.adSpend > 0 ? totals.revenue / totals.adSpend : 0;
  }, [totals]);

  // Calculate Stats per Client for the List
  const clientStats = useMemo(() => {
    return clients
      .filter(c => c.isActive) // Only show active clients in the list
      .map(client => {
        const clientMetrics = metrics.filter(m => {
            const isClient = m.clientId === client.id;
            let isPlatform = true;
            if (selectedPlatformName !== 'all') {
                const platformConfig = PLATFORMS.find(p => p.id === m.platformId);
                isPlatform = platformConfig?.name === selectedPlatformName;
            }
            const dateMatch = isMetricInDateRange(m.weekStart);

            return isClient && isPlatform && dateMatch;
        });
        
        const stats = clientMetrics.reduce((acc, curr) => ({
            revenue: acc.revenue + curr.revenue,
            adSpend: acc.adSpend + curr.adSpend,
            orders: acc.orders + curr.orders,
            clicks: acc.clicks + curr.clicks
        }), { revenue: 0, adSpend: 0, orders: 0, clicks: 0 });

        return {
            client,
            ...stats,
            roas: stats.adSpend > 0 ? stats.revenue / stats.adSpend : 0,
            conversion: stats.clicks > 0 ? (stats.orders / stats.clicks) * 100 : 0
        };
    })
    .filter(c => selectedClientId === 'all' || c.client.id === selectedClientId)
    .filter(c => c.revenue > 0 || c.orders > 0)
    .sort((a, b) => b.revenue - a.revenue);
  }, [clients, metrics, selectedClientId, selectedPlatformName, dateFilterRange]);


  // --- DETAIL VIEW LOGIC ---

  const handleClientClick = (client: Client) => {
    setDetailClient(client);
    setViewMode('client_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setDetailClient(null);
    setViewMode('overview');
  };

  // Prepare Comparative Data for Detail View
  const comparativeData = useMemo(() => {
    if (!detailClient) return null;

    // 1. Get all metrics for this client
    const clientMetrics = metrics.filter(m => m.clientId === detailClient.id);

    // 2. Group by week
    const weeksMap = new Map<string, typeof clientMetrics>();
    clientMetrics.forEach(m => {
        if (!weeksMap.has(m.weekStart)) weeksMap.set(m.weekStart, []);
        weeksMap.get(m.weekStart)?.push(m);
    });

    // 3. Calculate consolidated totals per week
    const weeklyTotals = Array.from(weeksMap.entries()).map(([weekStart, weekMetrics]) => {
        const total = weekMetrics.reduce((acc, curr) => ({
            revenue: acc.revenue + curr.revenue,
            adSpend: acc.adSpend + curr.adSpend,
            impressions: acc.impressions + curr.impressions,
            clicks: acc.clicks + curr.clicks,
            orders: acc.orders + curr.orders
        }), { revenue: 0, adSpend: 0, impressions: 0, clicks: 0, orders: 0 });

        return {
            weekStart,
            ...total,
            roas: total.adSpend > 0 ? total.revenue / total.adSpend : 0,
            conversion: total.clicks > 0 ? (total.orders / total.clicks) * 100 : 0,
            ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0
        };
    });

    // 4. Sort by date descending (Newest first)
    weeklyTotals.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

    // 5. Take top 2
    const currentWeek = weeklyTotals[0];
    const prevWeek = weeklyTotals[1];

    return { currentWeek, prevWeek };

  }, [detailClient, metrics]);


  // Format Helpers
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(val);
  const formatPercent = (val: number) => `${val.toFixed(2)}%`;
  
  const renderTrendArrow = (current: number, previous: number, inverse = false) => {
    if (!previous) return null;
    const diff = current - previous;
    const isPositive = diff > 0;
    const isGood = inverse ? !isPositive : isPositive;

    return (
        <span className={`ml-2 inline-flex items-center ${isGood ? 'text-[#7CFC00]' : 'text-red-500'}`}>
            {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
        </span>
    );
  };

  // --- RENDER ---

  if (viewMode === 'client_detail' && detailClient) {
      // Safely access data
      const current = comparativeData?.currentWeek;
      const prev = comparativeData?.prevWeek;

      // Define rows based on the screenshot order
      const reportRows = [
          { label: 'Faturamento', key: 'revenue', format: formatCurrency },
          { label: 'Impressões', key: 'impressions', format: formatNumber },
          { label: 'Cliques', key: 'clicks', format: formatNumber }, 
          { label: 'Pedidos', key: 'orders', format: (v: number) => v.toString() },
          { label: 'Investimento', key: 'adSpend', format: formatCurrency },
          { label: 'Taxa Conversão', key: 'conversion', format: formatPercent },
          { label: 'ROAS', key: 'roas', format: (v: number) => v.toFixed(2) },
          { label: 'CTR', key: 'ctr', format: formatPercent },
      ];

      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Detail Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleBackToOverview}
                    className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                >
                    <ArrowLeftIcon />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard - {detailClient.name}</h2>
                    <p className="text-gray-500">Visão detalhada de performance</p>
                </div>
            </div>

            {/* Quick KPIs for this client */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                 <KpiCard 
                    title="Faturamento (Atual)" 
                    value={current ? formatCurrency(current.revenue) : 'R$ 0,00'} 
                    trendValue={current && prev ? `${(((current.revenue - prev.revenue)/prev.revenue)*100).toFixed(1)}%` : '-'}
                    trendLabel="vs. semana anterior"
                    icon={<BarChartIcon />}
                />
                 <KpiCard 
                    title="ROAS (Atual)" 
                    value={current ? current.roas.toFixed(2) : '0.00'} 
                    trendValue=""
                    trendLabel="Retorno sobre AdSpend"
                    icon={<TrendingUpIcon />}
                    iconBgColor="bg-green-600"
                />
                <KpiCard 
                    title="Pedidos" 
                    value={current ? current.orders.toString() : '0'} 
                    trendValue=""
                    trendLabel="Volume semanal"
                    icon={<ShoppingCartIcon />}
                    iconBgColor="bg-blue-600"
                />
                 <KpiCard 
                    title="Investimento" 
                    value={current ? formatCurrency(current.adSpend) : 'R$ 0,00'} 
                    trendValue=""
                    trendLabel="Budget consumido"
                    icon={<FilterIcon />}
                    iconBgColor="bg-indigo-600"
                />
            </div>

            {/* DARK COMPARATIVE REPORT TABLE */}
            <div className="bg-[#0f1115] rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                <div className="p-6 sm:p-8 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white tracking-tight">Relatório Semanal Comparativo</h3>
                    <p className="text-gray-400 text-sm mt-1">Comparativo entre a semana atual e anterior.</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">Métrica</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right w-1/3">
                                    {prev ? new Date(prev.weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                    <span className="block text-[10px] text-gray-600 font-normal">Semana Anterior</span>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-widest text-right w-1/3">
                                    {current ? new Date(current.weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                    <span className="block text-[10px] text-gray-500 font-normal">Semana Atual</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {reportRows.map((row, index) => {
                                // @ts-ignore
                                const valCurrent = current ? current[row.key] : 0;
                                // @ts-ignore
                                const valPrev = prev ? prev[row.key] : 0;
                                
                                return (
                                    <tr key={index} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                            {row.label}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-gray-500 text-right tabular-nums">
                                            {prev ? row.format(valPrev) : '-'}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-white text-right tabular-nums">
                                            <div className="flex items-center justify-end gap-2">
                                                {current ? row.format(valCurrent) : '-'}
                                                {renderTrendArrow(valCurrent, valPrev)}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      );
  }

  // --- DEFAULT OVERVIEW RENDER ---

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Dashboard - Gestores</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <span>Visão consolidada</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{activeClientIds.size} clientes ativos</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                  onClick={onOpenDataEntry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                  <PlusIcon />
                  Inserir Dados Semanais
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white border border-black rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                  <DownloadIcon />
                  Exportar Relatório
              </button>
            </div>
        </div>

        {/* Styled Filters Bar */}
        <div className="flex flex-col gap-4 bg-white p-2 pr-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-500 text-xs font-bold uppercase tracking-wider border border-gray-100 whitespace-nowrap">
                    <FilterIcon />
                    Filtros:
                </div>
                
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <select 
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2 pl-3 pr-8 text-gray-900 text-sm font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="all">Todos os Clientes</option>
                        {clients.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select 
                        value={selectedPlatformName}
                        onChange={(e) => setSelectedPlatformName(e.target.value)}
                        className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2 pl-3 pr-8 text-gray-900 text-sm font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="all">Todas as Plataformas</option>
                        {uniquePlatforms.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div className="relative">
                     <select 
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2 pl-3 pr-8 text-gray-900 text-sm font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="all">Todo o Período</option>
                        <option value="7d">Últimos 7 Dias</option>
                        <option value="30d">Últimos 30 Dias</option>
                        <option value="month">Este Mês</option>
                        <option value="year">Este Ano</option>
                        <option value="custom">Personalizado</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
            </div>

            {/* Custom Date Pickers - Only Visible when 'custom' is selected */}
            {selectedPeriod === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <CustomDatePicker 
                        label="Data Início" 
                        value={customStartDate} 
                        onChange={setCustomStartDate} 
                    />
                    <CustomDatePicker 
                        label="Data Fim" 
                        value={customEndDate} 
                        onChange={setCustomEndDate} 
                    />
                </div>
            )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="VGV Total" 
          value={formatNumber(totals.revenue)} 
          trendValue="+12.5%"
          trendLabel="vs. período anterior"
          icon={<BarChartIcon />} 
          iconBgColor="bg-gray-900"
        />
        <KpiCard 
          title="Cliques" 
          value={formatNumber(totals.clicks)} 
          trendValue="+15.7%"
          trendLabel="vs. período anterior"
          icon={<MousePointerIcon />}
          iconBgColor="bg-indigo-600" 
        />
        <KpiCard 
          title="Pedidos" 
          value={totals.orders.toString()} 
          trendValue="+23.4%"
          trendLabel="vs. período anterior"
          icon={<ShoppingCartIcon />}
          iconBgColor="bg-black" 
        />
        <KpiCard 
          title="ROI (ROAS)" 
          value={globalRoas.toFixed(2)} 
          trendValue="+12.4%"
          trendLabel="vs. período anterior"
          icon={<TrendingUpIcon />}
          iconBgColor="bg-green-600" 
        />
      </div>

      {/* Section 2: Client Overview List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               </div>
               <h3 className="text-lg font-bold text-gray-900">Visão Geral dos Clientes</h3>
             </div>
             <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
               {clientStats.length} clientes ativos
             </span>
         </div>
         
         <div className="divide-y divide-gray-100">
            {clientStats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    Nenhum cliente com dados neste período.
                </div>
            ) : (
                clientStats.map((stat) => (
                    <div 
                        key={stat.client.id} 
                        onClick={() => handleClientClick(stat.client)}
                        className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 group-hover:bg-white group-hover:border-black transition-all">
                                <UserIcon />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-base group-hover:underline decoration-1 underline-offset-2">{stat.client.name}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{stat.orders} pedidos</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>ROAS {stat.roas.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 sm:text-right">
                             <div>
                                <div className="text-lg font-bold text-gray-900">{formatCurrency(stat.revenue)}</div>
                                <div className="flex items-center gap-1 justify-start sm:justify-end text-xs font-medium text-[#7CFC00] brightness-75">
                                    <TrendingUpIcon />
                                    {stat.conversion.toFixed(2)}% conversão
                                </div>
                             </div>
                             <div className="hidden sm:block text-gray-300 group-hover:text-black transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                             </div>
                        </div>
                    </div>
                ))
            )}
         </div>
         
         <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
             <button className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
                 Ver todos os clientes
             </button>
         </div>
      </div>

      {/* Section 3: Funnel */}
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Funil de Conversão</h3>
          
          <div className="bg-[#0f172a] rounded-xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
               {/* Background Glow Effect */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               <div className="space-y-6 relative z-10">
                   
                   {/* Impressions Bar */}
                   <div>
                       <div className="flex justify-between items-end mb-2">
                           <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                                   <EyeIcon />
                               </div>
                               <span className="font-bold text-sm tracking-wide text-cyan-100">Impressões</span>
                           </div>
                           <span className="text-2xl font-bold text-white">{formatNumber(totals.impressions)}</span>
                       </div>
                       <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500 w-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                       </div>
                       <div className="mt-1 text-right text-xs text-cyan-400 font-medium">do funil: 100%</div>
                   </div>

                   {/* Clicks Bar */}
                   <div>
                       <div className="flex justify-between items-end mb-2">
                           <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400">
                                   <MousePointerIcon />
                               </div>
                               <span className="font-bold text-sm tracking-wide text-indigo-100">Cliques</span>
                           </div>
                           <span className="text-2xl font-bold text-white">{formatNumber(totals.clicks)}</span>
                       </div>
                       <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                              style={{ width: totals.impressions > 0 ? `${Math.min(((totals.clicks / totals.impressions) * 100) * 10, 100)}%` : '0%' }}
                            ></div>
                       </div>
                       <div className="mt-1 flex justify-between text-xs">
                           <span className="text-gray-500">Taxa de Clique (CTR)</span>
                           <span className="text-indigo-400 font-medium">
                               {totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : 0}%
                           </span>
                       </div>
                   </div>

                   {/* Orders Bar */}
                   <div>
                       <div className="flex justify-between items-end mb-2">
                           <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded bg-[#7CFC00]/20 text-[#7CFC00]">
                                   <ShoppingCartIcon />
                               </div>
                               <span className="font-bold text-sm tracking-wide text-gray-100">Pedidos</span>
                           </div>
                           <span className="text-2xl font-bold text-white">{totals.orders}</span>
                       </div>
                       <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-[#7CFC00] rounded-full shadow-[0_0_10px_rgba(124,252,0,0.5)]" 
                              style={{ width: totals.clicks > 0 ? `${Math.min(((totals.orders / totals.clicks) * 100) * 5, 100)}%` : '0%' }}
                           ></div>
                       </div>
                       <div className="mt-1 flex justify-between text-xs">
                           <span className="text-gray-500">Taxa de Conversão</span>
                           <span className="text--[#7CFC00] font-medium">
                               {totals.clicks > 0 ? ((totals.orders / totals.clicks) * 100).toFixed(2) : 0}%
                           </span>
                       </div>
                   </div>

               </div>
          </div>
      </div>

    </div>
  );
};

export default DashboardView;