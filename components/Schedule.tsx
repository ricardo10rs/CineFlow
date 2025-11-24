
import React, { useState, useEffect } from 'react';
import { WorkShift, ThemeColor, UserRole, OffRequest, User, DailySchedule } from '../types';
import { Clock, Pencil, X, Save, CalendarPlus, CheckCircle, XCircle, CalendarDays, ChevronLeft, ChevronRight, User as UserIcon, Trash2, Check, Eye, EyeOff, Lock, Palmtree, Clock as ClockOff, Sun, MousePointerClick } from 'lucide-react';

interface ScheduleProps {
  shifts: WorkShift[];
  dailySchedules: DailySchedule[];
  themeColor: ThemeColor;
  userRole: UserRole;
  userId: string;
  users: User[];
  requests: OffRequest[];
  publishedMonths: string[];
  onUpdateShifts: (shifts: WorkShift[]) => void;
  onUpdateDailySchedule: (schedule: DailySchedule) => void;
  onBulkUpdateDailySchedule: (schedules: DailySchedule[]) => void;
  onRequestOff: (date: string) => void;
  onResolveRequest: (requestId: string, status: 'approved' | 'rejected') => void;
  onDeleteRequest: (requestId: string) => void;
  onTogglePublish: (monthKey: string) => void;
  onToggleUserWeeklySchedule?: (userId: string) => void;
  onAssignVacation?: (userId: string, startDay: number, currentMonth: Date) => void; // New Prop
  isSundayOffEnabled: boolean;
  isWeeklyScheduleEnabled?: boolean;
}

