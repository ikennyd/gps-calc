import React from 'react';
import KpiCard from './KpiCard';
import { BarChartIcon, MousePointerIcon, ShoppingCartIcon, TrendingUpIcon } from './DashboardIcons';

interface MetricsKpiRowProps {
  totals: {
    revenue: number;
    clicks: number;
    orders: number;
  };
  globalRoas: number;
}

const formatCompact = (val: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

const MetricsKpiRow: React.FC<MetricsKpiRowProps> = ({ totals, globalRoas }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <KpiCard
      title="VGV Total"
      value={formatCompact(totals.revenue)}
      trendValue="+12.5%"
      trendLabel="vs. período anterior"
      icon={<BarChartIcon />}
      iconBgColor="bg-gray-900"
    />
    <KpiCard
      title="Cliques"
      value={formatCompact(totals.clicks)}
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
);

export default MetricsKpiRow;
