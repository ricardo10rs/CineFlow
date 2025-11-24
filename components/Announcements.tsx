
import React from 'react';
import { AnnouncementItem, ThemeColor, UserRole } from '../types';
import { Calendar, Trash2, Clock, UserCircle, CheckCircle2, Pin, Layout, AlertCircle } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mural de Avisos</h2>
            <p className="text-slate-500 text-sm mt-1">Atualizações e comunicados importantes da empresa.</p>
         </div>
         {items.length > 0 && (
            <span className={`bg-${themeColor}-50 text-${themeColor}-700 border border-${themeColor}-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm`}>
                <AlertCircle size={14} className="mr-1.5" />
                {items.length} {items.length === 1 ? 'ativo' : 'ativos'}
            </span>
         )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`
              relative bg-white rounded-xl p-6 shadow-sm border border-slate-100 
              hover:shadow-md transition-all duration-300 group overflow-hidden
              ${item.targetUserId ? 'bg-blue-50/30' : ''}
            `}
          >
            {/* Colored Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${item.targetUserId ? 'blue' : themeColor}-500`}></div>

            <div className="pl-4 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1 mr-4">
                  
                  {/* Metadata Row */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
                      <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <span className="uppercase tracking-wider font-bold mr-2 text-[10px] text-slate-400">Por</span>
                        {item.author}
                      </div>
                      
                      <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <Calendar size={12} className="mr-1.5 text-slate-400" />
                        <span>{item.date}</span>
                      </div>

                      {item.targetUserId && (
                           <div className="flex items-center text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm">
                                <UserCircle size={12} className="mr-1.5" />
                                <span>Mensagem Privada</span>
                           </div>
                      )}

                      {(userRole === 'admin' || userRole === 'super_admin') && item.expirationDate && (
                          <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100" title="Data de Expiração">
                             <Clock size={12} className="mr-1.5" />
                             <span>Expira: {new Date(item.expirationDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                      )}
                  </div>

                  <h3 className={`text-xl font-bold text-slate-800 leading-snug group-hover:text-${themeColor}-600 transition-colors pt-1`}>
                    {item.title}
                  </h3>
                </div>
                
                <div className="flex items-center pl-2">
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Comunicado"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-slate-600 leading-relaxed text-sm border-t border-slate-50 pt-4">
                <p className="whitespace-pre-line">{item.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State Card - Visually Rich */}
        {items.length === 0 && (
          <div className={`bg-white rounded-3xl border border-slate-200 p-12 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[400px]`}>
             
             {/* Decorative Background Elements */}
             <div className={`absolute -bottom-24 -right-24 w-80 h-80 bg-${themeColor}-50 rounded-full blur-3xl opacity-50 pointer-events-none`}></div>
             <div className={`absolute -top-24 -left-24 w-60 h-60 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none`}></div>
             
             {/* Pin & Icon */}
             <div className="relative mb-8">
                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -mt-6 z-20">
                    <div className="w-3 h-3 rounded-full bg-slate-300 shadow-sm border-2 border-white"></div>
                 </div>
                 <div className={`bg-${themeColor}-50 p-6 rounded-3xl border border-${themeColor}-100 shadow-inner transform rotate-3 transition-transform duration-500 hover:rotate-0`}>
                    <Layout size={48} className={`text-${themeColor}-500`} strokeWidth={1.5} />
                 </div>
             </div>
             
             <div className="relative z-10 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    Mural Atualizado
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                    Olá, <strong>{firstName}</strong>! Não há novos comunicados ou pendências no quadro de avisos no momento.
                </p>
                
                <div className="flex justify-center">
                    <span className="inline-flex items-center text-sm font-bold text-slate-600 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
                        <CheckCircle2 size={16} className={`mr-2 text-${themeColor}-500`} />
                        Tudo em ordem
                    </span>
                </div>
             </div>
             
             {/* Footer decorative info */}
             <div className="absolute bottom-6 w-full text-center">
                 <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">CineFlow • {new Date().getFullYear()}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
