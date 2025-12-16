import React, { useState } from 'react';
import { Client } from '../types';
import { PLATFORMS } from '../constants';

// Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAddClient, onUpdateClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isClientActive, setIsClientActive] = useState(true);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Unique platform names for selection
  const uniqueMarketplaces = Array.from(new Set(PLATFORMS.map(p => p.name))).map(name => {
      const p = PLATFORMS.find(pl => pl.name === name);
      return { name: p?.name, logo: p?.logoUrl, id: p?.id.split('_')[0] };
  });

  const handleTogglePlatform = (name: string) => {
    if (selectedPlatforms.includes(name)) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== name));
    } else {
        setSelectedPlatforms([...selectedPlatforms, name]);
    }
  };

  const handleOpenAdd = () => {
    setNewClientName('');
    setSelectedPlatforms([]);
    setIsClientActive(true);
    setEditingClientId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setNewClientName(client.name);
    setSelectedPlatforms(client.platforms);
    setIsClientActive(client.isActive);
    setEditingClientId(client.id);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!newClientName.trim()) return;

    if (editingClientId) {
        // Edit Mode
        const updatedClient: Client = {
            id: editingClientId,
            name: newClientName,
            platforms: selectedPlatforms,
            createdAt: clients.find(c => c.id === editingClientId)?.createdAt || Date.now(),
            isActive: isClientActive
        };
        onUpdateClient(updatedClient);
    } else {
        // Create Mode
        const newClient: Client = {
          id: crypto.randomUUID(),
          name: newClientName,
          platforms: selectedPlatforms,
          createdAt: Date.now(),
          isActive: isClientActive
        };
        onAddClient(newClient);
    }

    setNewClientName('');
    setSelectedPlatforms([]);
    setEditingClientId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Meus Clientes</h2>
           <p className="text-gray-500 text-sm">Gerencie as empresas e marketplaces atendidos.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <PlusIcon />
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div 
            key={client.id} 
            className={`bg-white border rounded-sm p-6 shadow-sm hover:shadow-md transition-all group relative
              ${client.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50/50 opacity-80'}
            `}
          >
             {!client.isActive && (
                <div className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Inativo</div>
             )}
             
             <div className="flex items-center justify-between mb-4">
                 <div 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => handleOpenEdit(client)}
                 >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors
                      ${client.isActive ? 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 border-transparent' : 'bg-gray-100 text-gray-300 border-gray-200'}
                    `}>
                       <UserIcon />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg group-hover:underline decoration-1 underline-offset-2 ${client.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{client.name}</h3>
                      <p className="text-xs text-gray-400">ID: {client.id.slice(0, 8)}</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => handleOpenEdit(client)}
                    className="text-gray-400 hover:text-black p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar Cliente"
                 >
                    <EditIcon />
                 </button>
             </div>
             
             <div className="border-t border-gray-100 pt-4">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Plataformas Ativas</p>
               <div className="flex flex-wrap gap-2">
                 {client.platforms.length > 0 ? client.platforms.map(pName => (
                   <span key={pName} className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium 
                      ${client.isActive ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-transparent border-gray-200 text-gray-400'}
                   `}>
                     {pName}
                   </span>
                 )) : (
                    <span className="text-xs text-gray-400 italic">Nenhuma plataforma vinculada</span>
                 )}
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* MODAL ADD/EDIT CLIENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-gray-900">
                    {editingClientId ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>
              
              <div className="p-6 space-y-5">
                 <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Status do Cliente</span>
                    <button 
                      onClick={() => setIsClientActive(!isClientActive)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isClientActive ? 'bg-[#7CFC00]' : 'bg-gray-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isClientActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nome da Empresa</label>
                    <input 
                      type="text" 
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full rounded-lg border-gray-200 focus:ring-black focus:border-black transition-colors"
                      placeholder="Ex: Loja do João"
                      autoFocus
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Plataformas de Atuação</label>
                    <div className="grid grid-cols-2 gap-2">
                       {uniqueMarketplaces.map((mkt) => (
                         <label 
                            key={mkt.name} 
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPlatforms.includes(mkt.name || '') ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}
                         >
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={selectedPlatforms.includes(mkt.name || '')}
                              onChange={() => handleTogglePlatform(mkt.name || '')}
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlatforms.includes(mkt.name || '') ? 'border-black bg-black' : 'border-gray-300'}`}>
                                {selectedPlatforms.includes(mkt.name || '') && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{mkt.name}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={!newClientName.trim()}
                   className="px-4 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {editingClientId ? 'Salvar Alterações' : 'Salvar Cliente'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;