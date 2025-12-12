import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CalculationResult, CalculatorState } from '../types';

interface ResultsChartProps {
  inputs: CalculatorState;
  results: CalculationResult;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ inputs, results }) => {
  const data = [
    { name: 'Custo Produto', value: results.totalProductCost, color: '#9CA3AF' }, // Gray 400
    { name: 'Comissão + Taxas', value: results.commissionValue + results.fixedFeeValue, color: '#000000' }, // Black
    { name: 'Impostos', value: results.taxValue, color: '#4B5563' }, // Gray 600
    { name: 'Frete/Ads/Outros', value: (Number(inputs.shippingCost)||0) + (Number(inputs.otherCosts)||0) + results.marketingValue, color: '#D1D5DB' }, // Gray 300
    { name: 'Lucro Líquido', value: Math.max(0, results.profit), color: '#7CFC00' }, // Lawn Green (New Success Color)
  ];

  // Filter out zero values for cleaner chart
  const activeData = data.filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 border border-gray-200 shadow-xl rounded-none">
          <p className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wide">{payload[0].name}</p>
          <p className="text-black font-mono font-bold">R$ {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            cornerRadius={0} 
            stroke="none"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="square" 
            iconSize={10}
            wrapperStyle={{ paddingTop: '24px', fontSize: '11px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;