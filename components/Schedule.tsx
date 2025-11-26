
import React, { useState } from 'react';
import { WorkShift, DailySchedule, ThemeColor, UserRole, User, OffRequest } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, Lock, MousePointer2, Trash2, Edit2, X, Save } from 'lucide-react';

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
  const [editEndTime, setEditEndTime] = useState('');
  const [editIsOff, setEditIsOff] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

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

  const getDaySchedules = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dailySchedules.filter(s => s.date === dateStr);
  };
  
  const formatRequestDate = (day: number) => {
      return `${String(day).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleDayClick = (day: number) => {
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSunday = dateObj.getDay() === 0;
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Admin Toggle Logic
      if (isAdmin) {
          // Find specific schedule for the current user context (userId)
          // We default to "Work" if nothing exists.
          const existingSchedule = dailySchedules.find(s => s.date === dateStr && s.userId === userId);
          const currentType = existingSchedule ? existingSchedule.type : 'Work';

          let nextType: 'Work' | 'Off' | 'Vacation' | 'SundayOff' = 'Work';

          // Cycle: Work -> Off -> Vacation -> (SundayOff if Sunday) -> Work
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

      // Request Off Logic for Employees on Sundays
      if (!isAdmin && isSunday && isSundayOffEnabled) {
          const reqDate = formatRequestDate(day);
          const hasPending = requests.some(r => r.date === reqDate && r.userId === userId && r.status === 'pending');
          
          if (hasPending) {
              alert('Você já tem uma solicitação pendente para este dia.');
              return;
          }

          if (window.confirm(`Deseja solicitar folga para o domingo dia ${reqDate}?`)) {
              onRequestOff(reqDate);
          }
      }
  };

  // --- WEEKLY SHIFT EDIT HANDLERS ---
  const handleShiftClick = (shift: WorkShift) => {
      if (!isAdmin) return;
      setEditingShift(shift);
      setEditStartTime(shift.startTime === '-' ? '09:00' : shift.startTime);
      setEditEndTime(shift.endTime === '-' ? '18:00' : shift.endTime);
      setEditIsOff(shift.type === 'Off');
  };

  const handleSaveShift = () => {
      if (!editingShift) return;

      const updatedShifts = shifts.map(s => {
          if (s.id === editingShift.id) {
              return {
                  ...s,
                  startTime: editIsOff ? '-' : editStartTime,
                  endTime: editIsOff ? '-' : editEndTime,
                  type: editIsOff ? 'Off' : 'Work' as const // Type assertion needed or ensure type matches
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
          default: return 'bg-blue-600 text-white border-blue-600'; // Default Work
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
  // Standard Index: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Desired Order: Thu, Fri, Sat, Sun, Mon, Tue, Wed
  const dayOrder = [4, 5, 6, 0, 1, 2, 3];
  
  const sortedShifts = [...shifts].sort((a, b) => {
      return dayOrder.indexOf(a.dayIndex) - dayOrder.indexOf(b.dayIndex);
  });

  // Calculate Dates for the Weekly Schedule (Relative to Today)
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 (Sun) to 6 (Sat)
  // We want the cycle to start on Thursday (4).
  // Find the most recent Thursday (or today if today is Thursday)
  const distanceToThursday = (currentDayIndex + 7 - 4) % 7;
  const startOfWeekDate = new Date(today);
  startOfWeekDate.setDate(today.getDate() - distanceToThursday);

  return (
    <div className="space-y-8 animate-fade-in relative">
       
       {/* EDIT SHIFT MODAL */}
       {editingShift && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-slate-100">
                   <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center">
                           <Edit2 size={18} className="mr-2 text-blue-600" />
                           Editar {editingShift.dayOfWeek}
                       </h3>
                       <button onClick={() => setEditingShift(null)} className="text-slate-400 hover:text-slate-600">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="p-6 space-y-4">
                       <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer" onClick={() => setEditIsOff(!editIsOff)}>
                           <div className={`w-5 h-5 rounded border flex items-center justify-center ${editIsOff ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                               {editIsOff && <CheckCircle2 size={14} className="text-white" />}
                           </div>
                           <span className="text-sm font-bold text-slate-700">Marcar como Folga</span>
                       </div>

                       {!editIsOff && (
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Início</label>
                                   <input 
                                       type="time" 
                                       value={editStartTime}
                                       onChange={(e) => setEditStartTime(e.target.value)}
                                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono font-bold"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Término</label>
                                   <input 
                                       type="time" 
                                       value={editEndTime}
                                       onChange={(e) => setEditEndTime(e.target.value)}
                                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono font-bold"
                                   />
                               </div>
                           </div>
                       )}

                       <button 
                           onClick={handleSaveShift}
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center mt-2"
                       >
                           <Save size={18} className="mr-2" />
                           Salvar Alterações
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* 1. Standard Weekly Schedule - RE-STYLED CAPSULE FORMAT */}
       {isWeeklyScheduleEnabled && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={20} className={`text-${themeColor}-600`} />
                        Escala Padrão Semanal
                    </h3>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                             <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-md hidden sm:inline-block">
                                 Clique para editar
                             </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                            Semana de {startOfWeekDate.toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}
                        </span>
                    </div>
                </div>
                
                <div className="flex overflow-x-auto pb-4 gap-3 sm:justify-between no-scrollbar">
                    {sortedShifts.map((shift, index) => {
                        // Calculate specific date for this card
                        const shiftDate = new Date(startOfWeekDate);
                        shiftDate.setDate(startOfWeekDate.getDate() + index);
                        
                        const isToday = shiftDate.toDateString() === today.toDateString();
                        const dateNumber = shiftDate.getDate();
                        // Get 3-letter day name
                        const dayName = shiftDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

                        return (
                            <div 
                                key={shift.id} 
                                onClick={() => handleShiftClick(shift)}
                                className={`
                                    min-w-[80px] sm:min-w-[100px] flex-1 rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 border relative group
                                    ${isAdmin ? 'cursor-pointer' : ''}
                                    ${isToday 
                                        ? `bg-${themeColor}-500 border-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-200 scale-105` 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {/* Edit Hint for Admin */}
                                {isAdmin && (
                                    <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${isToday ? 'text-white/80' : 'text-slate-300'}`}>
                                        <Edit2 size={12} />
                                    </div>
                                )}

                                {/* Day Name (Mon, Tue) */}
                                <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'opacity-80' : 'text-slate-400'}`}>
                                    {dayName}
                                </span>
                                
                                {/* Date Number */}
                                <span className={`text-2xl sm:text-3xl font-bold ${isToday ? 'text-white' : 'text-slate-700'}`}>
                                    {dateNumber}
                                </span>

                                {/* Content: Start Time or OFF */}
                                <div className={`mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isToday ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    {shift.type === 'Off' ? 'Folga' : shift.startTime}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

       {/* 2. Monthly Calendar Header */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-8">
         <div>
            <h2 className="text-xl font-bold text-slate-800">Escala Mensal</h2>
            <p className="text-sm text-slate-500">
                {isAdmin 
                    ? 'Clique nos dias para alternar: Trabalho > Folga > Férias > Folga Dom.' 
                    : 'Visualize seus horários e folgas do mês.'}
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

        {/* 3. Calendar Content or Lock Logic */}
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
                                const schedules = getDaySchedules(day);
                                // For admin, show current user context (userId) toggle status to allow editing "their" view or the main view logic
                                const userSchedule = dailySchedules.find(s => s.date === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` && s.userId === userId);
                                
                                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const dayOfWeek = dayDate.getDay();
                                const isSunday = dayOfWeek === 0;
                                const weekDayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();

                                // Check for pending request to highlight
                                const reqDateStr = formatRequestDate(day);
                                const hasPendingRequest = requests.some(r => r.date === reqDateStr && (isAdmin || r.userId === userId) && r.status === 'pending');

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
                                                {statusText}
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
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600"></span>Folga Domingo</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Folga Semanal</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span>Férias</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-transparent border-2 border-yellow-400"></span>Solicitação Pendente</div>
                            </div>
                            
                            <div className="hidden sm:flex items-center text-slate-400 text-xs">
                                <MousePointer2 size={12} className="mr-1.5" />
                                {isAdmin ? 'Clique para alternar status' : 'Arraste para ver completo'}
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
