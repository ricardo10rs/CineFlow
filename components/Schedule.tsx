
import React, { useState, useMemo } from 'react';
import { WorkShift, DailySchedule, ThemeColor, UserRole, User, OffRequest } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, Lock, MousePointer2, Trash2, Edit2, X, Save, User as UserIcon, Send, Search, Eye, EyeOff } from 'lucide-react';

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
  onUpdateDailySchedule,
  onToggleUserWeeklySchedule
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Admin View State: Which user is the admin currently editing?
  const [viewUserId, setViewUserId] = useState(userId);

  // Edit Weekly Schedule States
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editIsOff, setEditIsOff] = useState(false);

  // Request Off State
  const [selectedRequestDate, setSelectedRequestDate] = useState('');

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  
  // The user currently being viewed in the calendar (Effective User)
  // If not admin, force viewUserId to be the logged-in userId
  const effectiveUserId = isAdmin ? viewUserId : userId;
  const effectiveUserObj = users.find(u => u.id === effectiveUserId);

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
          const existingSchedule = dailySchedules.find(s => s.date === dateStr && s.userId === effectiveUserId);
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
                  nextType = 'Work'; // Back to start (skip SundayOff for non-Sundays)
              }
          } else if (currentType === 'SundayOff') {
              nextType = 'Work';
          }

          const newSchedule: DailySchedule = {
              id: existingSchedule ? existingSchedule.id : Date.now().toString(),
              userId: effectiveUserId, // Edit the SELECTED user, not necessarily the logged in admin
              date: dateStr,
              type: nextType
          };

          onUpdateDailySchedule(newSchedule);
          return;
      }
  };

  // --- SUNDAY REQUEST LOGIC (Next Month Only) ---
  const getNextMonthSundays = () => {
      const dates: Date[] = [];
      const today = new Date();
      
      // Set to 1st day of next month
      const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthIndex = nextMonthDate.getMonth();
      
      let d = new Date(nextMonthDate);

      // Iterate through the entire next month
      while (d.getMonth() === nextMonthIndex) {
          if (d.getDay() === 0) { // If Sunday
              dates.push(new Date(d));
          }
          d.setDate(d.getDate() + 1);
      }
      return dates;
  };

  const availableSundays = getNextMonthSundays();
  
  // Get name of next month for display
  const nextMonthObj = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  const nextMonthName = nextMonthObj.toLocaleDateString('pt-BR', { month: 'long' });
  const nextMonthYear = nextMonthObj.getFullYear();
  const nextMonthIndexOneBased = nextMonthObj.getMonth() + 1; // 1-12

  const handleSubmitRequest = () => {
      if (!selectedRequestDate) return;
      
      // Check duplicate for SPECIFIC DATE
      const hasPendingSameDate = requests.some(r => r.fullDate === selectedRequestDate && r.userId === userId && r.status !== 'rejected');
      const isApprovedSameDate = dailySchedules.some(s => s.date === selectedRequestDate && s.userId === userId && s.type === 'SundayOff');

      if (hasPendingSameDate) {
          alert('Você já possui uma solicitação para esta data.');
          return;
      }
      if (isApprovedSameDate) {
          alert('Você já possui folga aprovada para esta data.');
          return;
      }

      // Check limit: ONE request per month
      const [selYear, selMonth] = selectedRequestDate.split('-').map(Number);
      const hasActiveRequestInMonth = requests.some(r => {
          if (r.userId !== userId || r.status === 'rejected') return false;
          // Parse the request date
          if (!r.fullDate) return false;
          const [rYear, rMonth] = r.fullDate.split('-').map(Number);
          return rYear === selYear && rMonth === selMonth;
      });

      if (hasActiveRequestInMonth) {
          alert('Não é possível enviar mais de uma solicitação de folga dominical por mês.');
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
          // Dynamic Work Color based on theme
          case 'Work': return `bg-${themeColor}-600 text-white border-${themeColor}-600`;
          case 'SundayOff': return 'bg-purple-600 text-white border-purple-600';
          case 'Off': return 'bg-emerald-500 text-white border-emerald-500';
          case 'Vacation': return 'bg-orange-500 text-white border-orange-500';
          default: return `bg-${themeColor}-600 text-white border-${themeColor}-600`;
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

  // Check if user has already used their request for NEXT month
  const hasActiveRequestForNextMonth = myRequests.some(r => {
      if (r.status === 'rejected' || !r.fullDate) return false;
      const [rYear, rMonth] = r.fullDate.split('-').map(Number);
      return rYear === nextMonthYear && rMonth === nextMonthIndexOneBased;
  });

  // Helper to filter users for the dropdown (exclude super_admin if logged in as regular admin if desired, or show all)
  const selectableUsers = users.filter(u => u.role !== 'super_admin');

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
       {/* Always visible to Admin. For employees, check setting and individual hide flag. */}
       {(isAdmin || (isWeeklyScheduleEnabled && !effectiveUserObj?.hideWeeklySchedule)) && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Clock size={20} className={`text-${themeColor}-600`} />
                        Escala da Semana
                    </h3>
                </div>
                
                {/* Fluid, Rounded, Tighter Layout */}
                <div className="flex overflow-x-auto pb-4 gap-2 sm:gap-3 justify-between sm:justify-center no-scrollbar px-2">
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
                                    min-w-[55px] sm:min-w-[75px] h-[130px] rounded-[30px] p-2 flex flex-col items-center justify-between transition-all duration-300 relative select-none
                                    ${isAdmin ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}
                                    ${isToday 
                                        ? `bg-gradient-to-b from-${themeColor}-500 to-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-200/50 scale-105 z-10 border-0` 
                                        : 'bg-white border border-slate-100 text-slate-500 shadow-sm'
                                    }
                                `}
                            >
                                {/* Top: Day Name */}
                                <div className="mt-2 flex flex-col items-center leading-none gap-1">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isToday ? 'opacity-90' : 'text-slate-400'}`}>
                                        {dayName}
                                    </span>
                                    <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-slate-700'}`}>
                                        {dateNumber}
                                    </span>
                                </div>

                                {/* Middle: Visual Spacer / Divider */}
                                <div className={`w-4 h-0.5 rounded-full ${isToday ? 'bg-white/30' : 'bg-slate-100'}`}></div>

                                {/* Bottom: Time (Main Focus) */}
                                <div className={`
                                    mb-3 w-full text-center flex flex-col items-center justify-center
                                    ${isToday ? 'text-white' : 'text-slate-800'}
                                `}>
                                    {shift.type === 'Off' ? (
                                        <span className="text-[9px] font-black uppercase tracking-tight opacity-70">
                                            Fechado
                                        </span>
                                    ) : (
                                        <span className="text-xl font-black tracking-tighter leading-none">
                                            {shift.startTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

       {/* 2. Monthly Calendar Header */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-8">
         <div className="w-full md:w-auto">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Escala Mensal
                {isAdmin && (
                    <div className="ml-2 flex items-center gap-2">
                         <div className="relative group">
                            <select
                                value={viewUserId}
                                onChange={(e) => setViewUserId(e.target.value)}
                                className="appearance-none bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value={userId}>Minha Escala</option>
                                {selectableUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-blue-500">
                                <ChevronRight size={14} className="rotate-90" />
                            </div>
                         </div>
                         
                         {/* Toggle Weekly Schedule Visibility for Specific User */}
                         <button 
                            onClick={() => onToggleUserWeeklySchedule(viewUserId)}
                            className={`p-1.5 rounded-lg border transition-all ${effectiveUserObj?.hideWeeklySchedule ? 'bg-slate-100 text-slate-400 border-slate-200' : `bg-${themeColor}-100 text-${themeColor}-600 border-${themeColor}-200`}`}
                            title={effectiveUserObj?.hideWeeklySchedule ? "Exibir escala semanal para este usuário" : "Ocultar escala semanal para este usuário"}
                         >
                            {effectiveUserObj?.hideWeeklySchedule ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                    </div>
                )}
            </h2>
            
            {/* Display Selected User Info for Admin */}
            {effectiveUserObj && isAdmin && (
                 <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                     <UserIcon size={12} />
                     <span>Editando: <span className="font-bold text-slate-700">{effectiveUserObj.name}</span></span>
                 </div>
            )}
            {!isAdmin && <p className="text-sm text-slate-500">Visualize seus horários.</p>}
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Escala em Processamento pelo Administrador</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                O Administrador está realizando os ajustes finais na escala de <span className="font-bold text-slate-700">{currentDate.toLocaleDateString('pt-BR', { month: 'long' })}</span>. A visualização estará disponível em breve.
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
                                
                                // Lookup schedule for the EFFECTIVE user (Admin selected or logged in user)
                                const userSchedule = dailySchedules.find(s => s.date === dateStr && s.userId === effectiveUserId);
                                
                                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const dayOfWeek = dayDate.getDay();
                                const weekDayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();

                                // Check pending requests for the EFFECTIVE user
                                const hasPendingRequest = requests.some(r => (r.fullDate === dateStr || r.date === reqDateStr) && r.userId === effectiveUserId && r.status === 'pending');

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
                                <div className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full bg-${themeColor}-600`}></span>Trabalho</div>
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

        {/* 4. SUNDAY REQUEST SECTION (Employee Only) - MOVED BELOW CALENDAR */}
       {(!isAdmin && isSundayOffEnabled) && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-slate-100 pt-8">
               {/* Request Form */}
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                   <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg bg-${themeColor}-50`}>
                                <Calendar size={18} className={`text-${themeColor}-600`} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm capitalize">Folga Dominical ({nextMonthName})</h3>
                        </div>
                        {/* AVAILABILITY INDICATOR */}
                        {!hasActiveRequestForNextMonth ? (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full border border-green-200 animate-pulse">
                                Disponível
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                                Enviado
                            </span>
                        )}
                   </div>
                   
                   {!hasActiveRequestForNextMonth && (
                       <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                           As solicitações para <strong className="text-slate-700 capitalize">{nextMonthName}</strong> estão abertas. Você pode escolher 1 domingo de folga.
                       </p>
                   )}
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selecione o Domingo</label>
                           <select 
                                value={selectedRequestDate}
                                onChange={(e) => setSelectedRequestDate(e.target.value)}
                                disabled={hasActiveRequestForNextMonth}
                                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 cursor-pointer ${hasActiveRequestForNextMonth ? 'opacity-50 cursor-not-allowed' : ''}`}
                           >
                               <option value="">{hasActiveRequestForNextMonth ? 'Solicitação já realizada' : 'Selecione uma data...'}</option>
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
                           {availableSundays.length === 0 && (
                               <p className="text-[10px] text-orange-500 mt-1">Não há domingos disponíveis no próximo mês.</p>
                           )}
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
