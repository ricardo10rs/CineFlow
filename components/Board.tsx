
import React, { useState, useEffect, useRef } from 'react';
import { ThemeColor, BreakSession } from '../types';
import { Play, RotateCcw, Clock, Utensils, Coffee, Sun, ChevronRight, Watch } from 'lucide-react';

interface BoardProps {
  themeColor: ThemeColor;
  activeBreak: BreakSession | undefined;
  onStartBreak: (startTime: number) => void;
  onEndBreak: () => void;
  onNotify: (msg: string, type: 'sms' | 'email') => void;
}

export const Board: React.FC<BoardProps> = ({ themeColor, activeBreak, onStartBreak, onEndBreak, onNotify }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Constants
  const ONE_HOUR_SECONDS = 60 * 60;

  // Timer States
  const [timeLeft, setTimeLeft] = useState(ONE_HOUR_SECONDS); 
  const [manualStartTime, setManualStartTime] = useState('');

  // Determine if active based on global props or local state logic
  const isActive = !!activeBreak;

  const hasWarnedOneMinute = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60); // Update date/time every minute
    return () => clearInterval(timer);
  }, []);

  // Sync with global active break
  useEffect(() => {
      if (activeBreak) {
          // Calculate time left based on the GLOBAL start time
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - activeBreak.startTime) / 1000);
          const remaining = ONE_HOUR_SECONDS - elapsedSeconds;
          setTimeLeft(remaining > 0 ? remaining : 0);
      } else {
          // Reset if no active break
          setTimeLeft(ONE_HOUR_SECONDS);
          hasWarnedOneMinute.current = false;
      }
  }, [activeBreak]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > -9999) { 
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } 

    return () => clearInterval(interval);
  }, [isActive]);

  // 1-Minute Warning Logic
  useEffect(() => {
    if (isActive && timeLeft <= 60 && timeLeft > 0 && !hasWarnedOneMinute.current) {
        onNotify('Falta 1 minuto para o retorno do intervalo.', 'sms');
        hasWarnedOneMinute.current = true;
    }
  }, [timeLeft, isActive, onNotify]);


  const handleStartNow = () => {
      const now = Date.now();
      const timeString = new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setManualStartTime(timeString);
      onStartBreak(now); // Notify Parent/Global State
  };

  const handleManualStartSubmit = () => {
    if (!manualStartTime) return;

    const [hours, mins] = manualStartTime.split(':').map(Number);
    const now = new Date();
    const startTime = new Date();
    startTime.setHours(hours, mins, 0, 0);

    const startTimestamp = startTime.getTime();
    
    // Check if future
    if (startTimestamp > now.getTime()) {
        alert("O horário de início não pode ser no futuro.");
        return;
    }

    onStartBreak(startTimestamp); // Sync Global
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${seconds < 0 ? '-' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };
  
  const getFullDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- KNOB STYLE CALCULATIONS ---
  const size = 280;
  const center = size / 2;
  const strokeWidth = 16;
  const radius = (size / 2) - strokeWidth - 20; // Allow space for ticks
  const circumference = 2 * Math.PI * radius;

  // Calculate percentage (100% = 1 hour left, 0% = 0 time left)
  // If timeLeft < 0 (overdue), we keep it at 0 visual progress or could make it loop
  const percentage = isActive 
      ? Math.max(0, Math.min(100, (timeLeft / ONE_HOUR_SECONDS) * 100)) 
      : 100;

  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Calculate Knob Position (Trigonometry)
  // SVG rotates -90deg, so 0 is top.
  const angle = (percentage / 100) * 360;
  const angleInRadians = (angle - 90) * (Math.PI / 180);
  const knobX = center + radius * Math.cos(angleInRadians);
  const knobY = center + radius * Math.sin(angleInRadians);

  // Map themeColor to Hex for Gradient
  const getColorHex = (theme: ThemeColor) => {
      const colors: Record<ThemeColor, { start: string, end: string }> = {
          blue: { start: '#2563eb', end: '#60a5fa' },
          green: { start: '#059669', end: '#34d399' },
          purple: { start: '#7c3aed', end: '#a78bfa' },
          pink: { start: '#db2777', end: '#f472b6' },
          orange: { start: '#ea580c', end: '#fb923c' },
          slate: { start: '#1e293b', end: '#475569' },
      };
      return colors[theme] || colors.blue;
  };
  const gradientColors = getColorHex(themeColor);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
           <h2 className="text-3xl font-light text-slate-800 capitalize tracking-tight">{getDayName(currentDate)}</h2>
           <p className="text-sm text-slate-400 font-medium mt-1">{getFullDate(currentDate)}</p>
        </div>
        <div className="font-mono text-xl font-medium text-slate-600 flex items-center bg-slate-50 px-4 py-2 rounded-lg">
            <Clock size={18} className="mr-3 text-slate-400" />
            {currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT: Timer Card - Knob Style */}
          <div className="flex flex-col items-center justify-center relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-100 border border-slate-100">
             
             <div 
                className={`relative mb-8 transition-transform duration-200 ${!isActive ? 'cursor-pointer hover:scale-[1.02] active:scale-95 group' : ''}`}
                onClick={!isActive ? handleStartNow : undefined}
                title={!isActive ? "Toque para iniciar o intervalo agora" : ""}
             >
                 <svg width={size} height={size} className="relative z-10">
                     <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={timeLeft < 0 ? '#ef4444' : gradientColors.start} />
                            <stop offset="100%" stopColor={timeLeft < 0 ? '#f87171' : gradientColors.end} />
                        </linearGradient>
                        <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                        </filter>
                     </defs>

                     {/* Tick Marks Ring */}
                     {Array.from({ length: 60 }).map((_, i) => {
                         const tickAngle = (i * 6) * (Math.PI / 180);
                         const isHour = i % 5 === 0;
                         const tickLen = isHour ? 12 : 6;
                         const innerR = (size / 2) - 10;
                         const outerR = innerR + tickLen;
                         
                         const x1 = center + innerR * Math.cos(tickAngle);
                         const y1 = center + innerR * Math.sin(tickAngle);
                         const x2 = center + outerR * Math.cos(tickAngle);
                         const y2 = center + outerR * Math.sin(tickAngle);

                         return (
                             <line 
                                key={i}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={isActive && i <= (percentage / 100) * 60 ? '#cbd5e1' : '#f1f5f9'}
                                strokeWidth={isHour ? 2 : 1}
                             />
                         );
                     })}

                     {/* Track Background */}
                     <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                     />

                     {/* Progress Arc */}
                     <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${center} ${center})`}
                        className="transition-all duration-1000 ease-linear"
                     />

                     {/* Knob Indicator */}
                     {isActive && timeLeft >= 0 && (
                         <circle 
                            cx={knobX}
                            cy={knobY}
                            r={10}
                            fill="white"
                            filter="url(#knobShadow)"
                            className="transition-all duration-1000 ease-linear"
                         />
                     )}
                 </svg>
                 
                 {/* Center Text */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full m-[50px] bg-white shadow-inner pointer-events-none">
                     <span className={`text-4xl font-bold font-mono tracking-tighter tabular-nums ${timeLeft < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                         {formatTime(timeLeft)}
                     </span>
                     <span className={`text-[10px] uppercase mt-1 tracking-widest font-bold ${isActive ? (timeLeft < 0 ? 'text-red-400' : `text-${themeColor}-500`) : 'text-slate-300 group-hover:text-blue-500 transition-colors'}`}>
                         {isActive ? (timeLeft < 0 ? 'ATRASO' : 'RESTANTE') : 'INICIAR'}
                     </span>
                 </div>
             </div>

             {/* Controls Area */}
             <div className="w-full max-w-xs space-y-4">
                 {!isActive ? (
                     <>
                         <div className="flex flex-col gap-2">
                             <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Horário de Saída
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="time" 
                                        value={manualStartTime}
                                        onChange={(e) => setManualStartTime(e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg py-3 px-4 text-center text-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <button 
                                        onClick={handleStartNow}
                                        className={`px-4 text-xs font-bold text-${themeColor}-600 bg-${themeColor}-50 hover:bg-${themeColor}-100 border border-${themeColor}-100 transition-colors rounded-lg whitespace-nowrap`}
                                    >
                                        AGORA
                                    </button>
                                </div>
                             </div>
                         </div>
                         <button 
                            onClick={handleManualStartSubmit}
                            disabled={!manualStartTime}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${manualStartTime ? `bg-slate-800 hover:bg-slate-900 text-white shadow-slate-300` : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                         >
                            <Play size={18} fill="currentColor" />
                            INICIAR INTERVALO
                         </button>
                     </>
                 ) : (
                     <button 
                        onClick={onEndBreak}
                        className="w-full bg-white border-2 border-slate-100 hover:border-green-500 hover:text-green-600 text-slate-500 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                     >
                         <RotateCcw size={18} className="group-hover:-rotate-90 transition-transform duration-300" />
                         <span>ENCERRAR INTERVALO</span>
                     </button>
                 )}
             </div>
          </div>

          {/* RIGHT: Status Card */}
          <div className="flex flex-col h-full justify-center">
               <div className={`p-8 rounded-3xl border border-slate-100 ${isActive ? 'bg-gradient-to-br from-white to-slate-50' : 'bg-white'}`}>
                   <div className="flex items-center gap-4 mb-6">
                       <div className={`p-4 rounded-2xl shadow-sm ${isActive ? 'bg-white' : 'bg-slate-50'}`}>
                           {isActive ? <Utensils size={28} className={`text-${themeColor}-500`} /> : <Coffee size={28} className="text-slate-400" />}
                       </div>
                       <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                {isActive ? 'Intervalo em Andamento' : 'Hora da Pausa?'}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Status do dia</p>
                       </div>
                   </div>
                   
                   <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                       {isActive 
                         ? "Aproveite este momento para relaxar e recarregar. Um bom intervalo faz toda a diferença."
                         : "O descanso é parte fundamental do trabalho. Pausas regulares são essenciais para manter o foco, a criatividade e a saúde mental."
                       }
                   </p>

                   {!isActive && (
                       <div className="border-t border-slate-100 pt-6">
                           <div className="flex items-center gap-2 mb-2">
                               <Sun size={16} className="text-amber-500" />
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dica de Bem-estar</span>
                           </div>
                           <p className="text-sm text-slate-600 italic">
                               "Tente se alongar ou beber água antes de iniciar seu descanso."
                           </p>
                       </div>
                   )}
                   
                   {isActive && (
                        <div className="border-t border-slate-200 pt-6 flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                    <Watch size={20} className="text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Retorno Previsto</span>
                                    <span className="font-mono text-lg font-bold text-slate-700">
                                        {new Date(Date.now() + timeLeft * 1000).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300" />
                        </div>
                   )}
               </div>
          </div>
      </div>
    </div>
  );
};
