
import React from 'react';
import { Palmtree, Sun, CalendarCheck, Umbrella } from 'lucide-react';
import { ThemeColor } from '../types';

interface VacationModeProps {
  returnDate: string;
  userName: string;
  themeColor: ThemeColor;
}

export const VacationMode: React.FC<VacationModeProps> = ({ returnDate, userName, themeColor }) => {
  const firstName = userName.split(' ')[0];
  
  // Format date nicely
  const formattedDate = new Date(returnDate + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-white/50 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400"></div>
        <div className="absolute -top-10 -right-10 text-yellow-100 opacity-50 animate-spin-slow" style={{ animationDuration: '20s' }}>
            <Sun size={150} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="bg-orange-100 p-6 rounded-full mb-6 shadow-inner animate-bounce-slow">
                <Palmtree size={64} className="text-orange-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                Boas Férias, {firstName}!
            </h1>
            
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Desconecte-se, descanse e aproveite cada momento. 
                Seu painel estará te esperando quando você voltar.
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 w-full transform transition-all hover:scale-105">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Previsão de Retorno</span>
                    <div className="flex items-center text-orange-600 space-x-2">
                        <CalendarCheck size={24} />
                        <span className="text-xl md:text-2xl font-bold capitalize">{formattedDate}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center text-slate-400 text-sm">
                <Umbrella size={16} className="mr-2" />
                <span>O acesso completo será restaurado automaticamente nesta data.</span>
            </div>
        </div>
      </div>
    </div>
  );
};
