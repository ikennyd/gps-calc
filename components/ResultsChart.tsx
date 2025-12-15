import React from 'react';
import { CalculationResult, CalculatorState } from '../types';

interface ResultsChartProps {
  inputs: CalculatorState;
  results: CalculationResult;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ inputs, results }) => {
  const salePrice = Number(inputs.salePrice) || 0;

  const rawData = [
    { name: 'Custo Produto', value: results.totalProductCost, color: '#9CA3AF' }, // Gray 400
    { name: 'Comissão + Taxas', value: results.commissionValue + results.fixedFeeValue, color: '#000000' }, // Black
    { name: 'Impostos', value: results.taxValue, color: '#4B5563' }, // Gray 600
    { name: 'Frete/Ads/Outros', value: (Number(inputs.shippingCost)||0) + (Number(inputs.otherCosts)||0) + results.marketingValue, color: '#D1D5DB' }, // Gray 300
    { name: 'Lucro Líquido', value: Math.max(0, results.profit), color: '#7CFC00' }, // Lawn Green
  ];

  // Process data to filter zeros and calculate percentage
  const data = rawData
    .filter(d => d.value > 0)
    .map(d => ({
      ...d,
      percentage: salePrice > 0 ? (d.value / salePrice) * 100 : 0,
      percentageFormatted: salePrice > 0 ? ((d.value / salePrice) * 100).toFixed(1) : '0.0'
    }));

  return (
    <div className="w-full space-y-6">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              {item.name}
            </span>
            <div className="text-right flex items-center gap-2">
               <span className="text-xs font-medium text-gray-500 font-mono">
                 R$ {item.value.toFixed(2)}
               </span>
               <span className="text-xs font-black text-gray-900">
                 {item.percentageFormatted}%
               </span>
            </div>
          </div>
          
          <div className="h-4 w-full bg-gray-100 rounded-sm overflow-hidden">
            <div 
              className="h-full transition-all duration-700 ease-out rounded-sm"
              style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-xs uppercase tracking-widest">
          Sem dados para exibir
        </div>
      )}
    </div>
  );
};

export default ResultsChart;