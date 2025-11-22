
import React, { useState } from 'react';
import { Branch } from '../types';
import { Building, Plus, MapPin, Trash2 } from 'lucide-react';

interface BranchManagementProps {
  branches: Branch[];
  onAddBranch: (name: string, location: string) => void;
  onDeleteBranch: (id: string) => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({ branches, onAddBranch, onDeleteBranch }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && location) {
      onAddBranch(name, location);
      setName('');
      setLocation('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Gestão de Unidades</h2>
        <p className="text-sm text-slate-500">Cadastre e gerencie as filiais da empresa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-8">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Plus size={20} className="mr-2 text-blue-600" />
                Nova Filial
             </h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Unidade</label>
                    <div className="relative">
                        <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                            placeholder="Ex: Matriz São Paulo"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Localização</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                            placeholder="Ex: Av. Paulista, 1000"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                    Cadastrar Unidade
                </button>
             </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Unidades Ativas ({branches.length})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {branches.map(branch => (
                        <div key={branch.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{branch.name}</h4>
                                    <p className="text-sm text-slate-500 flex items-center mt-0.5">
                                        <MapPin size={12} className="mr-1" /> {branch.location}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xs font-mono text-slate-300">ID: {branch.id}</span>
                                <button 
                                    onClick={() => onDeleteBranch(branch.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Excluir Unidade"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {branches.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Nenhuma filial cadastrada.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
