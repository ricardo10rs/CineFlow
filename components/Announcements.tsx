import React, { useState } from 'react';
import { AnnouncementItem, ThemeColor, UserRole, DirectMessage } from '../types';
import { Calendar, Trash2, Clock, UserCircle, CheckCircle2, Layout, AlertCircle, MessageCircle, Send, FileText, Image as ImageIcon, Coffee, Sparkles, Sun, Smile } from 'lucide-react';

interface AnnouncementsProps {
  items: AnnouncementItem[];
  themeColor: ThemeColor;
  userRole: UserRole;
  onDelete: (id: string) => void;
  userName: string;
  messages?: DirectMessage[];
  onReply?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  title?: string;
  subtitle?: string;
}

export const Announcements: React.FC<AnnouncementsProps> = ({ 
  items, 
  themeColor, 
  userRole, 
  onDelete, 
  userName, 
  messages = [], 
  onReply, 
  onDeleteMessage,
  onMarkAsRead,
  title = "Mural de Avisos",
  subtitle = "Atualizações e comunicados importantes da empresa."
}) => {
  const firstName = userName.split(' ')[0];
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleReplyChange = (id: string, text: string) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  const submitReply = (id: string) => {
      const text = replyText[id];
      if (text && text.trim() && onReply) {
          onReply(id, text);
          setReplyText(prev => ({ ...prev, [id]: '' }));
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
         </div>
         {(items.length > 0 || messages.length > 0) && (
            <span className={`bg-${themeColor}-50 text-${themeColor}-700 border border-${themeColor}-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm`}>
                <AlertCircle size={14} className="mr-1.5" />
                {items.length + messages.length} {items.length + messages.length === 1 ? 'ativo' : 'ativos'}
            </span>
         )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* DIRECT MESSAGES SECTION */}
        {messages.map((msg, index) => (
          <div 
            key={msg.id}
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            className="relative bg-white rounded-xl p-6 shadow-md border-l-4 border-l-purple-500 border-y border-r border-slate-100 group animate-fade-in"
          >
            <div className="flex flex-col space-y-4">
               {/* Header of Message */}
               <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                       <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                          <MessageCircle size={20} />
                       </div>
                       <div>
                           <h3 className="text-base font-bold text-slate-800">Mensagem Direta</h3>
                           <p className="text-xs text-slate-500 flex items-center">
                               <span className="font-semibold text-purple-600 mr-1">{msg.senderName || 'Administração'}</span>
                               • {msg.date}
                           </p>
                       </div>
                   </div>
                   
                   {/* Delete Message Button (Admin Only) */}
                   {userRole !== 'employee' && onDeleteMessage && (
                       <button 
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             onDeleteMessage(msg.id);
                           }}
                           className="flex items-center text-xs font-bold text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-100 cursor-pointer z-10"
                           title="Encerrar Conversa (Remove a aba para o funcionário)"
                       >
                           <Trash2 size={14} className="mr-1.5" />
                           Encerrar Conversa
                       </button>
                   )}
               </div>
               
               {/* Message Body */}
               <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                   {msg.message}
                   
                   {msg.attachment && (
                        <div className="mt-3 flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 w-fit">
                            {msg.attachment.type === 'PDF' ? <FileText size={16} className="text-red-500" /> : <ImageIcon size={16} className="text-blue-500" />}
                            <span className="text-xs font-medium text-slate-700">{msg.attachment.name}</span>
                            <a href={msg.attachment.url} download={msg.attachment.name} className="text-[10px] text-blue-600 font-bold hover:underline ml-2">Baixar</a>
                        </div>
                   )}
               </div>

               {/* Replies Thread */}
               {msg.replies.length > 0 && (
                   <div className="space-y-3 pl-4 border-l-2 border-slate-100 mt-2">
                       {msg.replies.map(reply => (
                           <div key={reply.id} className={`flex flex-col ${reply.isAdmin ? 'items-start' : 'items-end'}`}>
                               <div className={`max-w-[85%] p-3 rounded-lg text-sm ${reply.isAdmin ? 'bg-purple-50 text-slate-700 rounded-tl-none' : 'bg-blue-50 text-slate-700 rounded-tr-none'}`}>
                                   <p>{reply.content}</p>
                               </div>
                               <span className="text-[10px] text-slate-400 mt-1">{reply.authorName} • {reply.date}</span>
                           </div>
                       ))}
                   </div>
               )}

               {/* Reply Input */}
               <div className="mt-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={replyText[msg.id] || ''}
                            onChange={(e) => handleReplyChange(msg.id, e.target.value)}
                            placeholder="Escreva sua resposta..."
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && submitReply(msg.id)}
                        />
                        <button 
                            onClick={() => submitReply(msg.id)}
                            disabled={!replyText[msg.id]}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4"
                        >
                            <Send size={16} />
                            <span className="text-xs font-bold hidden sm:inline">
                                Responder
                            </span>
                        </button>
                    </div>
                    {userRole === 'employee' && (
                        <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                            A conversa permanecerá ativa até que o administrador a encerre.
                        </p>
                    )}
               </div>
            </div>
          </div>
        ))}

        {/* REGULAR ANNOUNCEMENTS */}
        {items.map((item, index) => (
          <div 
            key={item.id} 
            style={{ animationDelay: `${(messages.length + index) * 0.1}s`, animationFillMode: 'both' }}
            className={`
              relative bg-white rounded-xl p-6 shadow-sm border border-slate-100 
              hover:shadow-md transition-all duration-300 group overflow-hidden animate-fade-in
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

        {/* Empty State Card - Visually Rich & Relaxed */}
        {items.length === 0 && messages.length === 0 && (
          <div className={`
            relative overflow-hidden rounded-3xl p-12 text-center min-h-[450px] flex flex-col items-center justify-center
            bg-gradient-to-br from-white via-slate-50 to-${themeColor}-50/50 border border-slate-200/60 shadow-xl shadow-slate-200/40
            animate-fade-in group
          `}>
             {/* Dynamic Background Shapes */}
             <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-${themeColor}-200/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
             <div className={`absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-${themeColor}-300/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3`}></div>
             
             {/* Main Illustration Container */}
             <div className="relative z-10 mb-8 transform transition-transform duration-700 group-hover:scale-105">
                 <div className={`
                    w-32 h-32 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                    flex items-center justify-center relative rotate-3 group-hover:rotate-6 transition-all duration-500
                    border border-white/50 backdrop-blur-sm
                 `}>
                    {title === 'Mensagens Recebidas' ? (
                       <MessageCircle size={56} className={`text-${themeColor}-400 drop-shadow-sm`} strokeWidth={1.5} />
                    ) : (
                       <div className="relative">
                          <Coffee size={56} className={`text-${themeColor}-500 drop-shadow-sm`} strokeWidth={1.5} />
                          <div className="absolute -top-2 -right-2">
                             <Sparkles size={24} className="text-yellow-400 animate-pulse" fill="currentColor" />
                          </div>
                       </div>
                    )}
                 </div>
                 
                 {/* Floating Decorative Elements */}
                 <div className={`absolute -right-4 top-0 bg-white p-2 rounded-xl shadow-sm rotate-12 animate-bounce`} style={{ animationDuration: '3s' }}>
                    <Sun size={20} className="text-orange-400" fill="currentColor" />
                 </div>
                 <div className={`absolute -left-2 bottom-0 bg-white p-2 rounded-full shadow-sm -rotate-6 animate-bounce`} style={{ animationDuration: '4s', animationDelay: '1s' }}>
                    <Smile size={20} className={`text-${themeColor}-400`} />
                 </div>
             </div>
             
             <div className="relative z-10 max-w-md mx-auto space-y-3">
                <h3 className={`text-3xl font-black tracking-tight text-slate-800`}>
                    {title === 'Mensagens Recebidas' ? 'Caixa Limpa!' : 'Tudo Tranquilo!'}
                </h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    {title === 'Mensagens Recebidas' 
                      ? 'Você leu todas as suas mensagens. Hora de focar no que importa!' 
                      : `Relaxa, ${firstName}! O mural de avisos está zerado e você está em dia com tudo.`}
                </p>
                
                <div className="pt-6">
                    <span className={`
                        inline-flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all
                        bg-white text-${themeColor}-600 border border-${themeColor}-100
                        group-hover:shadow-md group-hover:border-${themeColor}-200 group-hover:-translate-y-0.5
                    `}>
                        {title === 'Mensagens Recebidas' ? (
                             <>✨ Nenhuma pendência</>
                        ) : (
                             <>🚀 Aproveite o dia</>
                        )}
                    </span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};