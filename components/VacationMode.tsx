
import React, { useState, useEffect } from 'react';
import { Palmtree, Sun, CalendarCheck, Cloud, Wind, Clock, Smile } from 'lucide-react';
import { ThemeColor } from '../types';

interface VacationModeProps {
  returnDate: string;
  userName: string;
  themeColor: ThemeColor;
}

export const VacationMode: React.FC<VacationModeProps> = ({ returnDate, userName, themeColor }) => {
  const firstName = userName.split(' ')[0];
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);

  // Format return date
  const targetDateObj = new Date(returnDate + 'T00:00:00');
  const formattedDate = targetDateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
  });

  // Countdown Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDateObj - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial cal
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [returnDate]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-fade-in relative overflow-hidden rounded-3xl">
      
      {/* --- DYNAMIC BACKGROUND --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-orange-200 to-yellow-100 animate-gradient-xy"></div>
      
      {/* Animated Clouds */}
      <div className="absolute top-10 left-10 text-white/60 animate-float-slow" style={{ animationDuration: '15s' }}>
          <Cloud size={80} fill="currentColor" />
      </div>
      <div className="absolute top-20 right-20 text-white/40 animate-float-slow" style={{ animationDuration: '25s', animationDelay: '2s' }}>
          <Cloud size={60} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 left-1/3 text-white/30 animate-float-slow" style={{ animationDuration: '20s', animationDelay: '5s' }}>
          <Cloud size={100} fill="currentColor" />
      </div>

      {/* Rotating Sun */}
      <div className="absolute -top-16 -right-16 text-yellow-400 opacity-80 animate-spin-slow origin-center" style={{ animationDuration: '60s' }}>
          <Sun size={200} />
      </div>


      {/* --- MAIN GLASS CARD --- */}
      <div className="relative z-10 max-w-2xl w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-8 md:p-12 text-center transition-all duration-500 hover:shadow-orange-200/50">
        
        {/* Palm Tree Icon - Swaying Animation */}
        <div className="relative inline-block mb-6 group">
            <div className="absolute inset-0 bg-orange-400 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-6 rounded-3xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Palmtree size={64} className="text-white animate-sway origin-bottom" strokeWidth={2} />
            </div>
             {/* Sunglasses Emoji Absolute */}
             <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm text-xl transform rotate-12">
                😎
            </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
            Boas Férias, {firstName}!
        </h1>
        
        <p className="text-slate-600 text-lg mb-10 font-medium leading-relaxed max-w-lg mx-auto">
            O modo férias está ativo. Aproveite para desconectar, recarregar as energias e curtir cada momento.
        </p>

        {/* --- COUNTDOWN TIMER --- */}
        {timeLeft && (
            <div className="grid grid-cols-4 gap-2 md:gap-4 mb-10 max-w-lg mx-auto">
                <div className="bg-white/80 rounded-2xl p-3 border border-orange-100 shadow-sm flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-black text-orange-500">{timeLeft.days}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Dias</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-3 border border-orange-100 shadow-sm flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-black text-orange-500">{timeLeft.hours}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Horas</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-3 border border-orange-100 shadow-sm flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-black text-orange-500">{timeLeft.minutes}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Min</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-3 border border-orange-100 shadow-sm flex flex-col items-center">
                    <span className="text-2xl md:text-3xl font-black text-orange-500">{timeLeft.seconds}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Seg</span>
                </div>
            </div>
        )}

        {/* --- INTERACTIVE BREATHE BUTTON --- */}
        <div className="mb-8">
            <button 
                onClick={() => setIsBreathing(!isBreathing)}
                className={`
                    relative overflow-hidden px-8 py-3 rounded-full font-bold text-sm transition-all duration-500
                    ${isBreathing ? 'bg-blue-500 text-white shadow-blue-300/50' : 'bg-white text-slate-600 shadow-sm hover:shadow-md border border-slate-100'}
                `}
            >
                <span className="relative z-10 flex items-center">
                    {isBreathing ? <Wind className="mr-2 animate-pulse" size={18} /> : <Smile className="mr-2" size={18} />}
                    {isBreathing ? 'Respire...' : 'Modo Relaxamento'}
                </span>
                {isBreathing && (
                    <div className="absolute inset-0 bg-white opacity-20 animate-ping-slow"></div>
                )}
            </button>
            {isBreathing && (
                <p className="text-xs text-slate-400 mt-3 animate-pulse">Inspire profundamente... e expire.</p>
            )}
        </div>

        {/* Return Date Info */}
        <div className="bg-white/50 inline-flex items-center px-6 py-3 rounded-2xl border border-white/60 text-slate-600 text-sm font-medium">
            <CalendarCheck size={18} className="mr-2 text-orange-500" />
            <span>Retorno previsto: <span className="text-slate-800 font-bold capitalize">{formattedDate}</span></span>
        </div>

      </div>
      
      {/* CSS Animations (Injected style for specific keyframes not in Tailwind default) */}
      <style>{`
        @keyframes float-slow {
            0% { transform: translateX(0px); }
            50% { transform: translateX(20px); }
            100% { transform: translateX(0px); }
        }
        @keyframes sway {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-sway { animation: sway 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};
