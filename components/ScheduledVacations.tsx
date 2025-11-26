
import React, { useState } from 'react';
import { User, VacationSchedule, ThemeColor, UserRole, Branch } from '../types';
import { CalendarPlus, User as UserIcon, Calendar, ArrowRight, Trash2, Palmtree, Clock, Building, Briefcase, Users } from 'lucide-react';

interface ScheduledVacationsProps {
  users: User[];
  schedules: VacationSchedule[];
  themeColor: ThemeColor;
  branches?: Branch[];
  onAddSchedule: (userId: string, startDate: string, returnDate: string) => void;
  onDeleteSchedule: (id: string) => void;
  userRole?: UserRole;
}

// Reusable Row Component for Vacation List
interface VacationUserRowProps {
    user: User;
    isSuperAdmin: boolean;
    branches: Branch[];
    onRemove?: () => void;
}

const VacationUserRow: React.FC<VacationUserRowProps> = ({ user, isSuperAdmin, branches, onRemove }) => (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold border border-orange-200 shrink-0">
                {user.avatar.length > 2 ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt={user.name} /> : user.avatar}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{user.jobTitle || 'Cargo não definido'}</span>
                    {isSuperAdmin && user.branchId && (
                        <span className="flex items-center bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                            <Building size={10} className="mr-1" />
                            {branches.find(b => b.id === user.branchId)?.name || 'Filial'}
                        </span>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="text-right bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Retorno Previsto</span>
                <span className="text-sm font-bold text-orange-600 flex items-center justify-end gap-1">
                    <Calendar size={12} />
                    {new Date((user.vacationReturnDate || '') + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
            </div>
            
            {onRemove && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100"
                    title="Cancelar Férias"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    </div>
);

export const ScheduledVacations: React.FC<ScheduledVacationsProps> = ({
  users,
  schedules,
  themeColor,
  branches = [],
  onAddSchedule,
  onDeleteSchedule,
  userRole
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && startDate && returnDate) {
        // Basic validation
        if (new Date(returnDate) <= new Date(startDate)) {
            alert('A data de retorno deve ser posterior à data de início.');
            return;
        }
        
        onAddSchedule(selectedUserId, startDate, returnDate);
        
        // Reset
        setSelectedUserId('');
        setStartDate('');
        setReturnDate('');
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'active': return 'bg-green-100 text-green-700 border-green-200';
          case 'completed': return 'bg-slate-100 text-slate-500 border-slate-200';
          default: return 'bg-amber-100 text-amber-700 border-amber-200';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'active': return 'Em Andamento';
          case 'completed': return 'Concluído';
          default: return 'Agendado';
      }
  };

  // Sort: Active first, then pending (by date), then completed
  const sortedSchedules = [...schedules].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      if (a.status === 'pending' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status === 'pending') return 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Filter Users Currently on Vacation
  const currentlyOnVacationUsers = users.filter(u => !!u.vacationReturnDate);

  // Separate Managers (Admins) and Employees
  const managersOnVacation = currentlyOnVacationUsers.filter(u => u.role === 'admin');
  const employeesOnVacation = currentlyOnVacationUsers.filter(u => u.role === 'employee');

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl bg-${themeColor}-100 text-${themeColor}-600`}>
                <Palmtree size={24} strokeWidth={2} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Férias e Agendamentos</h2>
                <p className="text-sm text-slate-500">Monitore quem está ausente e programe o descanso da equipe.</p>
            </div>
        </div>

        {/* SECTION: CURRENTLY ON VACATION */}
        {currentlyOnVacationUsers.length > 0 ? (
            <div className="space-y-6">
                
                {/* 1. GESTORES / GERENTES LIST */}
                {managersOnVacation.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-purple-50 flex items-center gap-2">
                            <Briefcase size={20} className="text-purple-600" />
                            <h3 className="text-base font-bold text-purple-900">
                                Gestores e Gerentes em Férias ({managersOnVacation.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {managersOnVacation.map(user => {
                                const schedule = schedules.find(s => s.userId === user.id && s.status !== 'completed');
                                return (
                                    <VacationUserRow 
                                        key={user.id} 
                                        user={user} 
                                        isSuperAdmin={isSuperAdmin} 
                                        branches={branches} 
                                        onRemove={!isSuperAdmin && schedule ? () => {
                                            if(window.confirm(`Cancelar as férias de ${user.name}? O acesso ao sistema será restaurado imediatamente.`)) {
                                                onDeleteSchedule(schedule.id);
                                            }
                                        } : undefined}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. FUNCIONÁRIOS LIST */}
                {employeesOnVacation.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-blue-50 flex items-center gap-2">
                            <Users size={20} className="text-blue-600" />
                            <h3 className="text-base font-bold text-blue-900">
                                Funcionários em Férias ({employeesOnVacation.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {employeesOnVacation.map(user => {
                                const schedule = schedules.find(s => s.userId === user.id && s.status !== 'completed');
                                return (
                                    <VacationUserRow 
                                        key={user.id} 
                                        user={user} 
                                        isSuperAdmin={isSuperAdmin} 
                                        branches={branches}
                                        onRemove={!isSuperAdmin && schedule ? () => {
                                            if(window.confirm(`Cancelar as férias de ${user.name}? O acesso ao sistema será restaurado imediatamente.`)) {
                                                onDeleteSchedule(schedule.id);
                                            }
                                        } : undefined}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        ) : isSuperAdmin && (
             <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <p>Nenhum colaborador em férias no momento.</p>
            </div>
        )}

        {/* Scheduler Grid - HIDDEN FOR SUPER ADMIN */}
        {!isSuperAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <CalendarPlus size={20} className="mr-2 text-blue-600" />
                            Programar Férias
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Funcionário</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <select 
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {users.filter(u => u.role !== 'super_admin').map(u => (
                                            <option key={u.id} value={u.id}>{u.name} {userRole === 'super_admin' ? `- ${branches.find(b => b.id === u.branchId)?.name || 'Filial'}` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Início</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <input 
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Retorno</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <input 
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center"
                            >
                                <Clock size={18} className="mr-2" />
                                Agendar Férias
                            </button>
                        </form>
                    </div>
                </div>

                {/* List of Future Schedules */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Próximos Agendamentos</h3>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">
                                {schedules.length} registros
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {sortedSchedules.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p>Nenhum agendamento encontrado.</p>
                                </div>
                            ) : (
                                sortedSchedules.map(schedule => {
                                    const startDateObj = new Date(schedule.startDate + 'T00:00:00');
                                    const returnDateObj = new Date(schedule.returnDate + 'T00:00:00');
                                    
                                    return (
                                        <div key={schedule.id} className="p-5 hover:bg-slate-50 transition-colors group">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {schedule.userAvatar?.length && schedule.userAvatar.length > 5 ? (
                                                            <img src={schedule.userAvatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            schedule.userAvatar || 'U'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{schedule.userName}</h4>
                                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                                            <span className={`px-2 py-0.5 rounded border ${getStatusColor(schedule.status)} font-bold text-[10px] uppercase mr-2`}>
                                                                {getStatusLabel(schedule.status)}
                                                            </span>
                                                            {userRole === 'super_admin' && (
                                                                <span className="text-[10px] bg-slate-100 px-1.5 rounded border border-slate-200 truncate max-w-[100px]">
                                                                    {branches.find(b => b.id === users.find(u => u.id === schedule.userId)?.branchId)?.name || 'Filial'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center flex-1 justify-center sm:justify-end gap-3 text-sm">
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Início</p>
                                                        <p className="font-medium text-slate-700">{startDateObj.toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-slate-300" />
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Retorno</p>
                                                        <p className="font-bold text-slate-800">{returnDateObj.toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                </div>

                                                {schedule.status !== 'completed' && (
                                                    <button 
                                                        onClick={() => {
                                                            if(window.confirm('Cancelar este agendamento?')) {
                                                                onDeleteSchedule(schedule.id);
                                                            }
                                                        }}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                        title="Cancelar agendamento"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
