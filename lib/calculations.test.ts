import { describe, it, expect } from 'vitest';
import { getMLShippingCost, getShippingPriceIndex, calculateResults } from './calculations';
import { INITIAL_STATE } from '../constants';
import { CalculatorState } from '../types';

// Helper: build a CalculatorState with overrides on top of INITIAL_STATE
const makeInputs = (overrides: Partial<CalculatorState>): CalculatorState => ({
  ...INITIAL_STATE,
  shippingCost: 0,
  taxRate: 0,
  marketingRate: 0,
  otherCosts: 0,
  customCommission: null,
  isKit: false,
  quantity: 1,
  ...overrides,
});

// ─── getShippingPriceIndex ────────────────────────────────────────────────────

describe('getShippingPriceIndex', () => {
  it('returns 0 for price below R$19', () => {
    expect(getShippingPriceIndex(0)).toBe(0);
    expect(getShippingPriceIndex(10)).toBe(0);
    expect(getShippingPriceIndex(18.99)).toBe(0);
  });

  it('returns 1 for price in [19, 49)', () => {
    expect(getShippingPriceIndex(19)).toBe(1);
    expect(getShippingPriceIndex(35)).toBe(1);
    expect(getShippingPriceIndex(48.99)).toBe(1);
  });

  it('returns 2 for price in [49, 79)', () => {
    expect(getShippingPriceIndex(49)).toBe(2);
    expect(getShippingPriceIndex(60)).toBe(2);
  });

  it('returns 3 for price in [79, 100)', () => {
    expect(getShippingPriceIndex(79)).toBe(3);
    expect(getShippingPriceIndex(99.99)).toBe(3);
  });

  it('returns 7 for price >= R$200', () => {
    expect(getShippingPriceIndex(200)).toBe(7);
    expect(getShippingPriceIndex(500)).toBe(7);
  });
});

// ─── getMLShippingCost ────────────────────────────────────────────────────────

describe('getMLShippingCost', () => {
  it('returns correct cost for R$10 sale, 0.3kg (bracket 0, tier 0.3)', () => {
    // Table: 0.3 → [5.65, 6.55, 7.75, 12.35, 14.35, 16.45, 18.45, 20.95]
    expect(getMLShippingCost(10, 0.3)).toBe(5.65);
  });

  it('returns correct cost for R$30 sale, 0.3kg (bracket 1, tier 0.3)', () => {
    expect(getMLShippingCost(30, 0.3)).toBe(6.55);
  });

  it('returns correct cost for R$90 sale, 1.0kg (bracket 3, tier 1.0)', () => {
    // Table: 1.0 → [6.05, 6.75, 7.95, 13.85, 16.15, 18.45, 20.75, 23.65]
    expect(getMLShippingCost(90, 1.0)).toBe(13.85);
  });

  it('returns correct cost for R$200+ sale, 0.3kg (bracket 7, tier 0.3)', () => {
    expect(getMLShippingCost(250, 0.3)).toBe(20.95);
  });

  it('uses next weight tier when exact weight not in table (0.4 → tier 0.5)', () => {
    // Table: 0.5 → [5.95, 6.65, 7.85, 13.25, 15.45, 17.65, 19.85, 22.55]
    expect(getMLShippingCost(30, 0.4)).toBe(6.65);
  });

  it('uses tier 2.0 for weight exactly 2.0kg', () => {
    // Table: 2.0 → [6.25, 6.95, 8.15, 14.45, 16.85, 19.25, 21.65, 24.65]
    expect(getMLShippingCost(50, 2.0)).toBe(8.15);
  });

  it('uses the 999.0 fallback tier for very heavy items', () => {
    // Table: 999.0 → [8.75, 12.75, 14.35, 166.15, 166.15, 166.15, 166.15, 166.15]
    expect(getMLShippingCost(10, 999)).toBe(8.75);
    expect(getMLShippingCost(100, 999)).toBe(166.15);
  });
});

// ─── calculateResults – commission ───────────────────────────────────────────

describe('calculateResults – commission', () => {
  it('applies 14% commission for ML Classic', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 20, customCommission: null }),
      'ml_classic'
    );
    expect(result.commissionValue).toBeCloseTo(14);
  });

  it('applies 19% commission for ML Premium', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 20, customCommission: null }),
      'ml_premium'
    );
    expect(result.commissionValue).toBeCloseTo(19);
  });

  it('overrides platform commission with customCommission', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 20, customCommission: 10 }),
      'ml_classic'
    );
    expect(result.commissionValue).toBeCloseTo(10);
  });

  it('applies 6% commission for TikTok Shop', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 20, customCommission: null }),
      'tiktok'
    );
    expect(result.commissionValue).toBeCloseTo(6);
  });
});

// ─── calculateResults – fixed fee ────────────────────────────────────────────

