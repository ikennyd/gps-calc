import React from 'react';
import { Client } from '../../types';
import { TrendingUpIcon, UserIcon } from './DashboardIcons';

export interface ClientStat {
  client: Client;
  revenue: number;
  adSpend: number;
  orders: number;
  clicks: number;
  roas: number;
  conversion: number;
}

interface ClientSummaryListProps {
  clientStats: ClientStat[];
  onClientClick: (client: Client) => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const ClientSummaryList: React.FC<ClientSummaryListProps> = ({ clientStats, onClientClick }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
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
        clientStats.map(stat => (
          <div
            key={stat.client.id}
            onClick={() => onClientClick(stat.client)}
            className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 group-hover:bg-white group-hover:border-black transition-all">
                <UserIcon />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base group-hover:underline decoration-1 underline-offset-2">
                  {stat.client.name}
                </h4>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{stat.orders} pedidos</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
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
);

export default ClientSummaryList;
