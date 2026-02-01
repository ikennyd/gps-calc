
export interface PlatformRule {
  id: string;
  name: string;
  type: string;
  defaultCommission: number;
  defaultFixedFee: number;
  threshold?: number; // Price threshold for fixed fee (e.g., 79 for ML)
  alwaysApplyFixed: boolean; // If true, fixed fee applies regardless of price (e.g., Shopee)
  color: string;
  logoUrl: string; // URL for the PNG image
}

export interface CalculationResult {
  commissionValue: number;
  fixedFeeValue: number;
  taxValue: number;
  marketingValue: number;
  totalDeductions: number;
  netRevenue: number;
  profit: number;
  margin: number;
  roi: number;
  breakEven: number;
  totalProductCost: number; // Added to track cost * qty
}

export interface CalculatorState {
  cost: number | ''; // Allow empty string for input handling
  salePrice: number | '';
  shippingCost: number | '';
  taxRate: number | '';
  marketingRate: number | '';
  otherCosts: number | '';
  customCommission: number | null; 
  isKit: boolean; // New feature
  quantity: number | ''; // New feature
}

export interface SavedSimulation {
  id: string;
  createdAt: number;
  productName: string;
  platformId: string;
  inputs: CalculatorState;
  resultsSummary: {
    profit: number;
    margin: number;
  };
}

// Interface para um cenário de planejamento salvo
export interface PlanningScenario {
  id: string;
  createdAt: number;
  productName: string;
  platformId: string;
  targetUnits: number | ''; // Alterado para permitir string vazia durante edição
  // Salvamos os inputs originais para garantir que o cálculo seja fiel ao momento que foi salvo
  savedInputs: CalculatorState;
  // Os resultados são recalculados sempre que a plataforma ou unidades mudam
  currentResults: {
    projectedRevenue: number;
    totalCost: number;
    projectedProfit: number;
    margin: number;
    roi: number;
  };
}

// --- NEW TYPES FOR MANAGEMENT SYSTEM ---

export interface Client {
  id: string;
  name: string;
  platforms: string[]; // IDs of platforms enabled for this client
  createdAt: number;
  isActive: boolean;
}

export interface WeeklyMetric {
  id: string;
  clientId: string;
  platformId: string;
  weekStart: string; // YYYY-MM-DD
  revenue: number;
  adSpend: number;
  impressions: number;
  clicks: number;
  orders: number;
}

// --- WINTER PLANNING 2026 TYPES ---

export interface CostItem {
  id: string;
  name: string;
  costPerUnit: number; // Custo por unidade ou por kg
  paymentTerm: number; // Prazo em dias (0 = à vista)
  isPerKg?: boolean; // Se o custo é por kg (para calcular rendimento)
}

export interface WinterProduct {
  id: string;
  name: string;
  costItems: CostItem[];
  kgYield: number; // Quantas unidades 1kg rende (ex: 3)
  salePrice: number;
  createdAt: number;
}

export interface MonthlyTarget {
  month: string; // "2026-02", "2026-03", etc.
  monthLabel: string; // "Fevereiro", "Março", etc.
  targetUnits: number;
  targetRevenue: number; // Calculado: targetUnits * salePrice
}

export interface WinterScenario {
  id: string;
  name: string; // Ex: "Cenário Otimista", "Cenário Conservador"
  product: WinterProduct;
  monthlyTargets: MonthlyTarget[];
  createdAt: number;
}

export interface CashFlowEntry {
  month: string;
  monthLabel: string;
  revenue: number; // Entrada (verde)
  immediatePayments: number; // Saída à vista (vermelho)
  deferredPayments: number; // Saída a prazo (laranja)
  netCashFlow: number; // Saldo do mês
  accumulatedCashFlow: number; // Saldo acumulado
}