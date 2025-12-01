
import React, { useState, useRef, useMemo } from 'react';
import { PromotionalFile, ThemeColor, UserRole } from '../types';
import { Download, UploadCloud, FileText, Image as ImageIcon, Video, FileArchive, Trash2, Search, X, Plus, Folder, ArrowLeft, ChevronRight, Calendar, ChevronLeft as ChevronLeftIcon, Edit2 } from 'lucide-react';

interface MarketingFilesProps {
  files: PromotionalFile[];
  themeColor: ThemeColor;
  userRole: UserRole;
  onUpload: (title: string, description: string, file: File) => void;
  onUpdate?: (id: string, data: Partial<PromotionalFile>) => void;
  onDelete: (id: string) => void;
}

export const MarketingFiles: React.FC<MarketingFilesProps> = ({ 
  files, 
  themeColor, 
  userRole, 
  onUpload, 
  onUpdate,
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFolderKey, setSelectedFolderKey] = useState<string | null>(null);
  const [currentViewYear, setCurrentViewYear] = useState(new Date().getFullYear());
  
  // Upload/Edit State
  const [editingFile, setEditingFile] = useState<PromotionalFile | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = userRole === 'super_admin';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartEdit = (file: PromotionalFile) => {
      setEditingFile(file);
      setTitle(file.title);
      setDescription(file.description);
      setSelectedFile(null); // Keep existing file unless changed
      setIsUploadModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFile && onUpdate) {
        // Edit Mode
        const updateData: Partial<PromotionalFile> = {
            title,
            description
        };
        // In a real app we'd upload the new file here if selected
        if (selectedFile) {
            updateData.url = URL.createObjectURL(selectedFile);
            updateData.type = selectedFile.type.includes('pdf') ? 'PDF' : selectedFile.type.includes('video') ? 'VIDEO' : selectedFile.type.includes('zip') ? 'ZIP' : 'IMAGE';
        }
        onUpdate(editingFile.id, updateData);
        closeModal();
    } else if (title && selectedFile) {
        // Create Mode
        onUpload(title, description, selectedFile);
        closeModal();
        setCurrentViewYear(new Date().getFullYear());
    }
  };

  const closeModal = () => {
      setIsUploadModalOpen(false);
      setEditingFile(null);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText size={24} className="text-red-500" />;
      case 'VIDEO': return <Video size={24} className="text-purple-500" />;
      case 'ZIP': return <FileArchive size={24} className="text-orange-500" />;
      default: return <ImageIcon size={24} className="text-blue-500" />;
    }
  };

  // --- FOLDER LOGIC ---

  // Updated color palette for months (Vibrant Gradients based on request)
  const monthColors = [
      { gradient: 'bg-gradient-to-br from-orange-400 to-pink-500', text: 'text-white' },      // Jan
      { gradient: 'bg-gradient-to-br from-pink-400 to-rose-500', text: 'text-white' },        // Feb
      { gradient: 'bg-gradient-to-br from-rose-400 to-red-500', text: 'text-white' },         // Mar
      { gradient: 'bg-gradient-to-br from-red-400 to-orange-500', text: 'text-white' },       // Apr
      { gradient: 'bg-gradient-to-br from-orange-400 to-amber-500', text: 'text-white' },     // May
      { gradient: 'bg-gradient-to-br from-amber-400 to-yellow-500', text: 'text-white' },     // Jun
      { gradient: 'bg-gradient-to-br from-lime-400 to-green-500', text: 'text-white' },       // Jul
      { gradient: 'bg-gradient-to-br from-emerald-400 to-teal-500', text: 'text-white' },     // Aug
      { gradient: 'bg-gradient-to-br from-teal-400 to-cyan-500', text: 'text-white' },        // Sep
      { gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500', text: 'text-white' },        // Oct
      { gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500', text: 'text-white' },      // Nov
      { gradient: 'bg-gradient-to-br from-indigo-400 to-purple-500', text: 'text-white' },    // Dec
  ];

  const folders = useMemo(() => {
      const grouped: Record<string, PromotionalFile[]> = {};
      
      // 1. Initialize all 12 months for the current view year
      for (let i = 1; i <= 12; i++) {
          const mStr = i.toString().padStart(2, '0');
          const key = `${currentViewYear}-${mStr}`;
          grouped[key] = [];
      }

      // 2. Populate with files matching the year
      files.forEach(file => {
          const parts = file.date.split('/');
          if (parts.length === 3) {
              const month = parts[1];
              const year = parseInt(parts[2]);
              
              if (year === currentViewYear) {
                  const key = `${year}-${month}`;
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(file);
              }
          }
      });

      // 3. Convert to array and sort (Jan to Dec)
      const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
      
      return sortedKeys.map(key => {
          const [year, month] = key.split('-');
          const monthIndex = parseInt(month, 10) - 1;
          const dateObj = new Date(parseInt(year), monthIndex, 1);
          const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
          const display = `${monthName} ${year}`;
          const colorTheme = monthColors[monthIndex % 12];

          return {
              key,
              display,
              files: grouped[key],
              monthIndex,
              color: colorTheme
          };
      });
  }, [files, currentViewYear]);

  // If searching, ignore folders and flatten results
  const isSearching = searchTerm.trim().length > 0;
  
  const displayedFiles = isSearching 
      ? files.filter(f => f.title.toLowerCase().includes(searchTerm.toLowerCase()) || f.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : selectedFolderKey 
          ? folders.find(f => f.key === selectedFolderKey)?.files || []
          : [];

  const currentFolderInfo = folders.find(f => f.key === selectedFolderKey);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upload/Edit Modal (Super Admin Only) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                {editingFile ? <Edit2 size={20} className="mr-2 text-blue-600" /> : <UploadCloud size={20} className="mr-2 text-blue-600" />}
                {editingFile ? 'Editar Material' : 'Novo Material'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título da Campanha/Arquivo</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Ex: Campanha Dia das Mães"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-24"
                  placeholder="Instruções de uso, validade, etc."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arquivo {editingFile && '(Opcional se manter o atual)'}</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-2 text-blue-600">
                       <FileText size={20} />
                       <span className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                  ) : editingFile ? (
                     <div className="flex flex-col items-center">
                        <FileText size={24} className="text-slate-400 mb-1" />
                        <p className="text-xs text-slate-500">Arquivo atual mantido.</p>
                        <p className="text-[10px] text-blue-500 font-bold mt-1">Clique para substituir</p>
                     </div>
                  ) : (
                    <>
                      <UploadCloud size={32} className="text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Clique para selecionar</p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG, ZIP</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!title || (!selectedFile && !editingFile)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFile ? 'Salvar Alterações' : 'Enviar Material'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="flex items-center space-x-3">
            {/* Conditional Back Button */}
            {(selectedFolderKey && !isSearching) ? (
                <button 
                    onClick={() => setSelectedFolderKey(null)}
                    className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={24} strokeWidth={2} />
                </button>
            ) : (
                <div className={`p-3 rounded-2xl bg-${themeColor}-100 text-${themeColor}-600`}>
                    <UploadCloud size={24} strokeWidth={2} />
                </div>
            )}
            
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800">Marketing</h2>
                    {(selectedFolderKey && !isSearching && currentFolderInfo) && (
                        <>
                            <ChevronRight size={16} className="text-slate-400" />
                            <h2 className="text-xl font-bold text-slate-600 capitalize">{currentFolderInfo.display}</h2>
                        </>
                    )}
                </div>
                <p className="text-sm text-slate-500">
                   {isSuperAdmin 
                     ? 'Distribua materiais promocionais para todas as filiais.' 
                     : 'Baixe as peças de campanha e materiais oficiais da rede.'}
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
             
             {/* Year Selector */}
             {!selectedFolderKey && !isSearching && (
                 <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                     <button onClick={() => setCurrentViewYear(y => y - 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeftIcon size={16} /></button>
                     <span className="px-3 font-bold text-slate-700 text-sm">{currentViewYear}</span>
                     <button onClick={() => setCurrentViewYear(y => y + 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight size={16} /></button>
                 </div>
             )}

             <div className="relative flex-1 md:w-64 w-full">
                <input 
                    type="text" 
                    placeholder="Buscar materiais..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
             </div>

             {isSuperAdmin && (
                 <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-${themeColor}-500/20 flex items-center justify-center transition-all shrink-0 w-full sm:w-auto`}
                 >
                    <Plus size={18} className="mr-2" />
                    Novo Material
                 </button>
             )}
        </div>
      </div>

      {/* VIEW: FOLDERS GRID (Only if not searching and no folder selected) */}
      {!isSearching && !selectedFolderKey && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {folders.map(folder => (
                  <button 
                    key={folder.key}
                    onClick={() => setSelectedFolderKey(folder.key)}
                    className={`group relative flex flex-col items-start p-6 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full shadow-md border border-white/5 ${folder.color.gradient} ${folder.color.text}`}
                  >
                      {/* Glossy Effect */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"></div>
                      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                      
                      <div className="p-4 rounded-full mb-4 bg-black/20 backdrop-blur-md border border-white/5 shadow-inner">
                          {folder.files.length > 0 ? (
                              <div className="relative">
                                  <Folder size={32} fill="currentColor" className="opacity-80" />
                                  <Folder size={32} className="absolute inset-0 text-white/90" strokeWidth={1.5} />
                              </div>
                          ) : (
                              <Folder size={32} strokeWidth={1.5} className="opacity-50" />
                          )}
                      </div>
                      
                      <h3 className="font-bold text-lg capitalize leading-tight mb-2 relative z-10 drop-shadow-sm tracking-wide">
                          {folder.display}
                      </h3>
                      
                      <div className="mt-auto bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                          <p className="text-xs font-bold opacity-90">
                              {folder.files.length} {folder.files.length === 1 ? 'arquivo' : 'arquivos'}
                          </p>
                      </div>
                  </button>
              ))}
          </div>
      )}

      {/* VIEW: FILES GRID (If searching OR folder selected) */}
      {(isSearching || selectedFolderKey) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedFiles.map(file => (
                <div key={file.id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col animate-fade-in-up">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-${themeColor}-50 group-hover:border-${themeColor}-100 transition-colors`}>
                            {getFileIcon(file.type)}
                        </div>
                        <div className="flex gap-1">
                            <a 
                                href={file.url} 
                                download={file.title}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Baixar Arquivo"
                            >
                                <Download size={18} />
                            </a>
                            {isSuperAdmin && (
                                <>
                                    <button 
                                        onClick={() => handleStartEdit(file)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(window.confirm('Excluir este material?')) onDelete(file.id);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-1" title={file.title}>{file.title}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">{file.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                        <span>{file.type}</span>
                        <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{file.date}</span>
                        </div>
                    </div>
                </div>
            ))}

            {displayedFiles.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium">Nenhum arquivo encontrado.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
