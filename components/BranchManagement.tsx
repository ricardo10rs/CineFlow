
import React, { useState } from 'react';
import { Branch, User } from '../types';
import { Building, Plus, MapPin, Trash2, Mail, Lock, UserCheck, Edit2, X, Check } from 'lucide-react';

interface BranchManagementProps {
  branches: Branch[];
  users?: User[];
  onAddBranch: (name: string, location: string, adminEmail: string, adminPass: string) => void;
  onDeleteBranch: (id: string) => void;
  onUpdateBranch?: (id: string, data: Partial<Branch>) => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({ branches, users = [], onAddBranch, onDeleteBranch, onUpdateBranch }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Edit State
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && location && adminEmail && adminPass) {
      onAddBranch(name, location, adminEmail, adminPass);
      setName('');
      setLocation('');
      setAdminEmail('');
      setAdminPass('');
      alert("Unidade e Administrador criados com sucesso!");
    }
  };

  const handleStartEdit = (branch: Branch) => {
      setEditingBranch(branch);
      setEditName(branch.name);
      setEditLocation(branch.location);
  };

  const handleSaveEdit = () => {
      if(editingBranch && onUpdateBranch) {
          onUpdateBranch(editingBranch.id, { name: editName, location: editLocation });
          setEditingBranch(null);
      }
  };

  const handleDelete = (branch: Branch) => {
      if (window.confirm(`Tem certeza que deseja excluir a unidade "${branch.name}"? Isso pode afetar escalas e usuários vinculados.`)) {
          onDeleteBranch(branch.id);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Gestão de Unidades</h2>
        <p className="text-sm text-slate-500">Cadastre as filiais e defina as credenciais de acesso do administrador local.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-8">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Plus size={20} className="mr-2 text-blue-600" />
                Nova Filial & Admin
             </h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Branch Info */}
                <div className="space-y-4 border-b border-slate-100 pb-4">
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
                </div>

                {/* Admin Credentials */}
                <div className="space-y-4">
                    <p className="text-xs font-bold text-blue-600 flex items-center">
                        <UserCheck size={14} className="mr-1" />
                        Credenciais do Administrador
                    </p>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email de Acesso</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                                placeholder="admin.filial@empresa.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Provisória</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text"
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 font-mono"
                                placeholder="******"
                                required
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-2">
                    Cadastrar Unidade e Admin
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
                    {branches.map(branch => {
                        const isEditing = editingBranch?.id === branch.id;
                        const branchAdmin = users.find(u => u.branchId === branch.id && u.role === 'admin');

                        return (
                            <div key={branch.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                                        <Building size={24} />
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="space-y-2 mb-2">
                                                <input 
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="block w-full px-2 py-1 text-sm border rounded bg-white"
                                                    placeholder="Nome"
                                                />
                                                <input 
                                                    value={editLocation}
                                                    onChange={(e) => setEditLocation(e.target.value)}
                                                    className="block w-full px-2 py-1 text-sm border rounded bg-white"
                                                    placeholder="Localização"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="font-bold text-slate-800">{branch.name}</h4>
                                                <p className="text-sm text-slate-500 flex items-center mt-0.5">
                                                    <MapPin size={12} className="mr-1" /> {branch.location}
                                                </p>
                                            </>
                                        )}
                                        
                                        {/* Admin Credentials Display */}
                                        {branchAdmin && (
                                            <div className="mt-3 bg-slate-100 rounded-lg p-2 text-xs border border-slate-200">
                                                <div className="font-bold text-slate-600 mb-1 flex items-center"><UserCheck size={12} className="mr-1"/> Acesso Admin:</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-slate-400 font-bold uppercase">Login:</span>
                                                        <span className="ml-1 text-slate-700 select-all">{branchAdmin.email}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 font-bold uppercase">Senha:</span>
                                                        <span className="ml-1 text-slate-700 font-mono select-all bg-white px-1 rounded">{branchAdmin.password}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 self-start md:self-center">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={18} /></button>
                                            <button onClick={() => setEditingBranch(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs font-mono text-slate-300 mr-2 hidden sm:inline">ID: {branch.id}</span>
                                            {onUpdateBranch && (
                                                <button 
                                                    onClick={() => handleStartEdit(branch)}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar Unidade"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(branch)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir Unidade"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
