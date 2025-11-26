import React from 'react';
import { Notification, ThemeColor } from '../types';
import { Bell, Check, Trash2, X } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  themeColor: ThemeColor;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onClearAll,
  themeColor 
}) => {
  if (!isOpen) return null;

  // Stop propagation to prevent closing when clicking inside
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <>
        {/* Backdrop for mobile, transparent for desktop click-away handling via parent usually, 
            but here we use a fixed inset for simplicity to close on outside click */}
        <div className="fixed inset-0 z-40" onClick={onClose}></div>

        <div 
            onClick={handleContentClick}
            className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up origin-top-right"
        >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                    <Bell size={16} className={`text-${themeColor}-600`} />
                    <h3 className="font-bold text-slate-800 text-sm">Notificações</h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 rounded-full">
                        {notifications.length}
                    </span>
                </div>
                {notifications.length > 0 && (
                    <button 
                        onClick={onClearAll}
                        className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase transition-colors flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Limpar
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {sortedNotifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                        <Bell size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Tudo limpo por aqui!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {sortedNotifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`p-4 hover:bg-slate-50 transition-colors relative group ${!notif.read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {notif.date}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <button 
                                            onClick={() => onMarkAsRead(notif.id)}
                                            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                            title="Marcar como lida"
                                        >
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </>
  );
};
