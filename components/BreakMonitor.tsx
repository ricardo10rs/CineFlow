
import React, { useState, useEffect } from 'react';
import { BreakSession, ThemeColor } from '../types';
import { Clock, Timer, AlertCircle, CheckCircle2, History, Calendar, ArrowRight, BellRing } from 'lucide-react';

interface BreakMonitorProps {
  activeBreaks: BreakSession[];
  themeColor: ThemeColor;
  breakHistory?: BreakSession[];
  onNotifyLate?: (userId: string, userName: string) => void; // New prop for manual notification
}

export const BreakMonitor: React.FC<BreakMonitorProps> = ({ activeBreaks, themeColor, breakHistory = [], onNotifyLate }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000); // Update every second to keep timers live
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(Math.abs(totalSeconds) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    return `${totalSeconds < 0 ? '-' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (start: number, durationSec: number) => {
    const elapsedSec = (now - start) / 1000;
    const progress = (elapsedSec / durationSec) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Group history by date string
  const getHistoryGroups = () => {
      const groups: Record<string, BreakSession[]> = {};
      
      breakHistory.forEach(session => {
          if (!session.completedAt) return;
          const date = new Date(session.startTime);
          const dateKey = date.toLocaleDateString('pt-BR'); // DD/MM/YYYY
          
          if (!groups[dateKey]) {
              groups[dateKey] = [];
          }
          groups[dateKey].push(session);
      });

      // Sort sessions within each group by start time (ascending)
      Object.keys(groups).forEach(key => {
          groups[key].sort((a, b) => a.startTime - b.startTime);
      });

      return groups;
  };

  const historyGroups = getHistoryGroups();
  
  // Sort date keys (Newest/Yesterday first)
  const sortedDateKeys = Object.keys(historyGroups).sort((a, b) => {
      // Convert DD/MM/YYYY back to Date object for sorting
      const [da, ma, ya] = a.split('/').map(Number);
      const [db, mb, yb] = b.split('/').map(Number);
      const dateA = new Date(ya, ma - 1, da);
      const dateB = new Date(yb, mb - 1, db);
      return dateB.getTime() - dateA.getTime();
  });

  const getDateLabel = (dateKey: string) => {
      const today = new Date().toLocaleDateString('pt-BR');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('pt-BR');

      if (dateKey === today) return `Hoje - ${dateKey}`;
      if (dateKey === yesterdayStr) return `Ontem - ${dateKey}`;
      return dateKey;
  };

  const handleNotifyClick = (session: BreakSession) => {
    if (onNotifyLate) {
        // Confirmation before sending
        if(window.confirm(`Enviar notificação de atraso para ${session.userName}?`)) {
            onNotifyLate(session.userId, session.userName);
        }
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* ACTIVE BREAKS SECTION */}
      <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Monitoramento de Intervalos</h2>
            <p className="text-sm text-slate-500">Acompanhe em tempo real quem está em horário de descanso hoje.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBreaks.length === 0 ? (
               <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                   <div className="bg-slate-50 p-4 rounded-full mb-4">
                       <Clock size={32} className="text-slate-400" />
                   </div>
                   <p className="text-slate-500 font-medium">Nenhum funcionário em intervalo no momento.</p>
               </div>
            ) : (
               activeBreaks.map(session => {
                   const elapsed = now - session.startTime;
                   const totalDurationMs = session.duration * 1000;
                   const remaining = totalDurationMs - elapsed;
                   const isOverdue = remaining < 0;
                   const progress = calculateProgress(session.startTime, session.duration);

                   const startTimeStr = new Date(session.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                   const endTimeStr = new Date(session.startTime + totalDurationMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                   return (
                       <div key={session.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${isOverdue ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}`}>
                           <div className="flex justify-between items-start mb-4">
                               <div className="flex items-center space-x-3">
                                   <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-200">
                                       {session.userAvatar.length > 5 ? (
                                           <img src={session.userAvatar} alt={session.userName} className="w-full h-full object-cover" />
                                       ) : session.userAvatar}
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-slate-800 text-sm">{session.userName}</h3>
                                       <p className="text-xs text-slate-500">Saiu às {startTimeStr}</p>
                                   </div>
                               </div>
                               <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center ${isOverdue ? 'bg-red-50 text-red-600' : `bg-${themeColor}-50 text-${themeColor}-600`}`}>
                                   {isOverdue ? <AlertCircle size={14} className="mr-1" /> : <Timer size={14} className="mr-1" />}
                                   {isOverdue ? 'Atrasado' : 'Em andamento'}
                               </div>
                           </div>

                           <div className="mb-2 flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                               <span>Retorno: {endTimeStr}</span>
                               <span className={isOverdue ? 'text-red-500' : `text-${themeColor}-600`}>
                                   {isOverdue ? `+ ${formatTime(Math.abs(remaining))}` : formatTime(remaining)}
                               </span>
                           </div>

                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                               <div 
                                   className={`h-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : `bg-${themeColor}-500`}`}
                                   style={{ width: `${isOverdue ? 100 : progress}%` }}
                               />
                           </div>
                           
                           {isOverdue && (
                               <div className="flex gap-2">
                                    <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg text-center font-medium flex-1">
                                        Atrasado: {Math.floor(Math.abs(remaining) / 60000)} min
                                    </div>
                                    <button 
                                        onClick={() => handleNotifyClick(session)}
                                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-md shadow-red-200"
                                        title="Enviar notificação de atraso"
                                    >
                                        <BellRing size={16} />
                                    </button>
                               </div>
                           )}
                       </div>
                   );
               })
            )}
          </div>
      </section>

      {/* HISTORY SECTION */}
      <section className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-6">
             <History size={20} className="text-slate-400" />
             <h3 className="text-lg font-bold text-slate-700">Histórico Recente</h3>
          </div>
          
          <div className="space-y-8">
             {sortedDateKeys.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                     Nenhum registro de intervalo recente (últimas 48h).
                 </div>
             ) : (
                 sortedDateKeys.map(dateKey => (
                    <div key={dateKey} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center">
                            <Calendar size={14} className="mr-2 text-slate-400" />
                            <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">{getDateLabel(dateKey)}</h4>
                        </div>
                        
                        {/* MOBILE VIEW (CARD LIST) */}
                        <div className="block md:hidden">
                            <div className="divide-y divide-slate-50">
                                {historyGroups[dateKey].map((session, index) => {
                                    const start = new Date(session.startTime);
                                    const end = session.completedAt ? new Date(session.completedAt) : null;
                                    
                                    const startStr = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                    const endStr = end ? end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
                                    
                                    let durationStr = '60 min';
                                    if (end) {
                                        const diffMins = Math.floor((end.getTime() - start.getTime()) / 60000);
                                        durationStr = `${diffMins} min`;
                                    }

                                    return (
                                        <div key={session.id} className="p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-xs font-mono text-slate-300 w-4">{index + 1}</span>
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                                        {session.userAvatar.length > 5 ? (
                                                            <img src={session.userAvatar} alt="" className="w-full h-full object-cover" />
                                                        ) : session.userAvatar}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm">{session.userName}</span>
                                                </div>
                                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                                    {durationStr}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 uppercase text-[10px] font-bold mb-1">Saída</span>
                                                    <span className="font-mono text-slate-600 font-medium">{startStr}</span>
                                                </div>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <div className="flex flex-col text-right">
                                                    <span className="text-slate-400 uppercase text-[10px] font-bold mb-1">Retorno</span>
                                                    <span className="font-mono text-slate-600 font-medium">{endStr}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* DESKTOP VIEW (TABLE) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-400 font-medium text-xs border-b border-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 font-normal pl-8">#</th>
                                        <th className="px-6 py-3 font-normal">Funcionário</th>
                                        <th className="px-6 py-3 font-normal">Saída</th>
                                        <th className="px-6 py-3 font-normal">Retorno</th>
                                        <th className="px-6 py-3 font-normal text-right pr-8">Duração</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {historyGroups[dateKey].map((session, index) => {
                                        const start = new Date(session.startTime);
                                        const end = session.completedAt ? new Date(session.completedAt) : null;
                                        
                                        const startStr = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                        const endStr = end ? end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
                                        
                                        let durationStr = '60 min';
                                        if (end) {
                                            const diffMins = Math.floor((end.getTime() - start.getTime()) / 60000);
                                            durationStr = `${diffMins} min`;
                                        }

                                        return (
                                            <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-slate-300 pl-8">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                                            {session.userAvatar.length > 5 ? (
                                                                <img src={session.userAvatar} alt="" className="w-full h-full object-cover" />
                                                            ) : session.userAvatar}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{session.userName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{startStr}</td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{endStr}</td>
                                                <td className="px-6 py-4 text-right pr-8">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                                        {durationStr}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 ))
             )}
          </div>
      </section>
    </div>
  );
};
