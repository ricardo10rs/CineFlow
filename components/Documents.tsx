import React from 'react';
import { DocumentItem, ContentType, ThemeColor } from '../types';
import { FileText, Download, Search } from 'lucide-react';

interface DocumentsProps {
  items: DocumentItem[];
  themeColor: ThemeColor;
}

export const Documents: React.FC<DocumentsProps> = ({ items, themeColor }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Arquivos</h2>
           <p className="text-slate-500 text-sm">Gestão de documentos e imagens</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Pesquisar arquivos..." 
            className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all shadow-sm`}
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
        </div>
      </div>

      {/* Layout de Grade Responsivo: 2 Colunas (Mobile/Pequenas) -> 4 Colunas (Large/Maiores) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((doc) => (
          <div key={doc.id} className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            
            {/* Preview Area */}
            <div className={`aspect-[4/3] rounded-xl mb-4 overflow-hidden relative flex items-center justify-center ${doc.type === ContentType.IMAGE ? 'bg-slate-100' : `bg-${themeColor}-50`}`}>
              {doc.type === ContentType.IMAGE ? (
                <img src={doc.url} alt={doc.title} className="w-full h-full object-cover" />
              ) : (
                <div className="relative">
                   <div className={`absolute inset-0 bg-${themeColor}-400 blur-xl opacity-20 rounded-full`}></div>
                   <FileText size={32} strokeWidth={1.5} className={`text-${themeColor}-600 relative z-10`} />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="bg-white text-black p-2.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Download size={16} />
                  </button>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2 gap-2">
                  {/* Ajuste de tamanho de fonte para telas pequenas */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug" title={doc.title}>{doc.title}</h3>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">{doc.type === 'PDF' ? 'PDF' : 'IMG'}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 mb-3 sm:mb-4">{doc.description}</p>
              
              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-medium">{doc.date}</span>
                  <div className="flex gap-1">
                    {doc.analysis?.tags.slice(0, 1).map((tag, i) => (
                        <span key={i} className="bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 hidden sm:inline-block">#{tag}</span>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};