
import { PlatformRule, TaxRegime } from './types';

export const PLATFORMS: PlatformRule[] = [
  {
    id: 'ml_classic',
    name: 'Mercado Livre',
    type: 'Clássico',
    defaultCommission: 14,
    defaultFixedFee: 6.75,
    threshold: 79,
    alwaysApplyFixed: false,
    color: '#FFE600',
    logoUrl: "https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small.png"
  },
  {
    id: 'ml_premium',
    name: 'Mercado Livre',
    type: 'Premium',
    defaultCommission: 19,
    defaultFixedFee: 6.75,
    threshold: 79,
    alwaysApplyFixed: false,
    color: '#FFE600',
    logoUrl: "https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small.png"
  },
  {
    id: 'shopee_std',
    name: 'Shopee',
    type: 'Padrão',
    defaultCommission: 14,
    defaultFixedFee: 4.00,
    alwaysApplyFixed: true,
    color: '#EE4D2D',
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/143px-Shopee_logo.svg.png"
  },
  {
    id: 'shopee_free',
    name: 'Shopee',
    type: 'Frete Grátis',
    defaultCommission: 20,
    defaultFixedFee: 4.00,
    alwaysApplyFixed: true,
    color: '#EE4D2D',
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/143px-Shopee_logo.svg.png"
  },
  {
    id: 'amazon',
    name: 'Amazon',
    type: 'Padrão',
    defaultCommission: 14,
    defaultFixedFee: 0,
    alwaysApplyFixed: true,
    color: '#FF9900',
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/200px-Amazon_icon.svg.png"
  },
  {
    id: 'magalu',
    name: 'Magalu',
    type: 'Padrão',
    defaultCommission: 20,
    defaultFixedFee: 5.00,
    alwaysApplyFixed: true,
    color: '#0086FF',
    logoUrl: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>Ⓜ️</text></svg>"
  },
  {
    id: 'tiktok',
    name: 'Tik Tok',
    type: 'Shop',
    defaultCommission: 6,
    defaultFixedFee: 2.00,
    alwaysApplyFixed: true,
    color: '#000000',
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png"
  }
];

export interface TaxRegimeOption {
  id: TaxRegime;
  label: string;
  rate: number;
  description: string;
}

export const TAX_REGIMES: TaxRegimeOption[] = [
  {
    id: 'simples_nacional',
    label: 'Simples Nacional',
    rate: 4.0,
    description: 'Alíquota efetiva ~4% (Anexo I — Comércio)',
  },
  {
    id: 'lucro_presumido',
    label: 'Lucro Presumido',
    rate: 11.33,
    description: 'IRPJ 2,4% + CSLL 1,08% + PIS 0,65% + COFINS 3% + ISS/IPI varia (~11,33%)',
  },
  {
    id: 'lucro_real',
    label: 'Lucro Real',
    rate: 0,
    description: 'Alíquota personalizada — informe o valor exato abaixo',
  },
];

export const INITIAL_STATE = {
  cost: 15.00,
  salePrice: 35.00,
  shippingCost: 0,
  taxRate: 4.0,
  taxRegime: 'simples_nacional' as TaxRegime,
  marketingRate: 5.0,
  otherCosts: 1.75,
  weight: 0.3,
  customCommission: null,
  isKit: false,
  quantity: 1
};

// Tabela Oficial de Envios Mercado Livre - Março 2026
// Estrutura: { pesoMaximo: [preços por faixa] }
// Faixas: 0-18.99, 19-48.99, 49-78.99, 79-99.99, 100-119.99, 120-149.99, 150-199.99, 200+
export const ML_SHIPPING_TABLE_2026: Record<number, number[]> = {
  0.3:  [5.65, 6.55, 7.75, 12.35, 14.35, 16.45, 18.45, 20.95],
  0.5:  [5.95, 6.65, 7.85, 13.25, 15.45, 17.65, 19.85, 22.55],
  1.0:  [6.05, 6.75, 7.95, 13.85, 16.15, 18.45, 20.75, 23.65],
  1.5:  [6.15, 6.85, 8.05, 14.15, 16.45, 18.85, 21.15, 24.65],
  2.0:  [6.25, 6.95, 8.15, 14.45, 16.85, 19.25, 21.65, 24.65],
  3.0:  [6.35, 7.95, 8.55, 15.75, 18.35, 21.05, 23.65, 26.25],
  4.0:  [6.45, 8.15, 8.95, 17.05, 19.85, 22.65, 25.55, 28.35],
  5.0:  [6.55, 8.35, 9.75, 18.45, 21.55, 24.65, 27.75, 30.75],
  6.0:  [6.65, 8.55, 9.95, 25.45, 28.55, 32.65, 35.75, 39.75],
  7.0:  [6.75, 8.75, 10.15, 27.05, 31.05, 36.05, 40.05, 44.05],
  8.0:  [6.85, 8.95, 10.35, 28.85, 33.65, 38.45, 43.25, 48.05],
  9.0:  [6.95, 9.15, 10.55, 29.65, 34.55, 39.55, 44.45, 49.35],
  11.0: [7.05, 9.55, 10.95, 41.25, 48.05, 54.95, 61.75, 68.65],
  13.0: [7.15, 9.95, 11.35, 42.15, 49.25, 56.25, 63.25, 70.25],
  15.0: [7.25, 10.15, 11.55, 45.05, 52.45, 59.95, 67.45, 74.95],
  17.0: [7.35, 10.35, 11.75, 48.55, 56.05, 63.55, 70.75, 78.65],
  20.0: [7.45, 10.55, 11.95, 54.75, 63.85, 72.95, 82.05, 91.15],
  25.0: [7.65, 10.95, 12.15, 64.05, 75.05, 84.75, 95.35, 105.95],
  30.0: [7.75, 11.15, 12.35, 65.95, 75.45, 85.55, 96.25, 106.95],
  40.0: [7.85, 11.35, 12.55, 67.75, 78.95, 88.95, 99.15, 107.05],
  50.0: [7.95, 11.55, 12.75, 70.25, 81.05, 92.05, 102.55, 110.75],
  60.0: [8.05, 11.75, 12.95, 74.95, 86.45, 98.15, 109.35, 118.15],
  70.0: [8.15, 11.95, 13.15, 80.25, 92.95, 105.05, 117.15, 126.55],
  80.0: [8.25, 12.15, 13.35, 83.95, 97.05, 109.85, 122.45, 132.25],
  90.0: [8.35, 12.35, 13.55, 93.25, 107.45, 122.05, 136.05, 146.95],
  100.0:[8.45, 12.55, 13.75, 106.55, 123.95, 139.55, 155.55, 167.95],
  125.0:[8.55, 12.75, 13.95, 119.25, 138.05, 156.05, 173.95, 187.95],
  150.0:[8.65, 12.75, 14.15, 126.55, 146.15, 165.65, 184.65, 199.45],
  999.0:[8.75, 12.75, 14.35, 166.15, 166.15, 166.15, 166.15, 166.15]
};
