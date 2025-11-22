
import React from 'react';
import { AnnouncementItem, ThemeColor, UserRole } from '../types';
import { Calendar, Trash2, Clock, UserCircle } from 'lucide-react';

interface AnnouncementsProps {
  items: AnnouncementItem[];
  themeColor: ThemeColor;
  userRole: UserRole;
  onDelete: (id: string) => void;
}

export const Announcements: React.FC<AnnouncementsProps> = ({ items, themeColor, userRole, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold text-slate-800">Comunicados</h2>
         <span className={`bg-${themeColor}-50 text-${themeColor}-600 border border-${themeColor}-200 text-xs font-bold px-2.5 py-1 rounded-full`}>{items.length} ativos</span>
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

        {items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">Nenhum comunicado ativo no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};
