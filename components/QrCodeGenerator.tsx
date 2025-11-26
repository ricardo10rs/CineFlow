
import React, { useRef } from 'react';
import { ThemeColor, User, UserRole } from '../types';
import { QrCode, UploadCloud, Download, Users, Lock, Unlock, Trash2, ImageIcon, Eye, EyeOff, Moon } from 'lucide-react';

interface QrCodeGeneratorProps {
  themeColor: ThemeColor;
  userRole: UserRole;
  users?: User[]; 
  currentUser?: User | null;
  onToggleAccess?: (userId: string) => void; 
  onUploadQrCode?: (userId: string, file: File) => void; // Updated signature
  onDeleteQrCode?: (userId: string) => void; // Updated signature
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ 
  themeColor, 
  userRole, 
  users = [],
  currentUser,
  onToggleAccess,
  onUploadQrCode,
  onDeleteQrCode
}) => {
  
  // Helper to handle file selection per user
  const handleFileSelect = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && onUploadQrCode) {
          onUploadQrCode(userId, e.target.files[0]);
          // Reset value so same file can be selected again if needed
          e.target.value = '';
      }
  };

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // --- EMPLOYEE VIEW ---
  if (!isAdmin) {
      const qrImage = currentUser?.qrCodeImage;
      return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl bg-${themeColor}-100 text-${themeColor}-600`}>
                    <QrCode size={24} strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">QR Code de Acesso</h2>
                    <p className="text-sm text-slate-500">Utilize este código para liberar seu acesso.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                {qrImage ? (
                    <div className="flex flex-col items-center w-full animate-fade-in-up">
                        <div className={`relative group bg-white p-4 rounded-3xl shadow-lg border-4 border-${themeColor}-100 mb-6`}>
                            <img 
                                src={qrImage} 
                                alt="QR Code de Acesso" 
                                className="rounded-xl w-full max-w-[300px] h-auto" 
                            />
                        </div>
                        
                        <a 
                            href={qrImage} 
                            download="acesso.png"
                            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 transition-all shadow-md`}
                        >
                            <Download size={18} />
                            Baixar Imagem
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Acesso Indisponível</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2">
                            Seu QR Code de acesso ainda não foi disponibilizado.
                        </p>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- ADMIN VIEW ---
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-2xl bg-${themeColor}-100 text-${themeColor}-600`}>
          <QrCode size={24} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestão de QR Code</h2>
          <p className="text-sm text-slate-500">
            Gerencie os códigos de acesso individual da equipe.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <Users size={20} className="text-slate-500" />
                 <h3 className="text-lg font-bold text-slate-800">Equipe</h3>
             </div>
             <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-slate-500 border border-slate-200">
                 {users.filter(u => u.role !== 'super_admin').length} funcionários
             </span>
          </div>

          <div className="divide-y divide-slate-100">
              {users.filter(u => u.role !== 'super_admin').map(user => (
                  <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      
                      {/* User Info */}
                      <div className="flex items-center space-x-4 min-w-[200px]">
                          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200 shrink-0">
                              {user.avatar.length > 5 ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                  user.avatar
                              )}
                          </div>
                          <div>
                              <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.jobTitle || 'Funcionário'}</p>
                          </div>
                      </div>

                      {/* QR Code Actions */}
                      <div className="flex items-center gap-4 flex-1 justify-end">
                          
                          {/* Image Preview / Upload */}
                          <div className="flex items-center gap-3">
                              {user.qrCodeImage ? (
                                  <div className="relative group">
                                      <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white p-1">
                                          <img src={user.qrCodeImage} className="w-full h-full object-contain" alt="QR" />
                                      </div>
                                      {/* Hover Overlay to Delete */}
                                      {onDeleteQrCode && (
                                          <button 
                                              onClick={() => {
                                                  if(window.confirm(`Remover QR Code de acesso de ${user.name}?`)) onDeleteQrCode(user.id);
                                              }}
                                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                              title="Excluir Imagem"
                                          >
                                              <Trash2 size={12} />
                                          </button>
                                      )}
                                  </div>
                              ) : (
                                  <div className="relative">
                                      <input 
                                          type="file" 
                                          id={`upload-${user.id}`} 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={(e) => handleFileSelect(user.id, e)}
                                      />
                                      <label 
                                          htmlFor={`upload-${user.id}`}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-xs font-bold text-slate-500 hover:bg-${themeColor}-50 hover:text-${themeColor}-600 hover:border-${themeColor}-200 cursor-pointer transition-all`}
                                      >
                                          <UploadCloud size={14} />
                                          <span>Upload QR</span>
                                      </label>
                                  </div>
                              )}
                          </div>

                          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                          {/* Visibility Toggle */}
                          <div className="flex flex-col items-center">
                              <button
                                  onClick={() => onToggleAccess && onToggleAccess(user.id)}
                                  className={`
                                      relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
                                      ${user.hasQrCodeAccess ? `bg-${themeColor}-500` : 'bg-slate-200'}
                                  `}
                                  title={user.hasQrCodeAccess ? "Revogar Acesso" : "Conceder Acesso"}
                              >
                                  <div className={`
                                      absolute top-1 bottom-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center
                                      ${user.hasQrCodeAccess ? 'translate-x-6' : 'translate-x-0'}
                                  `}>
                                      {user.hasQrCodeAccess ? <Eye size={10} className={`text-${themeColor}-600`} /> : <EyeOff size={10} className="text-slate-400" />}
                                  </div>
                              </button>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                  {user.hasQrCodeAccess ? 'Liberado' : 'Bloqueado'}
                              </span>
                          </div>
                      </div>
                  </div>
              ))}

              {users.filter(u => u.role !== 'super_admin').length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                      <p>Nenhum funcionário cadastrado.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
