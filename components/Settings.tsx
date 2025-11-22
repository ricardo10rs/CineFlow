
import React, { useRef } from 'react';
import { ThemeColor, User } from '../types';
import { Check, Palette, Shield, CalendarOff, ToggleLeft, ToggleRight, Bell, Mail, MessageSquare, UserCircle, Camera } from 'lucide-react';

interface SettingsProps {
  user: User;
  currentTheme: ThemeColor;
  onThemeChange: (color: ThemeColor) => void;
  isSundayOffEnabled?: boolean;
  onToggleSundayOff?: () => void;
  onUpdateAvatar?: (file: File) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  user, 
  currentTheme, 
  onThemeChange,
  isSundayOffEnabled = true,
  onToggleSundayOff,
  onUpdateAvatar
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors: { id: ThemeColor; label: string; bg: string; ring: string }[] = [
    { id: 'blue', label: 'Azul Corporativo', bg: 'bg-blue-600', ring: 'ring-blue-600' },
    { id: 'slate', label: 'Preto Executivo', bg: 'bg-slate-600', ring: 'ring-slate-600' },
    { id: 'green', label: 'Verde Natureza', bg: 'bg-green-600', ring: 'ring-green-600' },
    { id: 'purple', label: 'Roxo Criativo', bg: 'bg-purple-600', ring: 'ring-purple-600' },
    { id: 'pink', label: 'Rosa Vibrante', bg: 'bg-pink-600', ring: 'ring-pink-600' },
    { id: 'orange', label: 'Laranja Energia', bg: 'bg-orange-600', ring: 'ring-orange-600' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdateAvatar) {
        onUpdateAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
        <p className="text-sm text-slate-500">Personalize sua experiência no aplicativo.</p>
      </div>

      {/* Profile Picture Settings */}
      {onUpdateAvatar && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-2xl">
             <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg bg-slate-100`}>
                   <UserCircle className="text-slate-500" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Foto de Perfil</h3>
             </div>
             <div className="flex items-center space-x-6">
                 <div className="relative group">
                     <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-slate-400 overflow-hidden">
                        {user.avatar.length > 5 ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user.avatar
                        )}
                     </div>
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
                     >
                        <Camera size={16} />
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                     />
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Alterar sua foto</p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Carregue uma imagem para facilitar sua identificação na equipe (PNG, JPG).</p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                        Escolher Arquivo
                    </button>
                 </div>
             </div>
          </div>
      )}

      {/* Admin Settings */}
      {user.role === 'admin' && onToggleSundayOff && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Shield size={100} className="text-slate-900" />
          </div>
          <div className="flex items-center space-x-3 mb-6 relative z-10">
            <div className={`p-2 rounded-lg bg-slate-100`}>
              <Shield className="text-slate-500" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Administrativo</h3>
          </div>

          <div className="space-y-6 relative z-10">
             <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-4">
                   <div className="bg-white p-2 rounded-lg text-slate-400 shadow-sm border border-slate-100">
                      <CalendarOff size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800">Solicitações de Folga (Domingo)</p>
                      <p className="text-xs text-slate-500">Ao ativar, notificaremos toda a equipe por email/SMS.</p>
                   </div>
                </div>
                
                <button 
                  onClick={onToggleSundayOff}
                  className={`transition-all duration-300 ${isSundayOffEnabled ? 'text-green-500' : 'text-slate-400'}`}
                >
                  {isSundayOffEnabled ? (
                    <ToggleRight size={40} fill="currentColor" className="opacity-100" />
                  ) : (
                    <ToggleLeft size={40} className="opacity-100" />
                  )}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-2xl">
        <div className="flex items-center space-x-3 mb-6">
            <div className={`p-2 rounded-lg bg-slate-100`}>
              <Bell className="text-slate-500" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Notificações</h3>
        </div>
        
        <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">Escolha como deseja receber alertas sobre escalas, avisos e solicitações.</p>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Alertas por Email</span>
                </div>
                <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer bg-blue-600">
                     <span className="absolute left-0 inline-block w-5 h-5 bg-white border border-gray-300 rounded-full shadow transform translate-x-5 transition-transform duration-200 ease-in-out"></span>
                </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div className="flex items-center space-x-3">
                    <MessageSquare size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Alertas por SMS (Celular)</span>
                </div>
                <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out rounded-full cursor-pointer bg-blue-600">
                     <span className="absolute left-0 inline-block w-5 h-5 bg-white border border-gray-300 rounded-full shadow transform translate-x-5 transition-transform duration-200 ease-in-out"></span>
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Telefone cadastrado: <span className="font-mono text-slate-600">{user.phone || 'Não informado'}</span></p>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-lg bg-slate-100`}>
            <Palette className="text-slate-500" size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aparência</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">Cor de Destaque</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onThemeChange(color.id)}
                className={`
                  relative flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200
                  ${currentTheme === color.id 
                    ? `border-${color.id}-500 bg-${color.id}-50 ring-1 ${color.ring}` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <div className={`w-6 h-6 rounded-full ${color.bg} shadow-sm flex items-center justify-center border border-white/10`}>
                  {currentTheme === color.id && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm font-medium ${currentTheme === color.id ? 'text-slate-800' : 'text-slate-500'}`}>
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};