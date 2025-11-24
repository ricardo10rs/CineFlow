
import React, { useState } from 'react';
import { AnnouncementItem, ThemeColor, UserRole, DirectMessage } from '../types';
import { Calendar, Trash2, Clock, UserCircle, CheckCircle2, Layout, AlertCircle, MessageCircle, Send, FileText, Image as ImageIcon } from 'lucide-react';

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

        {/* Empty State Card - Visually Rich */}
        {items.length === 0 && messages.length === 0 && (
          <div className={`bg-white rounded-3xl border border-slate-200 p-12 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[400px] animate-fade-in`}>
             
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
                    {title === 'Mensagens Recebidas' ? 'Caixa de Entrada Vazia' : 'Mural Atualizado'}
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                    {title === 'Mensagens Recebidas' 
                      ? 'Você não possui novas mensagens diretas no momento.' 
                      : `Olá, ${firstName}! Não há novos comunicados ou pendências no quadro de avisos no momento.`}
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
    