describe('calculateResults – fixed fee', () => {
  it('applies R$6.75 fixed fee for ML Classic when price < R$79', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 50, cost: 10 }),
      'ml_classic'
    );
    expect(result.fixedFeeValue).toBe(6.75);
  });

  it('does NOT apply fixed fee for ML Classic when price >= R$79', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 79, cost: 10 }),
      'ml_classic'
    );
    expect(result.fixedFeeValue).toBe(0);

    const result2 = calculateResults(
      makeInputs({ salePrice: 100, cost: 10 }),
      'ml_classic'
    );
    expect(result2.fixedFeeValue).toBe(0);
  });

  it('always applies R$4.00 fixed fee for Shopee Padrão regardless of price', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 200, cost: 50 }),
      'shopee_std'
    );
    expect(result.fixedFeeValue).toBe(4.0);
  });

  it('always applies fixed fee for Shopee even on low price', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 10, cost: 2 }),
      'shopee_std'
    );
    expect(result.fixedFeeValue).toBe(4.0);
  });
});

// ─── calculateResults – tax & marketing ──────────────────────────────────────

describe('calculateResults – tax and marketing', () => {
  it('calculates correct taxValue at 4%', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 10, taxRate: 4 }),
      'amazon'
    );
    expect(result.taxValue).toBeCloseTo(4);
  });

  it('calculates correct taxValue at 11.33%', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 10, taxRate: 11.33 }),
      'amazon'
    );
    expect(result.taxValue).toBeCloseTo(11.33);
  });

  it('calculates correct marketingValue at 5%', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 10, marketingRate: 5 }),
      'amazon'
    );
    expect(result.marketingValue).toBeCloseTo(5);
  });
});

// ─── calculateResults – margin & profit ──────────────────────────────────────

describe('calculateResults – margin and profit', () => {
  it('calculates correct profit and margin for ML Classic above R$79', () => {
    // salePrice=100, commission=14%, tax=4%, shipping=10, cost=30
    // fixedFee=0 (price≥79)
    // totalDeductions = 14 + 0 + 4 + 0 + 10 + 0 = 28
    // profit = 100 - 28 - 30 = 42; margin = 42%
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 30, shippingCost: 10, taxRate: 4, customCommission: 14 }),
      'ml_classic'
    );
    expect(result.profit).toBeCloseTo(42);
    expect(result.margin).toBeCloseTo(42);
  });

  it('returns negative profit when costs exceed revenue', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 10, cost: 50, shippingCost: 5, taxRate: 4 }),
      'ml_classic'
    );
    expect(result.profit).toBeLessThan(0);
    expect(result.margin).toBeLessThan(0);
  });

  it('returns zero profit when exactly at break-even', () => {
    // With commission=14%, salePrice=50, fixedFee=6.75
    // commissionValue = 7, deductions = 7 + 6.75 = 13.75
    // cost for 0 profit = 50 - 13.75 = 36.25
    const result = calculateResults(
      makeInputs({ salePrice: 50, cost: 36.25, shippingCost: 0, customCommission: 14 }),
      'ml_classic'
    );
    expect(result.profit).toBeCloseTo(0, 1);
    expect(result.margin).toBeCloseTo(0, 1);
  });

  it('returns zero margin when salePrice is 0', () => {
    const result = calculateResults(makeInputs({ salePrice: 0, cost: 0 }), 'ml_classic');
    expect(result.margin).toBe(0);
    expect(result.roi).toBe(0);
  });
});

// ─── calculateResults – break-even ───────────────────────────────────────────

describe('calculateResults – break-even', () => {
  it('break-even is positive and lower than salePrice for profitable products', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 30, shippingCost: 10, taxRate: 4, marketingRate: 5 }),
      'ml_classic'
    );
    expect(result.breakEven).toBeGreaterThan(0);
    expect(result.breakEven).toBeLessThan(100);
  });

  it('break-even is 0 when variable rate would be 100% or more', () => {
    // commissionRate + taxRate + marketingRate = 100% → denominator = 0 → breakEven = 0
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 10, customCommission: 50, taxRate: 30, marketingRate: 20 }),
      'ml_classic'
    );
    expect(result.breakEven).toBe(0);
  });
});

// ─── calculateResults – kit ───────────────────────────────────────────────────

describe('calculateResults – kit', () => {
  it('multiplies cost by quantity for kits', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 10, isKit: true, quantity: 3, customCommission: 0 }),
      'ml_classic'
    );
    expect(result.totalProductCost).toBe(30);
  });

  it('uses quantity=1 when isKit is false', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 10, isKit: false, quantity: 5, customCommission: 0 }),
      'ml_classic'
    );
    expect(result.totalProductCost).toBe(10);
  });
});

// ─── calculateResults – ROI ───────────────────────────────────────────────────

describe('calculateResults – ROI', () => {
  it('calculates correct ROI', () => {
    // cost=20, profit=42 (from earlier test) → ROI = 42/20 * 100 = 210%
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 20, shippingCost: 10, taxRate: 4, customCommission: 14 }),
      'ml_classic'
    );
    // deductions = 14 + 0 + 4 + 0 + 10 + 0 = 28; profit = 100 - 28 - 20 = 52
    expect(result.roi).toBeCloseTo((52 / 20) * 100, 0);
  });

  it('ROI is 0 when cost is 0', () => {
    const result = calculateResults(
      makeInputs({ salePrice: 100, cost: 0, customCommission: 0 }),
      'amazon'
    );
    expect(result.roi).toBe(0);
  });
});
