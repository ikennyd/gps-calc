
import { PlatformRule } from './types';

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
    logoUrl: "https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small.png" // Official Handshake
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
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/143px-Shopee_logo.svg.png" // Shopee Bag
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
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/200px-Amazon_icon.svg.png" // Amazon 'a' with smile
  },
  {
    id: 'magalu',
    name: 'Magalu',
    type: 'Padrão',
    defaultCommission: 20,
    defaultFixedFee: 5.00,
    alwaysApplyFixed: true,
    color: '#0086FF',
    logoUrl: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>Ⓜ️</text></svg>" // Temporário M emoji
  },
  {
    id: 'tiktok',
    name: 'Tik Tok',
    type: 'Shop',
    defaultCommission: 6,
    defaultFixedFee: 2.00,
    alwaysApplyFixed: true,
    color: '#000000',
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png" // TikTok Note
  }
];

export const INITIAL_STATE = {
  cost: 15.00,
  salePrice: 35.00,
  shippingCost: 0,
  taxRate: 4.0, 
  marketingRate: 5.0, 
  otherCosts: 1.75, 
  customCommission: null,
  isKit: false,
  quantity: 1
};
