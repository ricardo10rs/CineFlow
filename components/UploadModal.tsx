import React, { useState } from 'react';
import { X, UploadCloud, FileText, Image as ImageIcon, Loader2, Clock } from 'lucide-react';
import { ContentType } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, type: ContentType, file?: File, durationDays?: number | null) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Acts as content for announcements
  const [type, setType] = useState<ContentType>(ContentType.ANNOUNCEMENT);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duration, setDuration] = useState<string>('7'); // Default 7 days

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert duration string to number or null (for permanent)
    const durationDays = duration === 'permanent' ? null : parseInt(duration);

    await onSubmit(title, description, type, file || undefined, durationDays);
    setIsSubmitting(false);
    
    // Reset form
    setTitle('');
    setDescription('');
    setFile(null);
    setDuration('7');
    setType(ContentType.ANNOUNCEMENT);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Selection */}
          <div className="flex space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            {[ContentType.ANNOUNCEMENT].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  type === t 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === ContentType.ANNOUNCEMENT ? 'Novo Aviso' : ''}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400"
              placeholder="Ex: Balanço Q3 ou Nova Política de Home Office"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duração da Exibição</label>
            <div className="relative">
                <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-700"
                >
                    <option value="1">1 Dia</option>
                    <option value="3">3 Dias</option>
                    <option value="7">1 Semana (Padrão)</option>
                    <option value="15">15 Dias</option>
                    <option value="30">1 Mês</option>
                    <option value="permanent">Indeterminado (Não expira)</option>
                </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 ml-1">O comunicado será removido automaticamente após este período.</p>
          </div>

          {/* Description/Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Conteúdo do Aviso
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 resize-none text-slate-900 placeholder-slate-400"
              placeholder="Escreva o comunicado aqui..."
            />
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <span className="mr-1">✨</span> A IA analisará este texto para gerar resumos e tags.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
             <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Processando IA...
                </>
              ) : (
                'Publicar Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};