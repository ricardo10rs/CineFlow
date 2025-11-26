
import React, { useState } from 'react';
import { WorkShift, DailySchedule, ThemeColor, UserRole, User, OffRequest } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, Lock, MousePointer2, Trash2, Edit2, X, Save, User as UserIcon, Send } from 'lucide-react';

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
  isSundayOffEnabled: boolean;
  isWeeklyScheduleEnabled: boolean;
  onToggleUserWeeklySchedule: (userId: string) => void;
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
  onRequestOff,
  onResolveRequest,
  onDeleteRequest,
  onTogglePublish,
  isSundayOffEnabled,
  isWeeklyScheduleEnabled,
  onUpdateDailySchedule
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Edit Weekly Schedule States
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editIsOff, setEditIsOff] = useState(false);

  // Request Off State
  const [selectedRequestDate, setSelectedRequestDate] = useState('');

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const currentUserObj = users.find(u => u.id === userId);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday

  // Month Key for Publication Logic
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const isPublished = publishedMonths.includes(monthKey);

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };
  
  const formatRequestDate = (dateObj: Date) => {
      return `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleDayClick = (day: number) => {
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSunday = dateObj.getDay() === 0;
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Admin Toggle Logic
      if (isAdmin) {
          const existingSchedule = dailySchedules.find(s => s.date === dateStr && s.userId === userId);
          const currentType = existingSchedule ? existingSchedule.type : 'Work';

          let nextType: 'Work' | 'Off' | 'Vacation' | 'SundayOff' = 'Work';

          if (currentType === 'Work') {
              nextType = 'Off'; // Folga Semanal
          } else if (currentType === 'Off') {
              nextType = 'Vacation'; // Férias
          } else if (currentType === 'Vacation') {
              if (isSunday) {
                  nextType = 'SundayOff'; // Folga Dominical
              } else {
                  nextType = 'Work'; // Back to start
              }
          } else if (currentType === 'SundayOff') {
              nextType = 'Work';
          }

          const newSchedule: DailySchedule = {
              id: existingSchedule ? existingSchedule.id : Date.now().toString(),
              userId: userId,
              date: dateStr,
              type: nextType
          };

          onUpdateDailySchedule(newSchedule);
          return;
      }
  };

  // --- SUNDAY REQUEST LOGIC ---
  const getUpcomingSundays = () => {
      const dates: Date[] = [];
      const today = new Date();
      // Start from today
      let d = new Date(today);
      
      // Find next Sunday
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? 0 : 7); 
      d.setDate(diff); // Next Sunday (or today if Sunday)

      // Only allow future dates
      if (d <= today) d.setDate(d.getDate() + 7);

      // Generate for next 8 weeks (approx 2 months)
      for (let i = 0; i < 12; i++) {
          dates.push(new Date(d));
          d.setDate(d.getDate() + 7);
      }
      return dates;
  };

  const availableSundays = getUpcomingSundays();

  const handleSubmitRequest = () => {
      if (!selectedRequestDate) return;
      
      // Check duplicate
      const hasPending = requests.some(r => r.fullDate === selectedRequestDate && r.userId === userId && r.status !== 'rejected');
      const isApproved = dailySchedules.some(s => s.date === selectedRequestDate && s.userId === userId && s.type === 'SundayOff');

      if (hasPending) {
          alert('Você já possui uma solicitação para esta data.');
          return;
      }
      if (isApproved) {
          alert('Você já possui folga aprovada para esta data.');
          return;
      }

      onRequestOff(selectedRequestDate);
      setSelectedRequestDate('');
      alert('Solicitação enviada com sucesso!');
  };

  // --- WEEKLY SHIFT EDIT HANDLERS ---
  const handleShiftClick = (shift: WorkShift) => {
      if (!isAdmin) return;
      setEditingShift(shift);
      setEditStartTime(shift.startTime === '-' ? '09:00' : shift.startTime);
      setEditIsOff(shift.type === 'Off');
  };

  const handleSaveShift = () => {
      if (!editingShift) return;

      const updatedShifts = shifts.map(s => {
          if (s.id === editingShift.id) {
              return {
                  ...s,
                  startTime: editIsOff ? '-' : editStartTime,
                  endTime: '-', 
                  type: editIsOff ? 'Off' : 'Work' as const
              };
          }
          return s;
      });

      onUpdateShifts(updatedShifts);
      setEditingShift(null);
  };

  const getStatusColorClass = (type: string) => {
      switch (type) {
          case 'Work': return 'bg-blue-600 text-white border-blue-600';
          case 'SundayOff': return 'bg-purple-600 text-white border-purple-600';
          case 'Off': return 'bg-emerald-500 text-white border-emerald-500';
          case 'Vacation': return 'bg-orange-500 text-white border-orange-500';
          default: return 'bg-blue-600 text-white border-blue-600';
      }
  };

  const getStatusLabel = (type: string) => {
      switch (type) {
          case 'Work': return 'TRABALHO';
          case 'SundayOff': return 'FOLGA DOM';
          case 'Off': return 'FOLGA';
          case 'Vacation': return 'FÉRIAS';
          default: return 'TRABALHO';
      }
  };

  // Sort shifts starting from Thursday (Index 4)
  const dayOrder = [4, 5, 6, 0, 1, 2, 3];
  
  const sortedShifts = [...shifts].sort((a, b) => {
      return dayOrder.indexOf(a.dayIndex) - dayOrder.indexOf(b.dayIndex);
  });

  const today = new Date();
  const currentDayIndex = today.getDay(); 
  const distanceToThursday = (currentDayIndex + 7 - 4) % 7;
  const startOfWeekDate = new Date(today);
  startOfWeekDate.setDate(today.getDate() - distanceToThursday);

  // My Requests List
  const myRequests = requests.filter(r => r.userId === userId).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return (
    <div className="space-y-8 animate-fade-in relative">
       
       {/* EDIT SHIFT MODAL */}
       {editingShift && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-fade-in-up border border-slate-100">
                   <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center">
                           <Edit2 size={18} className="mr-2 text-blue-600" />
                           {editingShift.dayOfWeek}
                       </h3>
                       <button onClick={() => setEditingShift(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                           <X size={18} />
                       </button>
                   </div>
                   
                   <div className="p-6 space-y-6">
                       <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setEditIsOff(!editIsOff)}>
                           <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${editIsOff ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                               {editIsOff && <CheckCircle2 size={16} className="text-white" />}
                           </div>
                           <span className="text-sm font-bold text-slate-700">Fechado</span>
                       </div>

                       {!editIsOff && (
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Horário de Início</label>
                               <input 
                                   type="time" 
                                   value={editStartTime}
                                   onChange={(e) => setEditStartTime(e.target.value)}
                                   className="w-full px-4 py-4 bg-white border border-slate-300 rounded-2xl text-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-center font-mono font-bold text-slate-800"
                               />
                           </div>
                       )}

                       <button 
                           onClick={handleSaveShift}
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center transform active:scale-95"
                       >
                           <Save size={20} className="mr-2" />
                           Salvar
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* 1. Standard Weekly Schedule */}
       {isWeeklyScheduleEnabled && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={20} className={`text-${themeColor}-600`} />
                        Escala Padrão
                    </h3>
                    {isAdmin && (
                         <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-md hidden sm:inline-block">
                             Editar
                         </span>
                    )}
                </div>
                
                {/* Reduced Gap Here */}
                <div className="flex overflow-x-auto pb-4 gap-1 sm:justify-between no-scrollbar px-1">
                    {sortedShifts.map((shift, index) => {
                        const shiftDate = new Date(startOfWeekDate);
                        shiftDate.setDate(startOfWeekDate.getDate() + index);
                        
                        const isToday = shiftDate.toDateString() === today.toDateString();
                        const dateNumber = shiftDate.getDate();
                        const dayName = shiftDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

                        return (
                            <div 
                                key={shift.id} 
                                onClick={() => handleShiftClick(shift)}
                                className={`
                                    min-w-[65px] sm:min-w-[85px] h-[130px] rounded-[30px] p-2 flex flex-col items-center justify-between transition-all duration-300 border relative group select-none
                                    ${isAdmin ? 'cursor-pointer' : ''}
                                    ${isToday 
                                        ? `bg-${themeColor}-500 border-${themeColor}-500 text-white shadow-xl shadow-${themeColor}-200 scale-105 z-10` 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <div className="mt-3 flex flex-col items-center">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'opacity-80' : 'text-slate-400'}`}>
                                        {dayName}
                                    </span>
                                    <span className={`text-xl font-bold ${isToday ? 'text-white' : 'text-slate-800'}`}>
                                        {dateNumber}
                                    </span>
                                </div>

                                <div className={`
                                    mb-2 px-1 w-full text-center rounded-[20px] text-[11px] font-bold uppercase tracking-wide
                                    ${isToday 
                                        ? 'text-white' 
                                        : 'text-slate-700'
                                    }
                                `}>
                                    {shift.type === 'Off' ? 'Folga' : shift.startTime}
                                </div>

                                {isAdmin && (
                                    <div className="absolute inset-0 rounded-[30px] bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white p-2 rounded-full shadow-sm">
                                            <Edit2 size={12} className="text-slate-800" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

       {/* 2. SUNDAY REQUEST SECTION (Employee Only) */}
       {(!isAdmin && isSundayOffEnabled) && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Request Form */}
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                   <div className="flex items-center gap-2 mb-4">
                       <div className={`p-2 rounded-lg bg-${themeColor}-50`}>
                           <Calendar size={18} className={`text-${themeColor}-600`} />
                       </div>
                       <h3 className="font-bold text-slate-800 text-sm">Solicitar Folga Dominical</h3>
                   </div>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selecione o Domingo</label>
                           <select 
                                value={selectedRequestDate}
                                onChange={(e) => setSelectedRequestDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 cursor-pointer"
                           >
                               <option value="">Selecione uma data...</option>
                               {availableSundays.map((date) => {
                                   const dateStr = date.toISOString().split('T')[0];
                                   const display = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                   // Check if status exists
                                   const existing = requests.find(r => r.fullDate === dateStr && r.userId === userId && r.status !== 'rejected');
                                   const label = existing ? `${display} (${existing.status === 'pending' ? 'Pendente' : 'Aprovado'})` : display;
                                   
                                   return (
                                       <option key={dateStr} value={dateStr} disabled={!!existing}>
                                           {label}
                                       </option>
                                   );
                               })}
                           </select>
                       </div>

                       <button 
                            onClick={handleSubmitRequest}
                            disabled={!selectedRequestDate}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md
                                ${selectedRequestDate ? `bg-${themeColor}-600 hover:bg-${themeColor}-700` : 'bg-slate-300 cursor-not-allowed shadow-none'}
                            `}
                       >
                           <Send size={16} />
                           Enviar Solicitação
                       </button>
                   </div>
               </div>

               {/* My Requests List */}
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                   <h3 className="font-bold text-slate-800 text-sm mb-4">Minhas Solicitações</h3>
                   
                   <div className="flex-1 overflow-y-auto max-h-[160px] pr-1 space-y-2 custom-scrollbar">
                       {myRequests.length === 0 ? (
                           <p className="text-xs text-slate-400 text-center py-4 italic">Nenhuma solicitação recente.</p>
                       ) : (
                           myRequests.map(req => (
                               <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                   <div className="flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                                            <Calendar size={14} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-700">{req.date}</span>
                                            <span className="block text-[9px] text-slate-400">Enviado em {req.requestDate}</span>
                                        </div>
                                   </div>
                                   <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                          req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                                   `}>
                                       {req.status === 'pending' ? 'Pendente' : req.status === 'approved' ? 'Aprovada' : 'Recusada'}
                                   </span>
                               </div>
                           ))
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* 3. Monthly Calendar Header */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-8">
         <div>
            {/* User Info Header */}
            {currentUserObj && (
                <div className="flex items-center gap-2 mb-1">
                    <UserIcon size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {currentUserObj.name} • {currentUserObj.jobTitle || 'Funcionário'}
                    </span>
                </div>
            )}
            <h2 className="text-xl font-bold text-slate-800">Escala Mensal</h2>
            <p className="text-sm text-slate-500">
                {isAdmin 
                    ? 'Clique nos dias para alternar status.' 
                    : 'Visualize seus horários.'}
            </p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
             <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto justify-between">
                 <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronLeft size={20} className="text-slate-500" /></button>
                 <span className="font-bold text-slate-700 w-32 text-center select-none capitalize">
                     {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight size={20} className="text-slate-500" /></button>
             </div>

             {/* PUBLISH BUTTON (Admin Only) */}
             {isAdmin && (
                <button
                    onClick={() => onTogglePublish(monthKey)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto shadow-sm border ${
                    isPublished 
                        ? 'bg-white text-green-600 border-green-200 hover:bg-green-50'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {isPublished ? (
                    <>
                        <CheckCircle2 size={16} className="text-green-600" />
                        Publicado
                    </>
                    ) : (
                    <>
                        <AlertCircle size={16} className="text-slate-400" />
                        Rascunho
                    </>
                    )}
                </button>
             )}
         </div>
       </div>

        {/* 4. Calendar Content or Lock Logic */}
        {!isAdmin && !isPublished ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className={`bg-${themeColor}-50 p-6 rounded-full mb-6`}>
                    <Lock size={48} className={`text-${themeColor}-300`} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Escala em Definição</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                A escala para <span className="font-bold text-slate-700">{currentDate.toLocaleDateString('pt-BR', { month: 'long' })}</span> ainda está sendo ajustada pela gerência. 
                Você receberá uma notificação assim que estiver disponível.
                </p>
            </div>
        ) : (
            <>
                {/* Monthly Calendar View */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6">
                        <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                <div key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2 sm:gap-3">
                            {/* Empty slots for previous month */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[110px] bg-slate-50/30 rounded-xl"></div>
                            ))}
                            
                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const reqDateStr = formatRequestDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                                
                                const userSchedule = dailySchedules.find(s => s.date === dateStr && s.userId === userId);
                                
                                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const dayOfWeek = dayDate.getDay();
                                const weekDayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();

                                const hasPendingRequest = requests.some(r => (r.fullDate === dateStr || r.date === reqDateStr) && (isAdmin || r.userId === userId) && r.status === 'pending');

                                // Default Styling - Start with WORK (Blue) as default for everyone
                                let cellClass = getStatusColorClass('Work');
                                let statusText = 'TRABALHO';
                                
                                if (userSchedule) {
                                    // Use explicit override if exists
                                    cellClass = getStatusColorClass(userSchedule.type);
                                    statusText = getStatusLabel(userSchedule.type);
                                } 

                                return (
                                    <div 
                                        key={day} 
                                        onClick={() => handleDayClick(day)}
                                        className={`
                                            min-h-[80px] sm:min-h-[110px] rounded-xl p-2 sm:p-3 transition-all relative group flex flex-col border shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02]
                                            ${cellClass}
                                            ${hasPendingRequest ? 'ring-2 ring-yellow-400 border-yellow-400 z-10' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1 text-[10px] sm:text-xs font-bold opacity-90">
                                            <span className="uppercase">{weekDayName}</span>
                                            <span>{day}</span>
                                        </div>
                                        
                                        <div className="flex-1 flex items-center justify-center flex-col overflow-hidden">
                                            <span className="font-bold text-[10px] sm:text-xs tracking-wide uppercase text-center break-words w-full">
                                                {hasPendingRequest ? 'SOLICITADO' : statusText}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Legend */}
                    <div className="bg-slate-50 border-t border-slate-100 p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span>Trabalho</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600"></span>Folga Dom</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Folga Semanal</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span>Férias</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-transparent border-2 border-yellow-400"></span>Solicitação Pendente</div>
                            </div>
                            
                            <div className="hidden sm:flex items-center text-slate-400 text-xs">
                                <MousePointer2 size={12} className="mr-1.5" />
                                {isAdmin ? 'Clique para alternar status' : 'Visualize sua escala'}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Requests Section (Admin) */}
        {isAdmin && requests.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle size={20} className="text-orange-500" />
                        Solicitações Pendentes
                    </h3>
                </div>
                <div className="space-y-3">
                    {requests.map(req => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm text-sm">
                                     {req.userName.substring(0,2).toUpperCase()}
                                 </div>
                                 <div>
                                     <p className="font-bold text-slate-800">{req.userName}</p>
                                     <p className="text-sm text-slate-500">Solicitou folga para <span className="font-bold text-slate-700">{req.date}</span></p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2 self-end sm:self-auto">
                                 {req.status === 'pending' ? (
                                     <>
                                         <button 
                                            onClick={() => onResolveRequest(req.id, 'approved')}
                                            className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                         >
                                             Aprovar
                                         </button>
                                         <button 
                                            onClick={() => onResolveRequest(req.id, 'rejected')}
                                            className="px-4 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
                                         >
                                             Recusar
                                         </button>
                                     </>
                                 ) : (
                                     <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                         {req.status === 'approved' ? 'Aprovado' : 'Recusado'}
                                     </span>
                                 )}
                                 <button onClick={() => onDeleteRequest(req.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
