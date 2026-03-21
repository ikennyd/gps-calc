import React from 'react';
import { EyeIcon, MousePointerIcon, ShoppingCartIcon } from './DashboardIcons';

interface ConversionFunnelProps {
  totals: {
    impressions: number;
    clicks: number;
    orders: number;
  };
}

const formatCompact = (val: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ totals }) => {
  const ctr =
    totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : '0';

  const conversionRate =
    totals.clicks > 0
      ? ((totals.orders / totals.clicks) * 100).toFixed(2)
      : '0';

  const clicksBarWidth =
    totals.impressions > 0
      ? `${Math.min(((totals.clicks / totals.impressions) * 100) * 10, 100)}%`
      : '0%';

  const ordersBarWidth =
    totals.clicks > 0
      ? `${Math.min(((totals.orders / totals.clicks) * 100) * 5, 100)}%`
      : '0%';

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight">Funil de Conversão</h3>

      <div className="bg-[#0f172a] rounded-xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="space-y-6 relative z-10">
          {/* Impressions */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400"><EyeIcon /></div>
                <span className="font-bold text-sm tracking-wide text-cyan-100">Impressões</span>
              </div>
              <span className="text-2xl font-bold text-white">{formatCompact(totals.impressions)}</span>
            </div>
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </div>
            <div className="mt-1 text-right text-xs text-cyan-400 font-medium">do funil: 100%</div>
          </div>

          {/* Clicks */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400"><MousePointerIcon /></div>
                <span className="font-bold text-sm tracking-wide text-indigo-100">Cliques</span>
              </div>
              <span className="text-2xl font-bold text-white">{formatCompact(totals.clicks)}</span>
            </div>
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: clicksBarWidth }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-gray-500">Taxa de Clique (CTR)</span>
              <span className="text-indigo-400 font-medium">{ctr}%</span>
            </div>
          </div>

          {/* Orders */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#7CFC00]/20 text-[#7CFC00]"><ShoppingCartIcon /></div>
                <span className="font-bold text-sm tracking-wide text-gray-100">Pedidos</span>
              </div>
              <span className="text-2xl font-bold text-white">{totals.orders}</span>
            </div>
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7CFC00] rounded-full shadow-[0_0_10px_rgba(124,252,0,0.5)]"
                style={{ width: ordersBarWidth }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-gray-500">Taxa de Conversão</span>
              <span className="text-[#7CFC00] font-medium">{conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;
