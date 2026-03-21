import React, { useMemo, useState } from 'react';
import { Client, WeeklyMetric } from '../types';
import { PLATFORMS } from '../constants';
import KpiCard from './dashboard/KpiCard';
import MetricsKpiRow from './dashboard/MetricsKpiRow';
import DashboardFilters from './dashboard/DashboardFilters';
import ClientSummaryList, { ClientStat } from './dashboard/ClientSummaryList';
import ConversionFunnel from './dashboard/ConversionFunnel';
import ClientDetailView from './dashboard/ClientDetailView';
import { PlusIcon, DownloadIcon } from './dashboard/DashboardIcons';

interface DashboardViewProps {
  clients: Client[];
  metrics: WeeklyMetric[];
  onOpenDataEntry: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ clients, metrics, onOpenDataEntry }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'client_detail'>('overview');
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // Filter state
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedPlatformName, setSelectedPlatformName] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // ── Derived values ──────────────────────────────────────────────────────────

  const activeClientIds = useMemo(
    () => new Set(clients.filter(c => c.isActive).map(c => c.id)),
    [clients]
  );

  const dateFilterRange = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let start: Date | null = null;
    let end: Date | null = null;

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
    }
    return { start, end };
  }, [selectedPeriod, customStartDate, customEndDate]);

  const isInDateRange = (metricDate: string) => {
    if (!dateFilterRange.start && !dateFilterRange.end) return true;
    const d = new Date(metricDate + 'T00:00:00');
    if (dateFilterRange.start && d < dateFilterRange.start) return false;
    if (dateFilterRange.end && d > dateFilterRange.end) return false;
    return true;
  };

  const filteredMetrics = useMemo(
    () =>
      metrics.filter(m => {
        if (!activeClientIds.has(m.clientId)) return false;
        const clientMatch = selectedClientId === 'all' || m.clientId === selectedClientId;
        let platformMatch = true;
        if (selectedPlatformName !== 'all') {
          const p = PLATFORMS.find(pl => pl.id === m.platformId);
          platformMatch = p?.name === selectedPlatformName;
        }
        return clientMatch && platformMatch && isInDateRange(m.weekStart);
      }),
    [metrics, selectedClientId, selectedPlatformName, dateFilterRange, activeClientIds]
  );

  const totals = useMemo(
    () =>
      filteredMetrics.reduce(
        (acc, m) => ({
          revenue: acc.revenue + m.revenue,
          adSpend: acc.adSpend + m.adSpend,
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          orders: acc.orders + m.orders,
        }),
        { revenue: 0, adSpend: 0, impressions: 0, clicks: 0, orders: 0 }
      ),
    [filteredMetrics]
  );

  const globalRoas = useMemo(
    () => (totals.adSpend > 0 ? totals.revenue / totals.adSpend : 0),
    [totals]
  );

  const clientStats: ClientStat[] = useMemo(
    () =>
      clients
        .filter(c => c.isActive)
        .map(client => {
          const cm = metrics.filter(m => {
            const isClient = m.clientId === client.id;
            let isPlatform = true;
            if (selectedPlatformName !== 'all') {
              const p = PLATFORMS.find(pl => pl.id === m.platformId);
              isPlatform = p?.name === selectedPlatformName;
            }
            return isClient && isPlatform && isInDateRange(m.weekStart);
          });

          const stats = cm.reduce(
            (acc, m) => ({
              revenue: acc.revenue + m.revenue,
              adSpend: acc.adSpend + m.adSpend,
              orders: acc.orders + m.orders,
              clicks: acc.clicks + m.clicks,
            }),
            { revenue: 0, adSpend: 0, orders: 0, clicks: 0 }
          );

          return {
            client,
            ...stats,
            roas: stats.adSpend > 0 ? stats.revenue / stats.adSpend : 0,
            conversion: stats.clicks > 0 ? (stats.orders / stats.clicks) * 100 : 0,
          };
        })
        .filter(c => selectedClientId === 'all' || c.client.id === selectedClientId)
        .filter(c => c.revenue > 0 || c.orders > 0)
        .sort((a, b) => b.revenue - a.revenue),
    [clients, metrics, selectedClientId, selectedPlatformName, dateFilterRange]
  );

  // ── Event handlers ──────────────────────────────────────────────────────────

  const handleClientClick = (client: Client) => {
    setDetailClient(client);
    setViewMode('client_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setDetailClient(null);
    setViewMode('overview');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (viewMode === 'client_detail' && detailClient) {
    return (
      <ClientDetailView
        client={detailClient}
        metrics={metrics}
        onBack={handleBackToOverview}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Dashboard — Gestores</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span>Visão consolidada</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
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

        <DashboardFilters
          clients={clients}
          selectedClientId={selectedClientId}
          selectedPlatformName={selectedPlatformName}
          selectedPeriod={selectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onClientChange={setSelectedClientId}
          onPlatformChange={setSelectedPlatformName}
          onPeriodChange={setSelectedPeriod}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
        />
      </div>

      <MetricsKpiRow totals={totals} globalRoas={globalRoas} />

      <ClientSummaryList clientStats={clientStats} onClientClick={handleClientClick} />

      <ConversionFunnel totals={totals} />
    </div>
  );
};

export default DashboardView;
