import React, { useState, useEffect } from 'react';
import { ThemeColor } from '../types';
import { Play, Pause, RotateCcw, Clock, Layout, ArrowRight } from 'lucide-react';

interface BoardProps {
  themeColor: ThemeColor;
}

export const Board: React.FC<BoardProps> = ({ themeColor }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Timer States
  const [totalTime, setTotalTime] = useState(15 * 60); // Default 15 min in seconds
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15); // in minutes
  const [manualStartTime, setManualStartTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60); // Update date/time every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound or notification
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleDurationChange = (minutes: number) => {
    setIsActive(false);
    setSelectedDuration(minutes);
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
    setManualStartTime(''); // Reset manual input
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
    setManualStartTime('');
  };

  const handleManualStartSubmit = () => {
    if (!manualStartTime) return;

    const [hours, mins] = manualStartTime.split(':').map(Number);
    const now = new Date();
    const startTime = new Date();
    startTime.setHours(hours, mins, 0, 0);

    // Calculate difference in seconds between Now and Start Time
    // If start time is > now (future), we assume user meant previous day? No, usually prevent future time.
    let diffSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    if (diffSeconds < 0) {
        alert("O horário de início não pode ser no futuro.");
        return;
    }

    const newTimeLeft = totalTime - diffSeconds;

    if (newTimeLeft <= 0) {
        setTimeLeft(0);
        setIsActive(false);
        alert("Com base no horário inserido, seu intervalo já acabou.");
    } else {
        setTimeLeft(newTimeLeft);
        setIsActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular Progress Calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };
  
  const getFullDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 capitalize">{getDayName(currentDate)}</h2>
           <p className="text-lg text-slate-500">{getFullDate(currentDate)}</p>
        </div>
        <div className={`px-4 py-2 bg-${themeColor}-50 text-${themeColor}-700 rounded-xl font-mono text-xl font-bold border border-${themeColor}-100`}>
            {currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interval Timer Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                <div 
                    className={`h-full bg-${themeColor}-500 transition-all duration-1000`} 
                    style={{ width: `${progress}%` }}
                ></div>
             </div>

             <div className="w-full flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <Clock className={`mr-2 text-${themeColor}-600`} />
                    Meu Intervalo
                </h3>
                <div className="flex space-x-2">
                    {[15, 30, 60].map((min) => (
                        <button
                            key={min}
                            onClick={() => handleDurationChange(min)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors border ${
                                selectedDuration === min 
                                ? `bg-${themeColor}-600 text-white border-${themeColor}-600` 
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {min}m
                        </button>
                    ))}
                </div>
             </div>

             {/* Manual Start Time Input */}
             {!isActive && timeLeft === totalTime && (
                 <div className="w-full mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Já saiu? Insira o horário:</label>
                        <input 
                            type="time" 
                            value={manualStartTime}
                            onChange={(e) => setManualStartTime(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button 
                        onClick={handleManualStartSubmit}
                        disabled={!manualStartTime}
                        className={`w-full sm:w-auto px-4 py-2 bg-${themeColor}-100 text-${themeColor}-700 rounded-lg text-xs font-bold hover:bg-${themeColor}-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-auto h-[38px]`}
                    >
                        Ajustar <ArrowRight size={14} className="ml-1" />
                    </button>
                 </div>
             )}

             {/* Circular Progress */}
             <div className="relative mb-8">
                 <svg width="220" height="220" className="transform -rotate-90">
                     <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        stroke="#f1f5f9" // slate-100
                        strokeWidth="12"
                        fill="transparent"
                     />
                     <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        stroke={`var(--color-${themeColor}-500)`} 
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`text-${themeColor}-500 transition-all duration-1000 ease-linear`}
                        style={{ stroke: 'currentColor' }} 
                     />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-5xl font-bold text-slate-800 font-mono tracking-tighter">
                         {formatTime(timeLeft)}
                     </span>
                     <span className="text-xs font-bold uppercase text-slate-400 mt-2 tracking-widest">
                         Restante
                     </span>
                 </div>
             </div>

             {/* Controls */}
             <div className="flex items-center gap-6">
                 <button 
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    title="Reiniciar"
                 >
                     <RotateCcw size={24} />
                 </button>
                 
                 <button 
                    onClick={toggleTimer}
                    className={`p-6 rounded-full text-white shadow-xl shadow-${themeColor}-500/30 hover:scale-105 transition-all active:scale-95 bg-${themeColor}-600`}
                 >
                     {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                 </button>
             </div>
             
             <p className="mt-8 text-slate-400 text-sm font-medium">
                 {isActive ? 'Cronômetro em andamento...' : 'Selecione a duração ou insira o horário de início.'}
             </p>
          </div>

          {/* Quick Notes / Info Placeholder */}
          <div className={`bg-gradient-to-br from-${themeColor}-50 to-white rounded-3xl p-8 border border-${themeColor}-100 flex flex-col justify-center items-start`}>
               <div className={`bg-white p-3 rounded-xl shadow-sm border border-${themeColor}-100 mb-4`}>
                   <Layout className={`text-${themeColor}-600`} size={24} />
               </div>
               <h3 className={`text-2xl font-bold text-${themeColor}-900 mb-2`}>
                   Painel do Funcionário
               </h3>
               <p className="text-slate-600 mb-6 leading-relaxed">
                   Use este quadro para acompanhar o dia a dia e gerenciar seus intervalos de descanso com precisão. Mantenha o foco e aproveite suas pausas!
               </p>
               <div className="w-full bg-white/60 rounded-xl p-4 border border-white/50 backdrop-blur-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Dica do dia</p>
                   <p className="text-sm text-slate-700 italic">"Organização é a chave para um dia produtivo e sem estresse."</p>
               </div>
          </div>
      </div>
    </div>
  );
};