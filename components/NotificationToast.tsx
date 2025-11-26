import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

interface NotificationToastProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

interface ToastItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation entrance
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(notification.id), 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'warning': return <AlertCircle size={20} className="text-amber-500" />;
      case 'info': return <Info size={20} className="text-blue-500" />;
      default: return <Bell size={20} className="text-slate-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-amber-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <div 
      className={`
        pointer-events-auto bg-white rounded-lg shadow-xl border border-slate-100 border-l-4 p-4 w-80 transform transition-all duration-300 ease-out
        ${getBorderColor()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800">{notification.title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
        </div>
        <button 
          onClick={() => { setIsVisible(false); setTimeout(() => onRemove(notification.id), 300); }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, removeNotification }) => {
  // Only show notifications created in the last 5 seconds (simulating real-time toasts)
  // In a real app, you'd manage a separate "toast queue" state. 
  // For this mock, we filter by timestamp relative to render, but ideally App.tsx passes ephemeral toasts.
  // Here we assume the parent passes only "new/active" toasts.

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <ToastItem key={notif.id} notification={notif} onRemove={removeNotification} />
      ))}
    </div>
  );
};