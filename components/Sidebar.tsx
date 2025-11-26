
import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Settings, LogOut, CalendarClock, Users, Building, Timer, Clock, GripVertical, LucideIcon, MessageCircle, Hexagon, CalendarRange, CalendarDays, QrCode, FileText, Palmtree } from 'lucide-react';
import { User, ThemeColor } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  themeColor: ThemeColor;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  messageStatus: 'red' | 'green' | 'none';
  isMessagesTabEnabled?: boolean;
  isVacationMode?: boolean; // New Prop
}

type MenuItem = {
  id: string;
  icon: LucideIcon;
  label: string;
};

const getSidebarGradient = (theme: ThemeColor) => {
    switch(theme) {
        case 'blue': return 'bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950';
        case 'green': return 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950';
        case 'purple': return 'bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950';
        case 'pink': return 'bg-gradient-to-b from-slate-900 via-slate-900 to-pink-950';
        case 'orange': return 'bg-gradient-to-b from-slate-900 via-slate-900 to-orange-950';
        case 'slate': return 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950';
        default: return 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950';
    }
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  themeColor, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  messageStatus,
  isMessagesTabEnabled = false,
  isVacationMode = false
}) => {
  const [orderedItems, setOrderedItems] = useState<MenuItem[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    if (isVacationMode) {
        setOrderedItems([{ id: 'vacation', icon: Palmtree, label: 'Modo Férias' }]);
        return;
    }

    let baseItems: MenuItem[] = [];

    if (user.role === 'super_admin') {
        baseItems = [
          { id: 'branches', icon: Building, label: 'Unidades' },
          { id: 'team', icon: Users, label: 'Admin & Equipes' },
          { id: 'schedulings', icon: CalendarDays, label: 'Férias' },
          { id: 'settings', icon: Settings, label: 'Configurações' }
        ];
    } else {
        baseItems = [
          { id: 'announcements', icon: Megaphone, label: 'Avisos' },
          { id: 'board', icon: Clock, label: 'Intervalo' },
          { id: 'schedule', icon: CalendarClock, label: 'Escalas' },
          { id: 'calendar', icon: CalendarRange, label: 'Feriados' },
        ];

        // Messages tab: Always active for admins, OR if globally enabled, OR if status is not none
        const isAdmin = user.role === 'admin';
        if (isAdmin || isMessagesTabEnabled || messageStatus !== 'none') {
            baseItems.splice(1, 0, { id: 'messages', icon: MessageCircle, label: 'Mensagens' });
        }

        if (user.role === 'admin') {
          baseItems.push(
            { id: 'break_monitor', icon: Timer, label: 'Monitoramento' },
            { id: 'schedulings', icon: CalendarDays, label: 'Agendamentos' },
            { id: 'qrcode', icon: QrCode, label: 'Acesso QR' },
            { id: 'team', icon: Users, label: 'Minha Equipe' }
          );
        } else {
            // For employees, check if they have access to QR Code
            if (user.hasQrCodeAccess) {
                baseItems.push({ id: 'qrcode', icon: QrCode, label: 'Acesso QR' });
            }
        }
        
        baseItems.push({ id: 'settings', icon: Settings, label: 'Configurações' });
    }

    const savedOrder = localStorage.getItem(`cineflow_menu_order_${user.id}`);
    if (savedOrder) {
        try {
            const orderIds = JSON.parse(savedOrder) as string[];
            const sorted = [...baseItems].sort((a, b) => {
                const indexA = orderIds.indexOf(a.id);
                const indexB = orderIds.indexOf(b.id);
                // If new item not in saved order, append it (or keep original relative pos)
                if (indexA === -1 && indexB === -1) return 0; 
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            setOrderedItems(sorted);
        } catch (e) {
            setOrderedItems(baseItems);
        }
    } else {
        setOrderedItems(baseItems);
    }
  }, [user?.role, user?.id, messageStatus, isMessagesTabEnabled, isVacationMode, user?.hasQrCodeAccess]);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _items = [...orderedItems];
    const draggedItemContent = _items.splice(dragItem.current, 1)[0];
    _items.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setOrderedItems(_items);
    if (user) {
        const ids = _items.map(i => i.id);
        localStorage.setItem(`cineflow_menu_order_${user.id}`, JSON.stringify(ids));
    }
  };

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-20 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed left-0 z-30 text-white transition-all duration-500 ease-in-out
          top-20 w-full border-b border-slate-800 shadow-2xl origin-top
          ${mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4 pointer-events-none'}
          md:top-0 md:h-screen md:w-64 md:opacity-100 md:visible md:translate-y-0 md:pointer-events-auto
          md:flex md:flex-col md:border-b-0 md:border-r md:static
          ${getSidebarGradient(themeColor)}
        `}
      >
        <div className="hidden md:flex p-6 md:p-8 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`bg-${themeColor}-600 p-1.5 rounded-lg transition-colors duration-300 shadow-lg shadow-${themeColor}-900/50`}>
              <Hexagon className="text-white" size={24} strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CineFlow</span>
          </div>
        </div>

        {user && (
          <div className="px-4 py-4 md:px-6 md:py-0 md:mb-6 border-b md:border-none border-slate-700/30">
            <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-3 border border-white/10 backdrop-blur-sm">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0 transition-colors duration-300 overflow-hidden`}>
                {user.avatar.length > 5 ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    user.avatar
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin Unidade' : user.jobTitle || 'Funcionário'}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto max-h-[60vh] md:max-h-full">
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="touch-none"
            >
                <button
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                    activeTab === item.id
                    ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-900/20`
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                role="tab"
                aria-selected={activeTab === item.id}
                >
                <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing hidden md:block">
                    <GripVertical size={14} />
                </div>

                <item.icon size={20} strokeWidth={1.5} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="text-sm font-medium">{item.label}</span>
                
                {item.id === 'messages' && messageStatus !== 'none' && (
                     <span className={`ml-auto w-2 h-2 rounded-full ${messageStatus === 'green' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                )}
                </button>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/30 mx-4 mb-4 md:mb-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
