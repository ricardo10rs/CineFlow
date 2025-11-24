import React from 'react';
import { AnnouncementItem, ThemeColor, UserRole } from '../types';
import { Calendar, Trash2, Clock, UserCircle, Sun, Coffee, CheckCircle2, Pin } from 'lucide-react';

interface AnnouncementsProps {
  items: AnnouncementItem[];
  themeColor: ThemeColor;
  userRole: UserRole;
  onDelete: (id: string) => void;
  userName: string;
}

export const Announcements: React.FC<AnnouncementsProps> = ({ items, themeColor, userRole, onDelete, userName }) => {
  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold text-slate-800">Comunicados</h2>
         {items.length > 0 && (
            <span className={`bg-${themeColor}-50 text-${themeColor}-600 border border-${themeColor}-200 text-xs font-bold px-2.5 py-1 rounded-full`}>{items.length} ativos</span>
         )}
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-2xl p-6 shadow-sm border ${item.targetUserId ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'} hover:border-slate-300 transition-colors duration-300 group`}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1 mr-4">
                  <div className="flex items-center space-x-2 text-xs font-medium mb-2 flex-wrap gap-y-1">
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wide">{item.author}</span>
                      <div className="flex items-center text-slate-400">
                        <Calendar size={12} className="mr-1" />
                        <span>{item.date}</span>
                      </div>
                      {item.targetUserId && (
                           <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                                <UserCircle size={12} className="mr-1" />
                                <span>Mensagem Privada</span>
                           </div>
                      )}
                      {userRole === 'admin' && item.expirationDate && (
                          <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100" title="Data de Expiração">
                             <Clock size={10} className="mr-1" />
                             <span>Expira: {new Date(item.expirationDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                      )}
                  </div>
                  <h3 className={`text-lg font-bold text-slate-800 leading-tight group-hover:text-${themeColor}-600 transition-colors`}>{item.title}</h3>
                </div>
                
                <div className="flex items-center space-x-3">
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir Comunicado"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-slate-600 leading-relaxed">
                <p>{item.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State Card - Visually Rich to fill the board */}
        {items.length === 0 && (
          <div className={`bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300`}>
             {/* Pin Decoration */}
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-3">
                <div className="w-16 h-8 bg-amber-100 opacity-50 rotate-2 rounded-sm shadow-sm"></div>
             </div>
             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-red-400 drop-shadow-md">
                 <Pin size={24} fill="currentColor" />
             </div>

             {/* Background Blob */}
             <div className={`absolute -bottom-20 -right-20 w-64 h-64 bg-${themeColor}-50 rounded-full blur-3xl opacity-60 pointer-events-none`}></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 py-4">
                <div className={`bg-${themeColor}-50 p-6 rounded-2xl border border-${themeColor}-100 flex items-center justify-center aspect-square w-28 shrink-0`}>
                    <Sun size={48} className={`text-${themeColor}-500`} strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-3">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Quadro de Avisos Atualizado
                    </h3>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Olá, <strong>{firstName}</strong>! No momento, não há novos comunicados ou pendências urgentes para você.
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                        <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <CheckCircle2 size={14} className={`mr-1.5 text-${themeColor}-500`} />
                            Tudo em ordem
                        </span>
                        <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Coffee size={14} className="mr-1.5 text-amber-500" />
                            Bom trabalho!
                        </span>
                    </div>
                </div>
             </div>
             
             {/* Footer decorative line */}
             <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                 <span>CineFlow Intranet</span>
                 <span>{new Date().toLocaleDateString('pt-BR')}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};