export const Schedule: React.FC<ScheduleProps> = ({ 
  shifts, 
  dailySchedules,
  themeColor, 
  userRole, 
  userId,
  users,
  requests,
  publishedMonths,
  onUpdateShifts,
  onUpdateDailySchedule,
  onBulkUpdateDailySchedule,
  onRequestOff,
  onResolveRequest,
  onDeleteRequest,
  onTogglePublish,
  onToggleUserWeeklySchedule,
  onAssignVacation,
  isSundayOffEnabled,
  isWeeklyScheduleEnabled = true
}) => {
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempShifts, setTempShifts] = useState<WorkShift[]>([]);
  const [selectedSunday, setSelectedSunday] = useState('');
  
  // Monthly View States
  const [selectedUserId, setSelectedUserId] = useState<string>(userId);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isVacationMode, setIsVacationMode] = useState(false); // New State for interactive selection

  useEffect(() => {
    if (userRole !== 'admin') {
        setSelectedUserId(userId);
    }
  }, [userRole, userId]);

  const handleEditClick = () => {
    setTempShifts(JSON.parse(JSON.stringify(shifts)));
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onUpdateShifts(tempShifts);
    setIsEditing(false);
  };

  const handleShiftChange = (id: string, field: keyof WorkShift, value: any) => {
    setTempShifts(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;

      const newShifts = [...prev];
      newShifts[index] = { ...newShifts[index], [field]: value };

      if (index === 0 && field === 'date' && typeof value === 'string') {
          const match = value.match(/^(\d{1,2})[\/-]?(\d{1,2})?$/);
          
          if (match) {
              const day = parseInt(match[1], 10);
              let month = match[2] ? parseInt(match[2], 10) : (new Date().getMonth() + 1);

              if (!isNaN(day) && day >= 1 && day <= 31) {
                  const currentYear = new Date().getFullYear();
                  const baseDate = new Date(currentYear, month - 1, day);

                  for (let i = 1; i < newShifts.length; i++) {
                      const nextDate = new Date(baseDate);
                      nextDate.setDate(baseDate.getDate() + i);
                      
                      const dd = String(nextDate.getDate()).padStart(2, '0');
                      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
                      
                      newShifts[i] = {
                          ...newShifts[i],
                          date: `${dd}/${mm}`
                      };
                  }
              }
          }
      }

      if (field === 'type' && value === 'Off') {
          newShifts[index].startTime = '-';
          newShifts[index].endTime = '-';
          newShifts[index].location = '';
      } else if (field === 'type' && (value === 'Work' || value === 'Remote') && newShifts[index].type === 'Off') {
          newShifts[index].startTime = '09:00';
          newShifts[index].endTime = '-';
          newShifts[index].location = value === 'Remote' ? 'Home Office' : 'Escritório Central';
      }
      
      return newShifts;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);
  
  const getDailyStatus = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const explicitSchedule = dailySchedules.find(s => s.userId === selectedUserId && s.date === dateStr);
    if (explicitSchedule) return explicitSchedule;

    return {
        id: `virtual-${dateStr}`,
        userId: selectedUserId,
        date: dateStr,
        type: 'Work',
        isDefault: true 
    } as DailySchedule & { isDefault?: boolean };
  };

  const handleDayClick = (day: number) => {
    if (userRole !== 'admin') return;

    // --- VACATION MODE LOGIC ---
    if (isVacationMode && onAssignVacation) {
        if (window.confirm(`Confirmar férias de 30 dias a partir do dia ${day}? Isso irá sobrescrever a escala e gerar o aviso de retorno.`)) {
            onAssignVacation(selectedUserId, day, currentMonth);
            setIsVacationMode(false); // Turn off mode after selection
        }
        return;
    }

    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const currentStatus = getDailyStatus(day);
    
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isSunday = clickedDate.getDay() === 0;

    let newType: 'Work' | 'Off' | 'SundayOff' | 'Vacation' = 'Work';
    
    if (currentStatus) {
        if (isSunday) {
            if (currentStatus.type === 'Work') newType = 'SundayOff';
            else if (currentStatus.type === 'SundayOff') newType = 'Vacation';
            else if (currentStatus.type === 'Vacation') newType = 'Work';
            else newType = 'SundayOff'; 
        } else {
            if (currentStatus.type === 'Work') newType = 'Off';
            else if (currentStatus.type === 'Off') newType = 'Vacation';
            else if (currentStatus.type === 'Vacation') newType = 'Work';
            else newType = 'Work';
        }
    }

    onUpdateDailySchedule({
        id: currentStatus && !('isDefault' in currentStatus) ? currentStatus.id : Date.now().toString(),
        userId: selectedUserId,
        date: dateStr,
        type: newType
    });
  };

  const handleBulkFill = (type: 'Work' | 'Off' | 'Vacation') => {
      if (!window.confirm(`Deseja preencher TODO o mês de ${currentMonth.toLocaleString('pt-BR', { month: 'long'})} como "${type === 'Work' ? 'Trabalho' : type === 'Off' ? 'Folga' : 'Férias'}"? Isso sobrescreverá configurações atuais.`)) {
          return;
      }

      const { days: totalDays } = getDaysInMonth(currentMonth);
      const bulkUpdates: DailySchedule[] = [];

      for (let d = 1; d <= totalDays; d++) {
          const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
          
          // Skip Sundays for bulk fill
          if (dateToCheck.getDay() === 0) continue;

          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const uniqueId = `${Date.now()}-${d}-${Math.random().toString(36).substr(2, 5)}`;
          
          bulkUpdates.push({
              id: uniqueId,
              userId: selectedUserId,
              date: dateStr,
              type: type
          });
      }
      
      onBulkUpdateDailySchedule(bulkUpdates);
  };

  const getNextMonthSundays = () => {
    const dates = [];
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const targetMonth = date.getMonth(); 

    while (date.getMonth() === targetMonth) {
      if (date.getDay() === 0) { 
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        dates.push(`${d}/${m}`);
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };
  
  const getNextMonthName = () => {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const monthName = nextMonth.toLocaleDateString('pt-BR', { month: 'long' });
      return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSunday) return;

    const [reqDay, reqMonth] = selectedSunday.split('/');

    const hasPendingRequest = requests.find(req => req.userId === userId && req.status === 'pending');
    if (hasPendingRequest) {
      alert(`⚠️ Você já possui uma solicitação pendente (${hasPendingRequest.date}). Aguarde a análise ou exclua a anterior para enviar uma nova.`);
      return;
    }

    const hasApprovedInMonth = requests.find(req => {
      if (req.userId !== userId || req.status !== 'approved') return false;
      const [, rMonth] = req.date.split('/');
      return rMonth === reqMonth;
    });

    if (hasApprovedInMonth) {
      alert(`⚠️ Você já possui uma folga aprovada para o mês ${reqMonth}.`);
      return;
    }

    const currentUser = users.find(u => u.id === userId);
    if (currentUser && currentUser.jobTitle) {
      const restrictedRoles = ['Bilheteira', 'Atendente de Bombonière', 'Auxiliar de Limpeza'];
      if (restrictedRoles.includes(currentUser.jobTitle)) {
        const sameRoleRequests = requests.filter(req => {
          if (req.date !== selectedSunday || req.status === 'rejected') return false;
          const reqUser = users.find(u => u.id === req.userId);
          return reqUser?.jobTitle === currentUser.jobTitle;
        });

        if (sameRoleRequests.length >= 1) {
           alert(`⚠️ Solicitação Bloqueada! Apenas 1 profissional de ${currentUser.jobTitle} pode folgar neste domingo.`);
           return;
        }
      }
    }
    onRequestOff(selectedSunday);
    setSelectedSunday('');
    alert('Solicitação enviada com sucesso!');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a, b) => Number(a.id) - Number(b.id));
  
  const userRequests = requests.filter(r => {
      if (r.userId !== userId) return false;
      if (r.status === 'approved') return false; 
      if (r.status === 'rejected' && r.resolutionDate) {
          const resolveDate = new Date(r.resolutionDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - resolveDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays > 5) return false; 
      }
      return true;
  }).sort((a, b) => Number(b.id) - Number(a.id)); 
  
  const selectedUser = users.find(u => u.id === selectedUserId);

  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const isMonthPublished = publishedMonths.includes(`${selectedUserId}:${currentMonthKey}`);
  const canViewCalendar = userRole === 'admin' || isMonthPublished;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedule = dailySchedules.find(s => s.userId === userId && s.date === todayStr);
  const isVacationToday = todaySchedule?.type === 'Vacation';
  
  let returnDateDisplay = '';
  if (isVacationToday) {
      let checkDate = new Date();
      for(let i = 1; i <= 60; i++) {
          checkDate.setDate(checkDate.getDate() + 1);
          const dStr = checkDate.toISOString().split('T')[0];
          const s = dailySchedules.find(item => item.userId === userId && item.date === dStr);
          
          if (!s || s.type !== 'Vacation') {
             returnDateDisplay = checkDate.toLocaleDateString('pt-BR');
             break;
          }
      }
  }

  const currentUserObj = users.find(u => u.id === userId);
  const isHiddenForUser = currentUserObj?.hideWeeklySchedule || false;
  const showWeeklySchedule = userRole === 'admin' || (isWeeklyScheduleEnabled && !isHiddenForUser);

  return (
    <div className="space-y-8 animate-fade-in relative">

      {/* --- WEEKLY VIEW --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* Edit Modal */}
        {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Pencil className={`mr-2 text-${themeColor}-600`} size={20} />
                            Editar Horários de Início
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 space-y-4">
                        <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                            Nota: Esta é a escala geral de funcionamento da empresa.
                        </p>
                        {tempShifts.map((shift) => (
                            <div key={shift.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div className="sm:col-span-3">
                                    <input 
                                        type="text" 
                                        value={shift.dayOfWeek}
                                        onChange={(e) => handleShiftChange(shift.id, 'dayOfWeek', e.target.value)}
                                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        placeholder="Dia"
                                    />
                                </div>
                                
                                <div className="sm:col-span-3">
                                    <input 
                                        type="text" 
                                        value={shift.date || ''}
                                        onChange={(e) => handleShiftChange(shift.id, 'date', e.target.value)}
                                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Dia/Mês (ex: 26/10)"
                                    />
                                </div>
                                
                                <div className="sm:col-span-3">
                                    <select 
                                        value={shift.type}
                                        onChange={(e) => handleShiftChange(shift.id, 'type', e.target.value)}
                                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Work">Aberto</option>
                                        <option value="Off">Fechado</option>
                                    </select>
                                </div>

                                {shift.type !== 'Off' && (
                                    <div className="sm:col-span-3 flex items-center space-x-2">
                                        <div className="flex flex-col w-full">
                                            <input 
                                                type="time" 
                                                value={shift.startTime}
                                                onChange={(e) => handleShiftChange(shift.id, 'startTime', e.target.value)}
                                                className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                title="Horário de Início"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg mr-2 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSaveClick}
                            className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white px-6 py-2 rounded-lg shadow-lg shadow-${themeColor}-500/30 flex items-center font-bold transition-all`}
                        >
                            <Save size={18} className="mr-2" />
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Clock className={`mr-2 text-${themeColor}-600`} size={20} />
                    Horários da Semana
                </h2>
                <p className="text-xs text-slate-500">Escala geral de horários de entrada.</p>
            </div>
            {userRole === 'admin' && (
                <button 
                    onClick={handleEditClick}
                    className={`text-xs font-bold flex items-center bg-${themeColor}-50 text-${themeColor}-700 px-3 py-1.5 rounded-lg hover:bg-${themeColor}-100 border border-${themeColor}-200 transition-colors`}
                >
                    <Pencil size={12} className="mr-1.5" />
                    Editar Geral
                </button>
            )}
        </div>

        {!showWeeklySchedule ? (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <ClockOff size={40} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Aproveite seu descanso!</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs">
                    {isHiddenForUser 
                        ? "Sua escala semanal está pausada durante sua ausência."
                        : "A visualização da escala semanal está temporariamente desabilitada."
                    }
                </p>
            </div>
        ) : userRole !== 'admin' && isVacationToday ? (
            <div className="py-12 flex flex-col items-center justify-center bg-orange-50 rounded-xl border border-orange-100 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Palmtree size={40} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-orange-700">Boas Férias!</h3>
                <p className="text-orange-600 text-sm mt-2 max-w-xs">
                    Aproveite seu descanso.
                </p>
                {returnDateDisplay && (
                    <div className="mt-4 bg-white/80 px-4 py-2 rounded-lg border border-orange-200">
                        <p className="text-xs font-bold text-orange-800 uppercase">Retorno previsto</p>
                        <p className="text-lg font-bold text-orange-600">{returnDateDisplay}</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {shifts.map((shift) => {
                    const isOff = shift.type === 'Off';
                    const today = new Date();
                    const currentDayIdx = today.getDay();
                    const diff = shift.dayIndex! - currentDayIdx; 
                    const shiftDate = new Date();
                    shiftDate.setDate(today.getDate() + diff);
                    
                    const dateString = shift.date || shiftDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                    return (
                        <div key={shift.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${isOff ? 'bg-slate-50 border-slate-200/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <span className="text-xs font-bold uppercase text-slate-400 mb-0.5">{shift.dayOfWeek.substring(0,3)}</span>
                            <span className="text-xs font-medium text-slate-500 mb-1">{dateString}</span>
                            <span className="text-sm font-bold text-slate-700 mb-2">{shift.dayOfWeek.split('-')[0]}</span>
                            {isOff ? (
                                <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-1 rounded">Fechado</span>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Início</span>
                                    <span className={`text-sm font-bold text-${themeColor}-600`}>
                                        {shift.startTime}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )}
      </div>

      {/* --- MONTHLY VIEW (INDIVIDUAL) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        <CalendarDays className={`mr-2 text-${themeColor}-600`} size={20} />
                        Escala Mensal
                    </h2>
                    {userRole === 'admin' && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <UserIcon size={14} className="absolute left-3 top-2.5 text-slate-500" />
                                <select 
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.jobTitle || 'Func.'})</option>
                                    ))}
                                </select>
                            </div>
                            {selectedUser && onToggleUserWeeklySchedule && (
                                <button 
                                    onClick={() => onToggleUserWeeklySchedule(selectedUserId)}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        selectedUser.hideWeeklySchedule 
                                        ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100' 
                                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                                    title={selectedUser.hideWeeklySchedule ? "A Escala Semanal está OCULTA para este usuário" : "A Escala Semanal está VISÍVEL para este usuário"}
                                >
                                    {selectedUser.hideWeeklySchedule ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>
                    )}
                    {userRole !== 'admin' && selectedUser && (
                        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                            Sua Escala Individual
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-all"><ChevronLeft size={16} /></button>
                            <span className="mx-4 text-sm font-bold text-slate-700 min-w-[120px] text-center">
                                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-all"><ChevronRight size={16} /></button>
                        </div>

                        {userRole === 'admin' && (
                            <button 
                                onClick={() => onTogglePublish(`${selectedUserId}:${currentMonthKey}`)}
                                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                    isMonthPublished 
                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                }`}
                                title={isMonthPublished ? "Escala visível para o funcionário" : "Escala oculta (rascunho)"}
                            >
                                {isMonthPublished ? (
                                    <>
                                        <Eye size={14} className="mr-2" />
                                        Publicada
                                    </>
                                ) : (
                                    <>
                                        <EyeOff size={14} className="mr-2" />
                                        Rascunho
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
             </div>

             {!canViewCalendar ? (
                 <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                     <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Lock size={32} className="text-slate-400" />
                     </div>
                     <h3 className="text-slate-700 font-bold text-lg">Escala não disponível</h3>
                     <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">
                         A escala deste mês ainda não foi divulgada pela administração. Aguarde a publicação.
                     </p>
                 </div>
             ) : (
                 <>
                    <div className="overflow-x-auto pb-4">
                        <div className="grid grid-cols-7 gap-2 min-w-[1000px]">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">
                                    {day}
                                </div>
                            ))}

                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-28 rounded-2xl bg-slate-50/50" />
                            ))}

                            {Array.from({ length: days }).map((_, i) => {
                                const day = i + 1;
                                const currentDayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const isToday = new Date().toDateString() === currentDayDate.toDateString();
                                const weekDayName = currentDayDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                                
                                const dayFormatted = String(day).padStart(2, '0');
                                const monthFormatted = String(currentMonth.getMonth() + 1).padStart(2, '0');
                                const requestDateStr = `${dayFormatted}/${monthFormatted}`;

                                const status = getDailyStatus(day);

                                const pendingRequest = requests.find(r => 
                                    r.userId === selectedUserId && 
                                    r.date === requestDateStr && 
                                    r.status === 'pending'
                                );
                                
                                let bgClass = 'bg-slate-50 border-slate-100'; 
                                let textClass = 'text-slate-400';
                                let statusLabel = '';
                                let isPending = false;

                                if (status) {
                                    if (status.type === 'Work') {
                                        bgClass = `bg-${themeColor}-600 shadow-md shadow-${themeColor}-200 border-${themeColor}-500`;
                                        textClass = `text-white`;
                                        statusLabel = 'Trabalho';
                                    } else if (status.type === 'SundayOff') {
                                        bgClass = 'bg-purple-600 shadow-md shadow-purple-200 border-purple-500';
                                        textClass = 'text-white';
                                        statusLabel = 'Folga Dom.';
                                    } else if (status.type === 'Off') {
                                        bgClass = 'bg-emerald-600 shadow-md shadow-emerald-200 border-emerald-500';
                                        textClass = 'text-white';
                                        statusLabel = 'Folga';
                                    } else if (status.type === 'Vacation') {
                                        bgClass = 'bg-orange-500 shadow-md shadow-orange-200 border-orange-400';
                                        textClass = 'text-white';
                                        statusLabel = 'Férias';
                                    }
                                }

                                if (userRole === 'admin' && pendingRequest && (!status || ('isDefault' in status))) {
                                    bgClass = 'bg-amber-400 shadow-md shadow-amber-200 border-amber-400';
                                    textClass = 'text-white';
                                    statusLabel = 'Solicitação';
                                    isPending = true;
                                }

                                return (
                                    <div 
                                        key={day} 
                                        onClick={() => !isPending && handleDayClick(day)}
                                        className={`
                                            h-28 p-2 flex flex-col justify-between transition-all relative rounded-2xl border cursor-default select-none
                                            ${bgClass}
                                            ${(userRole === 'admin' && !isPending) ? (isVacationMode ? 'cursor-pointer ring-2 ring-orange-400 scale-95 opacity-90' : 'cursor-pointer active:scale-95 hover:opacity-90') : ''}
                                            ${isToday ? `ring-2 ring-offset-2 ring-offset-white ring-yellow-500 z-10` : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-bold ${textClass} opacity-70 uppercase truncate`}>{weekDayName}</span>
                                            <span className={`text-xs md:text-sm font-bold ${textClass}`}>{day}</span>
                                        </div>
                                        
                                        <div className="mt-1 text-right flex justify-end items-end h-full overflow-hidden">
                                            {isPending ? (
                                                <div className="flex gap-1 bg-white/20 p-1 rounded-lg backdrop-blur-sm">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onResolveRequest(pendingRequest!.id, 'approved'); }}
                                                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
                                                        title="Aprovar"
                                                    >
                                                        <Check size={12} strokeWidth={3} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onResolveRequest(pendingRequest!.id, 'rejected'); }}
                                                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                                                        title="Negar"
                                                    >
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ) : (
                                                statusLabel && (
                                                    <span className={`text-[10px] font-bold ${textClass} uppercase tracking-tight opacity-90 whitespace-nowrap w-full block truncate shrink-0`}>
                                                        {statusLabel}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4 text-xs text-slate-500 justify-center sm:justify-start flex-wrap">
                        <div className="flex items-center"><div className={`w-3 h-3 bg-${themeColor}-600 rounded-full mr-2`}></div> Trabalho</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div> Folga Domingo</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div> Folga Semanal</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div> Férias</div>
                        {userRole === 'admin' && <div className="flex items-center"><div className="w-3 h-3 bg-amber-400 rounded-full mr-2"></div> Solicitação Pendente</div>}
                    </div>
                 </>
             )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
         <div className="flex items-center space-x-2 mb-6">
            <div className={`p-2 rounded-lg bg-${themeColor}-50 text-${themeColor}-600`}>
              <CalendarPlus size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Solicitação de Folga Dominical</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">Solicite um domingo específico para o mês de <span className="text-slate-800 font-bold">{getNextMonthName()}</span>.</p>
                
                {isSundayOffEnabled ? (
                  <>
                    <form onSubmit={handleRequestSubmit} className="flex gap-3">
                        <div className="relative flex-1">
                            <select 
                              value={selectedSunday}
                              onChange={(e) => setSelectedSunday(e.target.value)}
                              className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                              required
                            >
                              <option value="">Selecione um domingo...</option>
                              {getNextMonthSundays().map(date => (
                                <option key={date} value={date}>Domingo - {date}</option>
                              ))}
                            </select>
                        </div>
                        <button 
                          type="submit"
                          className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-${themeColor}-500/20 transition-all`}
                        >
                            Solicitar
                        </button>
                    </form>
                    <p className="text-xs text-slate-400 italic mt-2">
                       * Se aprovado, seu calendário será atualizado automaticamente.
                    </p>
                  </>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center text-slate-500">
                     <XCircle size={18} className="mr-2 text-slate-400" />
                     <span className="text-sm font-medium">Solicitações pausadas pela administração.</span>
                  </div>
                )}

                {userRole !== 'admin' && userRequests.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Suas Solicitações Recentes</h4>
                        <div className="space-y-2">
                            {userRequests.map(req => (
                                <div key={req.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Domingo - {req.date}</p>
                                        <p className="text-[10px] text-slate-400">{req.requestDate}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                            req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                            req.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                            'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {req.status === 'approved' ? 'Aprovada' : req.status === 'rejected' ? 'Negada' : 'Pendente'}
                                        </span>
                                        
                                        <button 
                                            onClick={() => onDeleteRequest(req.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                            title="Excluir solicitação"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {userRole === 'admin' && (
                <div className="border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center justify-between">
                        Solicitações da Equipe
                        {pendingRequests.length > 0 && <span className="bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full text-xs">{pendingRequests.length} pendentes</span>}
                    </h4>
                    
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm">Nenhuma solicitação pendente.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{req.userName}</p>
                                            <p className="text-xs text-slate-500 font-medium mb-1">{users.find(u => u.id === req.userId)?.jobTitle || 'Func.'}</p>
                                            <p className="text-xs text-slate-400">Solicitou para: <span className="font-semibold text-slate-600">{req.date}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button 
                                           onClick={() => onResolveRequest(req.id, 'approved')}
                                           className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center border border-green-200"
                                        >
                                            <CheckCircle size={14} className="mr-1.5" /> Aceitar
                                        </button>
                                        <button 
                                           onClick={() => onResolveRequest(req.id, 'rejected')}
                                           className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center border border-red-200"
                                        >
                                            <XCircle size={14} className="mr-1.5" /> Negar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
