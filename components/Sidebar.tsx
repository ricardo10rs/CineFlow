
import React from 'react';
import { Megaphone, Settings, LogOut, CalendarClock, Users, Building, X, Hexagon, Timer, Clock } from 'lucide-react';
import { User, ThemeColor } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  themeColor: ThemeColor;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, themeColor, mobileMenuOpen, setMobileMenuOpen }) => {
  const menuItems = [];

  // Menu condicional por Role
  if (user?.role === 'super_admin') {
      menuItems.push(
        { id: 'branches', icon: Building, label: 'Unidades' },
        { id: 'break_monitor', icon: Timer, label: 'Monitoramento' },
        { id: 'team', icon: Users, label: 'Admin & Equipes' },
        { id: 'settings', icon: Settings, label: 'Configurações' }
      );
  } else {
      // Admin de Filial e Funcionário
      menuItems.push(
        { id: 'announcements', icon: Megaphone, label: 'Avisos' },
        { id: 'board', icon: Clock, label: 'Intervalo' },
        { id: 'schedule', icon: CalendarClock, label: 'Escalas' },
      );

      if (user?.role === 'admin') {
        menuItems.push(
          { id: 'break_monitor', icon: Timer, label: 'Monitoramento' },
          { id: 'team', icon: Users, label: 'Minha Equipe' }
        );
      }
      
      menuItems.push({ id: 'settings', icon: Settings, label: 'Configurações' });
  }

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false); // Fecha o menu no mobile ao clicar
  };

  return (
    <>
      {/* Mobile Overlay Backdrop - Adjusted to start below header (top-20) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-20 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed left-0 z-30 bg-[#0f172a] text-white transition-all duration-300 ease-in-out
          
          /* Mobile: Top Dropdown Style */
          top-20 w-full border-b border-slate-800 shadow-2xl origin-top
          ${mobileMenuOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible -translate-y-4 pointer-events-none'}
          
          /* Desktop: Side Drawer Style (Reset mobile styles) */
          md:top-0 md:h-screen md:w-64 md:opacity-100 md:visible md:translate-y-0 md:pointer-events-auto
          md:flex md:flex-col md:border-b-0 md:border-r md:static
        `}
      >
        {/* Header - Hidden on Mobile Dropdown (Redundant with App Header) */}
        <div className="hidden md:flex p-6 md:p-8 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`bg-${themeColor}-600 p-1.5 rounded-lg transition-colors duration-300 shadow-lg shadow-${themeColor}-900/50`}>
              <Hexagon className="text-white" size={24} strokeWidth={2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CineFlow</span>
          </div>
          {/* Close button not needed on desktop */}
        </div>

        {/* User Info - Compact on Mobile */}
        {user && (
          <div className="px-4 py-4 md:px-6 md:py-0 md:mb-6 border-b md:border-none border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-3 flex items-center space-x-3 border border-slate-700/50">
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

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto max-h-[60vh] md:max-h-full">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-900/20`
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              role="tab"
              aria-selected={activeTab === item.id}
            >
              <item.icon size={20} strokeWidth={1.5} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 mx-4 mb-4 md:mb-4">
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
