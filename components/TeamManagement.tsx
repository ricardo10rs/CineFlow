
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, JobTitle, Branch } from '../types';
import { UserPlus, Trash2, User as UserIcon, Lock, Mail, Phone, Briefcase, Filter, ArrowUpDown, MessageSquare, X, Send, Plus, Pencil, Building, Paperclip, FileText, Image as ImageIcon, Settings, Check, Save, EyeOff, Clock } from 'lucide-react';

interface TeamManagementProps {
  users: User[];
  currentUserRole: UserRole;
  branches: Branch[];
  availableJobTitles: string[];
  onAddUser: (user: Omit<User, 'id' | 'avatar'>) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onDeleteUser?: (id: string) => void; // Added optional prop
  onAddJobTitle: (title: string) => void;
  onEditJobTitle: (oldTitle: string, newTitle: string) => void;
  onDeleteJobTitle: (title: string) => void;
  onSendMessage?: (userId: string, message: string, file?: File, durationMinutes?: number) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ 
  users, 
  currentUserRole,
  branches,
  availableJobTitles,
  onAddUser, 
  onUpdateUser,
  onDeleteUser,
  onAddJobTitle,
  onEditJobTitle,
  onDeleteJobTitle,
  onSendMessage 
}) => {
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState<string>('Recepcionista');
  const [role, setRole] = useState<UserRole>('employee');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || '');
  const [hideWeeklySchedule, setHideWeeklySchedule] = useState(false); // New state

  // Dynamic Job Title Logic
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [isJobManagerOpen, setIsJobManagerOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitleEdit, setTempTitleEdit] = useState('');

  // Edit User Logic
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter and Sort States
  const [filterJob, setFilterJob] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'name' | 'email'>('name');

  // Message Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<string>('1440'); // Default 24 hours
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (branches.length > 0 && !branchId) {
          setBranchId(branches[0].id);
      }
  }, [branches]);

  const handleAddJobSubmit = () => {
    if (newJobTitle.trim()) {
        onAddJobTitle(newJobTitle.trim());
        setJobTitle(newJobTitle.trim()); // Auto select
        setNewJobTitle('');
        setIsAddingJob(false);
    }
  };

  const startEditingTitle = (title: string) => {
      setEditingTitle(title);
      setTempTitleEdit(title);
  };

  const saveEditedTitle = () => {
      if (editingTitle && tempTitleEdit.trim()) {
          onEditJobTitle(editingTitle, tempTitleEdit.trim());
          setEditingTitle(null);
          setTempTitleEdit('');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
        onUpdateUser(editingUser.id, {
            name, 
            email, 
            phone, 
            jobTitle, 
            role, 
            branchId: currentUserRole === 'super_admin' ? branchId : undefined,
            hideWeeklySchedule // Update hidden status
        });
        setEditingUser(null);
    } else {
        onAddUser({ 
            name, 
            email, 
            password, 
            role,
            phone,
            jobTitle,
            branchId: currentUserRole === 'super_admin' ? branchId : undefined, // Admin uses their own branch automatically in App.tsx
            notificationPrefs: { email: true, sms: true },
            hideWeeklySchedule // Set initial hidden status
        });
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setJobTitle('Recepcionista');
    setRole('employee');
    setHideWeeklySchedule(false);
    setEditingUser(null);
  };

  const handleEditClick = (user: User) => {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setJobTitle(user.jobTitle || 'Recepcionista');
      setRole(user.role);
      setHideWeeklySchedule(user.hideWeeklySchedule || false);
      if (user.branchId) setBranchId(user.branchId);
      setPassword(''); // Don't show password, only set if changing
  };

  const handleDeleteClick = (userId: string, userName: string) => {
      if (onDeleteUser && window.confirm(`Tem certeza que deseja remover o usuário ${userName}?`)) {
          onDeleteUser(userId);
      }
  };

  const handleOpenMessage = (user: User) => {
    setSelectedUserForMessage(user);
    setMessageModalOpen(true);
    setMessageText('');
    setSelectedFile(null);
    setDuration('1440'); // Reset to default 24h
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendMessage = () => {
    if (selectedUserForMessage && messageText && onSendMessage) {
        const durationMinutes = parseInt(duration);
        onSendMessage(selectedUserForMessage.id, messageText, selectedFile || undefined, durationMinutes);
        setMessageModalOpen(false);
        setMessageText('');
        setSelectedUserForMessage(null);
        setSelectedFile(null);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  // Logic to process users based on filter and sort
  const processedUsers = users
    .filter(user => {
      if (filterJob === 'Todos') return true;
      return user.jobTitle === filterJob;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.email.localeCompare(b.email);
      }
    });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Job Title Manager Modal */}
      {isJobManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <Briefcase size={18} className="mr-2 text-blue-600" />
                        Gerenciar Cargos
                    </h3>
                    <button onClick={() => setIsJobManagerOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {availableJobTitles.map((title) => (
                        <div key={title} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                            {editingTitle === title ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input 
                                        type="text" 
                                        value={tempTitleEdit}
                                        onChange={(e) => setTempTitleEdit(e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        autoFocus
                                    />
                                    <button onClick={saveEditedTitle} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16} /></button>
                                    <button onClick={() => setEditingTitle(null)} className="text-red-400 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm font-medium text-slate-700">{title}</span>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => startEditingTitle(title)}
                                            className="text-slate-400 hover:text-blue-500 p-1.5 hover:bg-white rounded-lg transition-colors"
                                            title="Editar nome"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`Tem certeza que deseja excluir o cargo "${title}"?`)) {
                                                    onDeleteJobTitle(title);
                                                }
                                            }}
                                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-white rounded-lg transition-colors"
                                            title="Excluir cargo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {availableJobTitles.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4">Nenhum cargo cadastrado.</p>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                     <p className="text-xs text-slate-400 text-center">Use o botão "+" no formulário para adicionar novos.</p>
                </div>
            </div>
          </div>
      )}

      {/* Message Modal */}
      {messageModalOpen && selectedUserForMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <MessageSquare size={18} className="mr-2 text-blue-500" />
                        Mensagem para {selectedUserForMessage.name.split(' ')[0]}
                    </h3>
                    <button onClick={() => setMessageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lembrete / Mensagem</label>
                        <textarea 
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Digite sua mensagem aqui..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visibilidade da Aba</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <select 
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 appearance-none"
                                >
                                    <option value="15">15 Minutos</option>
                                    <option value="60">1 Hora</option>
                                    <option value="360">6 Horas</option>
                                    <option value="1440">24 Horas</option>
                                    <option value="2880">48 Horas</option>
                                </select>
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anexo (Opcional)</label>
                             <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center justify-center transition-colors h-[38px]"
                                >
                                    <Paperclip size={14} className="mr-2" />
                                    {selectedFile ? 'Alterar' : 'Anexar'}
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={handleFileSelect}
                                />
                             </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                       * A aba de mensagens aparecerá para o funcionário pelo tempo selecionado ou até que ele responda.
                    </p>

                    {selectedFile && (
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <div className="flex items-center overflow-hidden">
                                {selectedFile.type.includes('pdf') ? <FileText size={14} className="text-blue-600 mr-2 shrink-0" /> : <ImageIcon size={14} className="text-blue-600 mr-2 shrink-0" />}
                                <span className="text-xs text-blue-800 truncate">{selectedFile.name}</span>
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="text-blue-400 hover:text-red-500 ml-2">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} className="mr-2" />
                        Enviar
                    </button>
                </div>
            </div>
          </div>
      )}

      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Gestão de Equipe</h2>
           <p className="text-sm text-slate-500">Cadastre novos funcionários e gerencie acessos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <UserPlus size={20} className="mr-2 text-blue-600" />
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                {editingUser && (
                    <button onClick={resetForm} className="text-xs text-red-500 font-bold hover:underline">Cancelar</button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Branch Selection for Super Admin */}
              {currentUserRole === 'super_admin' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidade / Filial</label>
                    <div className="relative">
                        <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                        <select 
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-slate-700"
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                  </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-slate-700 placeholder-slate-400"
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Corporativo</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-slate-700 placeholder-slate-400"
                    placeholder="joao@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone / Celular</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-slate-700 placeholder-slate-400"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo / Função</label>
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                        <select
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm appearance-none text-slate-700"
                        >
                            {availableJobTitles.map(title => (
                            <option key={title} value={title}>{title}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Tools for Job Title */}
                    <button 
                        type="button" 
                        onClick={() => setIsJobManagerOpen(true)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl transition-colors border border-slate-200"
                        title="Gerenciar Cargos (Editar/Excluir)"
                    >
                        <Settings size={18} />
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => setIsAddingJob(!isAddingJob)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl transition-colors border border-blue-100"
                        title="Adicionar novo cargo"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                {isAddingJob && (
                    <div className="mt-2 flex gap-2 animate-fade-in-up">
                        <input 
                            type="text" 
                            value={newJobTitle}
                            onChange={(e) => setNewJobTitle(e.target.value)}
                            placeholder="Nome do novo cargo"
                            className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddJobSubmit}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                        >
                            Salvar
                        </button>
                    </div>
                )}
              </div>

              {!editingUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-slate-700 placeholder-slate-400"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Perfil de Acesso</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'employee' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Funcionário
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'admin' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                    <input
                        type="checkbox"
                        id="hideSchedule"
                        checked={hideWeeklySchedule}
                        onChange={(e) => setHideWeeklySchedule(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="hideSchedule" className="text-xs text-slate-600 cursor-pointer select-none flex items-center">
                         <EyeOff size={14} className="mr-1.5 text-slate-400" />
                         Ocultar Escala Semanal (Ex: Férias)
                    </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Filter Toolbar */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800">Usuários ({processedUsers.length})</h3>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Job Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <Filter size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <select
                    value={filterJob}
                    onChange={(e) => setFilterJob(e.target.value)}
                    className="w-full sm:w-40 pl-9 pr-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="Todos">Todos os Cargos</option>
                    {availableJobTitles.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="relative flex-1 sm:flex-none">
                  <ArrowUpDown size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'email')}
                    className="w-full sm:w-32 pl-9 pr-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="name">Nome</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {processedUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">Nenhum usuário encontrado com esses filtros.</p>
                </div>
              ) : (
                processedUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-100 overflow-hidden">
                         {u.avatar.length > 5 ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                         ) : (
                            u.avatar
                         )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                            <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                            {currentUserRole === 'super_admin' && u.branchId && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">
                                    {branches.find(b => b.id === u.branchId)?.name || 'Unidade Desconhecida'}
                                </span>
                            )}
                             {u.hideWeeklySchedule && (
                                <span title="Escala Oculta" className="flex">
                                    <EyeOff size={14} className="text-orange-400" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap">
                            <p className="text-xs text-slate-500">{u.email}</p>
                            <span className="text-slate-300 text-[10px] hidden sm:inline">•</span>
                            <p className="text-xs text-slate-500 font-medium">{u.jobTitle || 'Sem cargo'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'admin' 
                          ? 'bg-purple-50 text-purple-600 border-purple-200' 
                          : u.role === 'super_admin' 
                             ? 'bg-slate-800 text-white border-slate-900'
                             : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : u.role === 'super_admin' ? 'Super' : 'Func.'}
                      </span>
                      
                      <button 
                        onClick={() => handleOpenMessage(u)}
                        className="text-slate-400 hover:text-yellow-500 transition-colors p-2 bg-white rounded-lg border border-slate-200"
                        title="Enviar Mensagem"
                      >
                        <MessageSquare size={16} />
                      </button>

                      <button 
                        onClick={() => handleEditClick(u)}
                        className="text-slate-400 hover:text-blue-500 transition-colors p-2 bg-white rounded-lg border border-slate-200"
                        title="Editar Usuário"
                      >
                        <Pencil size={16} />
                      </button>

                      <button 
                        onClick={() => handleDeleteClick(u.id, u.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
