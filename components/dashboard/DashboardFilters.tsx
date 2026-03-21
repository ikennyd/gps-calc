import React from 'react';
import { Client } from '../../types';
import { PLATFORMS } from '../../constants';
import CustomDatePicker from '../CustomDatePicker';
import { FilterIcon } from './DashboardIcons';

interface DashboardFiltersProps {
  clients: Client[];
  selectedClientId: string;
  selectedPlatformName: string;
  selectedPeriod: string;
  customStartDate: string;
  customEndDate: string;
  onClientChange: (id: string) => void;
  onPlatformChange: (name: string) => void;
  onPeriodChange: (period: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const SelectArrow = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  clients,
  selectedClientId,
  selectedPlatformName,
  selectedPeriod,
  customStartDate,
  customEndDate,
  onClientChange,
  onPlatformChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  const uniquePlatforms = React.useMemo(() => {
    const seen = new Set<string>();
    return PLATFORMS.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 bg-white p-2 pr-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-500 text-xs font-bold uppercase tracking-wider border border-gray-100 whitespace-nowrap">
          <FilterIcon />
          Filtros:
        </div>

        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Client filter */}
          <div className="relative">
            <select
              value={selectedClientId}
              onChange={e => onClientChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2 pl-3 pr-8 text-gray-900 text-sm font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:leading-6 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="all">Todos os Clientes</option>
              {clients.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <SelectArrow />
            </div>
          </div>

          {/* Platform filter */}
          <div className="relative">
            <select
              value={selectedPlatformName}
              onChange={e => onPlatformChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2 pl-3 pr-8 text-gray-900 text-sm font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:leading-6 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="all">Todas as Plataformas</option>
              {uniquePlatforms.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <SelectArrow />
            </div>
          </div>

          {/* Period filter */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={e => onPeriodChange(e.target.value)}
              className="block w-full appearance-none rounded-lg border-0 bg-gray-50 py-2 pl-3 pr-8 text-gray-900 text-sm font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-black sm:leading-6 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="all">Todo o Período</option>
              <option value="7d">Últimos 7 Dias</option>
              <option value="30d">Últimos 30 Dias</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
              <option value="custom">Personalizado</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <SelectArrow />
            </div>
          </div>
        </div>
      </div>

      {selectedPeriod === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
          <CustomDatePicker label="Data Início" value={customStartDate} onChange={onStartDateChange} />
          <CustomDatePicker label="Data Fim" value={customEndDate} onChange={onEndDateChange} />
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
