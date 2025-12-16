import React, { useState } from 'react';
import Calculator from './components/Calculator';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import DataEntryModal from './components/DataEntryModal';
import { Client, WeeklyMetric } from './types';

// Icons SVG
const LayoutDashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
);
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
);
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

type ViewState = 'dashboard' | 'calculator' | 'planning' | 'clients';

// Initial Dummy Data - Dynamic Dates to fix Calendar filter issue
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getLastWeekStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
};

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Moreana', platforms: ['Mercado Livre', 'Shopee'], createdAt: Date.now(), isActive: true },
  { id: '2', name: 'TechStore', platforms: ['Amazon', 'Mercado Livre'], createdAt: Date.now(), isActive: true },
  { id: '3', name: 'Loja Antiga', platforms: ['Shopee'], createdAt: Date.now(), isActive: false }
];

const INITIAL_METRICS: WeeklyMetric[] = [
  { id: '101', clientId: '1', platformId: 'ml_premium', weekStart: getTodayStr(), revenue: 5755, adSpend: 850, impressions: 155500, clicks: 4700, orders: 82 },
  { id: '102', clientId: '1', platformId: 'shopee_std', weekStart: getTodayStr(), revenue: 2300, adSpend: 300, impressions: 80000, clicks: 2100, orders: 45 },
  { id: '103', clientId: '2', platformId: 'amazon', weekStart: getTodayStr(), revenue: 12000, adSpend: 2000, impressions: 300000, clicks: 8000, orders: 120 },
  { id: '104', clientId: '1', platformId: 'ml_premium', weekStart: getLastWeekStr(), revenue: 5100, adSpend: 800, impressions: 140000, clicks: 4100, orders: 75 }
];

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('calculator');
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);

  // Global State
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [metrics, setMetrics] = useState<WeeklyMetric[]>(INITIAL_METRICS);

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleSaveMetric = (newMetric: WeeklyMetric) => {
    setMetrics(prev => [...prev, newMetric]);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => handleNavClick(view)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-4 group
          ${isActive 
            ? 'bg-gray-800 border-[#7CFC00] text-white' 
            : 'border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-white'
          }`}
      >
        <div className={`${isActive ? 'text-[#7CFC00]' : 'text-gray-500 group-hover:text-gray-300'}`}>
          <Icon />
        </div>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-gray-900 selection:text-white overflow-hidden">
      
      {/* MOBILE HEADER (Only Visible on LG screens and below) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f1115] z-30 flex items-center justify-between px-4 shadow-md">
         <div className="flex items-center gap-1">
            <svg className="h-6 w-auto text-white fill-current" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26 4V44M10 14L42 34M42 14L10 34" stroke="#7CFC00" strokeWidth="8" strokeLinecap="square" />
            </svg>
            <span className="font-bold text-lg tracking-tighter text-white ml-2 lowercase">gps</span>
            <span className="font-light text-lg tracking-tighter text-gray-400 lowercase">.calc</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
            <MenuIcon />
         </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION (Desktop Fixed / Mobile Slide-over) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1115] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 lg:h-20 flex items-center px-6 border-b border-gray-800">
           <div className="flex items-center gap-1">
                <svg className="h-8 w-auto text-white fill-current" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26 4V44M10 14L42 34M42 14L10 34" stroke="#7CFC00" strokeWidth="8" strokeLinecap="square" />
                </svg>
                <span className="font-bold text-2xl tracking-tighter text-white ml-2 lowercase">gps</span>
                <span className="font-light text-2xl tracking-tighter text-gray-400 lowercase">.calc</span>
           </div>
           {/* Close Button for Mobile */}
           <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden ml-auto text-gray-400">
              <XIcon />
           </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-1">
          <NavItem view="dashboard" icon={LayoutDashboardIcon} label="Dashboard" />
          <NavItem view="clients" icon={UsersIcon} label="Clientes" />
          <NavItem view="calculator" icon={CalculatorIcon} label="Calculadora" />
          <NavItem view="planning" icon={TargetIcon} label="Planejamento" />
        </nav>

        {/* Sidebar Footer (User Profile) */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3 w-full p-2 rounded-lg bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer group">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-300 border border-gray-600">
                <UserIcon />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-white truncate">Usuário</p>
               <p className="text-xs text-gray-500 truncate">Vendedor Pro</p>
             </div>
             <div className="text-gray-500 group-hover:text-white transition-colors">
               <LogOutIcon />
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F3F4F6] pt-16 lg:pt-0">
        <header className="hidden lg:flex h-20 items-center justify-between px-8 bg-white border-b border-gray-200">
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
             {currentView === 'calculator' && 'Calculadora de Lucro'}
             {currentView === 'planning' && 'Planejamento de Preço'}
             {currentView === 'dashboard' && 'Visão Geral'}
             {currentView === 'clients' && 'Gestão de Clientes'}
           </h1>
           <div className="flex items-center gap-4">
              {/* Common Header Actions if needed */}
           </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
           {currentView === 'dashboard' && (
             <DashboardView 
                clients={clients} 
                metrics={metrics} 
                onOpenDataEntry={() => setIsDataEntryOpen(true)}
             />
           )}
           {currentView === 'clients' && (
             <ClientsView 
                clients={clients} 
                onAddClient={handleAddClient} 
                onUpdateClient={handleUpdateClient}
             />
           )}
           {(currentView === 'calculator' || currentView === 'planning') && <Calculator view={currentView} />}
           
           <footer className="mt-auto py-8 text-center text-gray-400 text-xs border-t border-gray-200/50 mx-8">
              &copy; {new Date().getFullYear()} GPS Calc. O amanhã não se adivinha, se constrói.
           </footer>
        </div>
      </main>

      {/* DATA ENTRY MODAL */}
      <DataEntryModal 
        isOpen={isDataEntryOpen} 
        onClose={() => setIsDataEntryOpen(false)}
        clients={clients}
        onSave={handleSaveMetric}
      />

    </div>
  );
}

export default App;