
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