import React from 'react';
import { TrendingUpIcon } from './DashboardIcons';

export interface KpiCardProps {
  title: string;
  value: string;
  trendValue: string;
  trendLabel: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trendValue,
  trendLabel,
  icon,
  iconBgColor = 'bg-black',
  iconColor = 'text-white',
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
      <div
        className={`p-3 rounded-xl ${iconBgColor} ${iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}
      >
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

export default KpiCard;
