
import React, { useMemo } from 'react';
import { PLATFORMS } from '../constants';
import { CalculatorState, PlatformRule } from '../types';
import InfoTooltip from './InfoTooltip';

interface ComparisonTableProps {
  inputs: CalculatorState;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ inputs }) => {
  const salePrice = Number(inputs.salePrice) || 0;
  const cost = Number(inputs.cost) || 0;
  const quantity = inputs.isKit ? (Number(inputs.quantity) || 1) : 1;
  const taxRate = Number(inputs.taxRate) || 0;
  const marketingRate = Number(inputs.marketingRate) || 0;
  const otherCosts = Number(inputs.otherCosts) || 0;
  const baseShipping = Number(inputs.shippingCost) || 0;

  // Calculate stats for all platforms
  const comparisons = useMemo(() => {
    const calculated = PLATFORMS.map(platform => {
      // 1. Specific Shipping Logic per Platform
      const isShopeeFree = platform.id === 'shopee_free';
      const isMlBelow79 = platform.id.startsWith('ml_') && salePrice < 79;
      
      // If Shopee Free or ML < 79 (buyer pays), shipping is effectively 0 for the seller in this calculator logic
      // Otherwise use the input shipping cost
      const shippingCost = (isShopeeFree || isMlBelow79) ? 0 : baseShipping;

      // 2. Commission
      const commissionValue = salePrice * (platform.defaultCommission / 100);

      // 3. Fixed Fee
      let fixedFeeValue = 0;
      if (platform.alwaysApplyFixed) {
        fixedFeeValue = platform.defaultFixedFee;
      } else if (platform.threshold) {
        if (salePrice < platform.threshold) {
          fixedFeeValue = platform.defaultFixedFee;
        }
      }

      // 4. Other Variable Costs
      const taxValue = salePrice * (taxRate / 100);
      const marketingValue = salePrice * (marketingRate / 100);
      
      // 5. Total Product Cost (considering kits)
      const totalProductCost = cost * quantity;

      // 6. Totals
      const totalDeductions = commissionValue + fixedFeeValue + taxValue + marketingValue + shippingCost + otherCosts;
      const profit = salePrice - totalDeductions - totalProductCost;
      const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
      const roi = totalProductCost > 0 ? (profit / totalProductCost) * 100 : 0;

      return {
        platform,
        profit,
        margin,
        roi,
        totalDeductions
      };
    });

    // Sort by Profit Descending (Highest Profit First)
    return calculated.sort((a, b) => b.profit - a.profit);
  }, [salePrice, cost, quantity, taxRate, marketingRate, otherCosts, baseShipping]);

  // Find the best profit to highlight (first item after sort)
  const maxProfit = comparisons.length > 0 ? comparisons[0].profit : 0;

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-5 border-b border-gray-100 bg-black text-white flex justify-between items-center">
        <div>
           <h3 className="font-bold text-lg">Comparativo de Plataformas</h3>
           <p className="text-gray-400 text-xs mt-1">Ordenado do maior para o menor lucro.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Plataforma</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Taxas Totais</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Margem</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">ROI</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Lucro Líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisons.map((item) => {
              const isWinner = item.profit === maxProfit && maxProfit > 0; // Check specifically against maxProfit
              
              return (
                <tr 
                  key={item.platform.id} 
                  className={`hover:bg-gray-50 transition-colors ${isWinner ? 'bg-[#7CFC00]/10' : ''}`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm shrink-0 overflow-hidden">
                        <img 
                          src={item.platform.logoUrl} 
                          alt={item.platform.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold leading-tight">{item.platform.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{item.platform.type}</span>
                      </div>
                      {isWinner && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#7CFC00] text-black uppercase tracking-wide">
                          Melhor
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    R$ {(item.totalDeductions).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${item.profit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {item.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {item.roi.toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-lg font-black ${item.profit >= 0 ? 'text-black' : 'text-red-600'}`}>
                      R$ {item.profit.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
