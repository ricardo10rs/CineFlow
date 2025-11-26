
import React, { useState, useEffect } from 'react';
import { Palmtree, Wind, Smile, Calendar } from 'lucide-react';
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
  const returnDateString = targetDateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  // Countdown Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = +targetDateObj - +now;
      
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

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [returnDate]);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center shadow-none font-sans">
        
        {/* Background Photo & Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=2070&auto=format&fit=crop"
                alt="Beach Background" 
                className="w-full h-full object-cover scale-105"
            />
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-transparent to-slate-900/90"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-4xl w-full animate-fade-in-up">
            
            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-xl">
                <Palmtree size={48} className="text-white drop-shadow-md" strokeWidth={1.5} />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
                Boas Férias, {firstName}
            </h1>

            <p className="text-indigo-50 text-xl md:text-2xl font-medium opacity-90 max-w-2xl leading-relaxed mb-12 drop-shadow-md">
                Desconecte-se do trabalho e aproveite cada momento. Seu descanso é merecido.
            </p>

            {/* Info Card - Glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-lg shadow-2xl hover:bg-white/15 transition-colors">
                <div className="flex flex-col items-center">
                    <span className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">Previsão de Retorno</span>
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="text-white opacity-80" size={28} />
                        <span className="text-3xl md:text-4xl font-bold text-white capitalize drop-shadow-sm">
                            {returnDateString}
                        </span>
                    </div>
                    
                    <p className="text-white/70 text-xs md:text-sm font-medium mb-8">
                        O acesso completo ao sistema será restabelecido automaticamente nesta data.
                    </p>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"></div>

                    {/* Minimalist Timer Grid */}
                    {timeLeft && (
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <div className="flex flex-col items-center p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">{timeLeft.days}</span>
                                <span className="text-[10px] text-indigo-200 uppercase font-bold mt-1 tracking-wider">Dias</span>
                            </div>
                            <div className="flex flex-col items-center p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">{timeLeft.hours}</span>
                                <span className="text-[10px] text-indigo-200 uppercase font-bold mt-1 tracking-wider">Horas</span>
                            </div>
                            <div className="flex flex-col items-center p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                                <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">{timeLeft.minutes}</span>
                                <span className="text-[10px] text-indigo-200 uppercase font-bold mt-1 tracking-wider">Minutos</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`
                    mt-12 px-10 py-4 rounded-full font-bold text-sm tracking-widest shadow-xl transition-all duration-500 transform hover:scale-105 active:scale-95 flex items-center gap-3 border
                    ${isBreathing 
                        ? 'bg-white text-indigo-900 border-white' 
                        : 'bg-indigo-600/80 text-white border-indigo-500 hover:bg-indigo-600 backdrop-blur-md'
                    }
                `}
            >
                {isBreathing ? <Wind className="animate-pulse" size={20} /> : <Smile size={20} />}
                {isBreathing ? 'INSPIRE... EXPIRE...' : 'MOMENTO RELAX'}
            </button>

            {/* Breathing Animation Overlay */}
            {isBreathing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                    <div className="w-[600px] h-[600px] bg-white opacity-10 rounded-full animate-ping-slow blur-3xl"></div>
                </div>
            )}
        </div>

        <style>{`
            .animate-ping-slow { animation: ping 6s cubic-bezier(0, 0, 0.2, 1) infinite; }
        `}</style>
    </div>
  );
};
