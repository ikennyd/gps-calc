
import { PlatformRule, TaxRegime } from './types';
import mlShippingRaw from './data/ml-shipping.json';

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

// Tabela Oficial de Envios Mercado Livre — Março 2026
// Fonte: data/ml-shipping.json — edite APENAS o JSON para atualizar valores sem tocar no código.
// Estrutura: { pesoMaxKg: [R$ por faixa de preço] }
// Faixas de preço: 0-18.99 | 19-48.99 | 49-78.99 | 79-99.99 | 100-119.99 | 120-149.99 | 150-199.99 | 200+
export const ML_SHIPPING_TABLE_2026: Record<number, number[]> = mlShippingRaw as Record<number, number[]>;
