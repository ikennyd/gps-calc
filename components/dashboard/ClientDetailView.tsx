import React from 'react';
import { Client, WeeklyMetric } from '../../types';
import KpiCard from './KpiCard';
import {
  BarChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ShoppingCartIcon,
  FilterIcon,
  ArrowLeftIcon,
} from './DashboardIcons';

interface WeekTotals {
  weekStart: string;
  revenue: number;
  adSpend: number;
  impressions: number;
  clicks: number;
  orders: number;
  roas: number;
  conversion: number;
  ctr: number;
}

interface ComparativeData {
  currentWeek: WeekTotals | undefined;
  prevWeek: WeekTotals | undefined;
}

interface ClientDetailViewProps {
  client: Client;
  metrics: WeeklyMetric[];
  onBack: () => void;
}

function buildComparativeData(client: Client, metrics: WeeklyMetric[]): ComparativeData {
  const clientMetrics = metrics.filter(m => m.clientId === client.id);
  const weeksMap = new Map<string, typeof clientMetrics>();

  clientMetrics.forEach(m => {
    if (!weeksMap.has(m.weekStart)) weeksMap.set(m.weekStart, []);
    weeksMap.get(m.weekStart)!.push(m);
  });

  const weeklyTotals: WeekTotals[] = Array.from(weeksMap.entries()).map(([weekStart, wm]) => {
    const total = wm.reduce(
      (acc, cur) => ({
        revenue: acc.revenue + cur.revenue,
        adSpend: acc.adSpend + cur.adSpend,
        impressions: acc.impressions + cur.impressions,
        clicks: acc.clicks + cur.clicks,
        orders: acc.orders + cur.orders,
      }),
      { revenue: 0, adSpend: 0, impressions: 0, clicks: 0, orders: 0 }
    );
    return {
      weekStart,
      ...total,
      roas: total.adSpend > 0 ? total.revenue / total.adSpend : 0,
      conversion: total.clicks > 0 ? (total.orders / total.clicks) * 100 : 0,
      ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
    };
  });

  weeklyTotals.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

  return { currentWeek: weeklyTotals[0], prevWeek: weeklyTotals[1] };
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatNumber = (val: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(val);
const formatPercent = (val: number) => `${val.toFixed(2)}%`;

const reportRows: { label: string; key: keyof WeekTotals; format: (v: number) => string }[] = [
  { label: 'Faturamento', key: 'revenue', format: formatCurrency },
  { label: 'Impressões', key: 'impressions', format: formatNumber },
  { label: 'Cliques', key: 'clicks', format: formatNumber },
  { label: 'Pedidos', key: 'orders', format: (v) => v.toString() },
  { label: 'Investimento', key: 'adSpend', format: formatCurrency },
  { label: 'Taxa Conversão', key: 'conversion', format: formatPercent },
  { label: 'ROAS', key: 'roas', format: (v) => v.toFixed(2) },
  { label: 'CTR', key: 'ctr', format: formatPercent },
];

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ client, metrics, onBack }) => {
  const { currentWeek: current, prevWeek: prev } = buildComparativeData(client, metrics);

  const renderTrendArrow = (cur: number, previous: number) => {
    if (!previous) return null;
    const isPositive = cur > previous;
    return (
      <span className={`ml-2 inline-flex items-center ${isPositive ? 'text-[#7CFC00]' : 'text-red-500'}`}>
        {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
        >
          <ArrowLeftIcon />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard — {client.name}</h2>
          <p className="text-gray-500">Visão detalhada de performance</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Faturamento (Atual)"
          value={current ? formatCurrency(current.revenue) : 'R$ 0,00'}
          trendValue={
            current && prev
              ? `${(((current.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1)}%`
              : '-'
          }
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

      {/* Comparative report table */}
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
                  {prev
                    ? new Date(prev.weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : '--/--'}
                  <span className="block text-[10px] text-gray-600 font-normal">Semana Anterior</span>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-widest text-right w-1/3">
                  {current
                    ? new Date(current.weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : '--/--'}
                  <span className="block text-[10px] text-gray-500 font-normal">Semana Atual</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {reportRows.map((row, index) => {
                const valCurrent = current ? (current[row.key] as number) : 0;
                const valPrev = prev ? (prev[row.key] as number) : 0;
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailView;
