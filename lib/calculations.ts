import { PLATFORMS, ML_SHIPPING_TABLE_2026 } from '../constants';
import { CalculationResult, CalculatorState } from '../types';

// Price bracket boundaries for the ML shipping table (index 0–7)
const PRICE_BRACKETS = [19, 49, 79, 100, 120, 150, 200] as const;

/** Returns the column index (0–7) for the ML shipping table given a sale price. */
export function getShippingPriceIndex(salePrice: number): number {
  for (let i = 0; i < PRICE_BRACKETS.length; i++) {
    if (salePrice < PRICE_BRACKETS[i]) return i;
  }
  return 7;
}

/**
 * Looks up the ML shipping cost from the 2026 table.
 * Uses the first weight tier >= the provided weight.
 */
export function getMLShippingCost(salePrice: number, weight: number): number {
  const priceIndex = getShippingPriceIndex(salePrice);
  const tiers = Object.keys(ML_SHIPPING_TABLE_2026).map(Number).sort((a, b) => a - b);
  const tier = tiers.find(w => w >= weight) ?? 999.0;
  return ML_SHIPPING_TABLE_2026[tier]?.[priceIndex] ?? 0;
}

/**
 * Core profit / margin calculation for a single unit sale.
 * NOTE: for ML platforms shippingCost should be pre-computed via getMLShippingCost
 * and stored in inputs.shippingCost before calling this function.
 */
export function calculateResults(
  inputs: CalculatorState,
  platformId: string
): CalculationResult {
  const platform = PLATFORMS.find(p => p.id === platformId) ?? PLATFORMS[0];
  const getVal = (val: number | ''): number => (val === '' ? 0 : val);

  const cost = getVal(inputs.cost);
  const salePrice = getVal(inputs.salePrice);
  const shippingCost = getVal(inputs.shippingCost);
  const taxRate = getVal(inputs.taxRate);
  const marketingRate = getVal(inputs.marketingRate);
  const otherCosts = getVal(inputs.otherCosts);
  const quantity = inputs.isKit ? getVal(inputs.quantity) : 1;

  // Commission
  const commissionRate = inputs.customCommission ?? platform.defaultCommission;
  const commissionValue = salePrice * (commissionRate / 100);

  // Fixed fee
  let fixedFeeValue = 0;
  if (platform.alwaysApplyFixed) {
    fixedFeeValue = platform.defaultFixedFee;
  } else if (platform.threshold !== undefined && salePrice < platform.threshold) {
    fixedFeeValue = platform.defaultFixedFee;
  }

  // Variable cost components
  const taxValue = salePrice * (taxRate / 100);
  const marketingValue = salePrice * (marketingRate / 100);
  const totalProductCost = cost * quantity;

  const totalDeductions =
    commissionValue + fixedFeeValue + taxValue + marketingValue + shippingCost + otherCosts;

  const netRevenue = salePrice - totalDeductions;
  const profit = netRevenue - totalProductCost;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  const roi = totalProductCost > 0 ? (profit / totalProductCost) * 100 : 0;

  // Break-even: minimum sale price for zero profit
  const variableRate = (commissionRate + taxRate + marketingRate) / 100;
  const hardCosts =
    totalProductCost +
    shippingCost +
    otherCosts +
    (salePrice < (platform.threshold ?? 0) ? platform.defaultFixedFee : 0);
  const breakEven = 1 - variableRate > 0 ? hardCosts / (1 - variableRate) : 0;

  return {
    commissionValue,
    fixedFeeValue,
    taxValue,
    marketingValue,
    totalDeductions,
    netRevenue,
    profit,
    margin,
    roi,
    breakEven,
    totalProductCost,
  };
}

/** Calculates projected results for a planning scenario (multiple units). */
export function calculatePlanningScenario(
  inputs: CalculatorState,
  platformId: string,
  units: number | ''
) {
  const platform = PLATFORMS.find(p => p.id === platformId) ?? PLATFORMS[0];
  const getVal = (val: number | ''): number => (val === '' ? 0 : val);

  const cost = getVal(inputs.cost);
  const salePrice = getVal(inputs.salePrice);
  const taxRate = getVal(inputs.taxRate);
  const marketingRate = getVal(inputs.marketingRate);
  const otherCosts = getVal(inputs.otherCosts);
  const weight = getVal(inputs.weight);
  const quantity = inputs.isKit ? getVal(inputs.quantity) : 1;

  let shippingCost = getVal(inputs.shippingCost);
  if (platformId.startsWith('ml_')) {
    shippingCost = getMLShippingCost(salePrice, weight);
  } else if (platformId === 'shopee_free') {
    shippingCost = 0;
  }

  const commissionRate = inputs.customCommission ?? platform.defaultCommission;
  const commissionValue = salePrice * (commissionRate / 100);

  let fixedFeeValue = 0;
  if (platform.alwaysApplyFixed) {
    fixedFeeValue = platform.defaultFixedFee;
  } else if (platform.threshold !== undefined && salePrice < platform.threshold) {
    fixedFeeValue = platform.defaultFixedFee;
  }

  const taxValue = salePrice * (taxRate / 100);
  const marketingValue = salePrice * (marketingRate / 100);
  const totalProductCost = cost * quantity;
  const totalDeductions =
    commissionValue + fixedFeeValue + taxValue + marketingValue + shippingCost + otherCosts;
  const profitPerUnit = salePrice - totalDeductions - totalProductCost;

  const safeUnits = getVal(units as number | '');
  const projectedRevenue = salePrice * safeUnits;
  const totalCost = (totalProductCost + totalDeductions) * safeUnits;
  const projectedProfit = profitPerUnit * safeUnits;
  const margin = salePrice > 0 ? (profitPerUnit / salePrice) * 100 : 0;
  const roi = totalProductCost > 0 ? (profitPerUnit / totalProductCost) * 100 : 0;

  return { projectedRevenue, totalCost, projectedProfit, margin, roi };
}
