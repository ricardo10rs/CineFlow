
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Info, Plus, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeColor, HolidayEvent, UserRole } from '../types';

interface HolidayCalendarProps {
  themeColor: ThemeColor;
  holidays: HolidayEvent[];
  userRole: UserRole;
  year: number;
  onYearChange: (year: number) => void;
  onAdd: (holiday: HolidayEvent) => void;
  onEdit: (holiday: HolidayEvent) => void;
  onDelete: (id: string) => void;
}

export const HolidayCalendar: React.FC<HolidayCalendarProps> = ({ 
  themeColor, 
  holidays,
  userRole,
  year,
  onYearChange,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayEvent | null>(null);
  
  // Inline delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Feriado Nacional');
  const [color, setColor] = useState<'green' | 'orange' | 'yellow' | 'blue' | 'purple' | 'red'>('green');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setEditingHoliday(null);
    setDate('');
    setName('');
    setType('Feriado Nacional');
    setColor('green');
    setDescription('');
  };

  const handleOpenAdd = () => {
      resetForm();
      // Pre-fill date with current selected year
      setDate(`${year}-01-01`);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (holiday: HolidayEvent) => {
      setEditingHoliday(holiday);
      setDate(holiday.date);
      setName(holiday.name);
      setType(holiday.type);
      setColor(holiday.color);
      setDescription(holiday.description || '');
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const eventData: HolidayEvent = {
          id: editingHoliday ? editingHoliday.id : Date.now().toString(),
          date,
          name,
          type,
          color,
          description
      };

      if (editingHoliday) {
          onEdit(eventData);
      } else {
          onAdd(eventData);
      }
      setIsModalOpen(false);
      resetForm();
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (deleteConfirmId === id) {
          onDelete(id);
          setDeleteConfirmId(null);
      } else {
          setDeleteConfirmId(id);
          // Auto reset confirm state after 3 seconds if not clicked
          setTimeout(() => {
              setDeleteConfirmId(current => current === id ? null : current);
          }, 3000);
      }
  };

  const getDayDetails = (dateString: string) => {
    // Prevent timezone issues by using split
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDate();
    // const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const weekDay = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    return { day, weekDay, monthIndex: m - 1 };
  };

  const getColorClasses = (c: string) => {
    switch (c) {
      case 'green': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-l-emerald-500', dot: 'bg-emerald-500', ring: 'ring-emerald-200' };
      case 'orange': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-l-orange-500', dot: 'bg-orange-500', ring: 'ring-orange-200' };
      case 'yellow': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-l-amber-500', dot: 'bg-amber-500', ring: 'ring-amber-200' };
      case 'purple': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-l-purple-500', dot: 'bg-purple-500', ring: 'ring-purple-200' };
      case 'red': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-l-red-500', dot: 'bg-red-500', ring: 'ring-red-200' };
      default: return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-l-blue-500', dot: 'bg-blue-500', ring: 'ring-blue-200' };
    }
  };

  // Filter holidays by selected year and sort
  const filteredHolidays = holidays
    .filter(h => h.date.startsWith(`${year}-`))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const getMonthName = (monthIndex: number) => {
    const date = new Date(year, monthIndex, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12 relative">
      
      {/* ADD/EDIT MODAL */}
      {isModalOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-100">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center">
                          {editingHoliday ? <Edit2 size={20} className="mr-2 text-blue-600" /> : <Plus size={20} className="mr-2 text-blue-600" />}
                          {editingHoliday ? 'Editar Feriado' : 'Novo Feriado'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Feriado</label>
                          <input 
                              type="text" 
                              value={name} 
                              onChange={e => setName(e.target.value)} 
                              required 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Ex: Confraternização Universal"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                              <input 
                                  type="date" 
                                  value={date} 
                                  onChange={e => setDate(e.target.value)} 
                                  required 
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                              <select 
                                  value={type} 
                                  onChange={e => setType(e.target.value)} 
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                              >
                                  <option value="Feriado Nacional">Feriado Nacional</option>
                                  <option value="Ponto Facultativo">Ponto Facultativo</option>
                                  <option value="Feriado Municipal">Feriado Municipal</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor da Etiqueta</label>
                          <div className="flex space-x-3">
                              {(['green', 'orange', 'yellow', 'blue', 'purple', 'red'] as const).map(c => (
                                  <button
                                      key={c}
                                      type="button"
                                      onClick={() => setColor(c)}
                                      className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'} transition-all`}
                                      style={{ backgroundColor: c === 'yellow' ? '#f59e0b' : c }}
                                  />
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição (Opcional)</label>
                          <input 
                              type="text" 
                              value={description} 
                              onChange={e => setDescription(e.target.value)} 
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Breve descrição..."
                          />
                      </div>

                      <div className="pt-4 flex justify-end">
                          <button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center"
                          >
                              <Save size={18} className="mr-2" />
                              Salvar
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl bg-${themeColor}-100 text-${themeColor}-600`}>
            <CalendarIcon size={28} strokeWidth={2} />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-slate-800">Feriados {year}</h2>
            <p className="text-slate-500">Calendário de Feriados e Pontos Facultativos</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            {isAdmin ? (
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                    <button 
                        onClick={() => onYearChange(year - 1)}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 font-bold text-slate-700">{year}</span>
                    <button 
                        onClick={() => onYearChange(year + 1)}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-2">
                     <span className="font-bold text-slate-700 text-lg">{year}</span>
                </div>
            )}

            {isAdmin && (
                <button 
                    onClick={handleOpenAdd}
                    className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-${themeColor}-500/20 flex items-center transition-all`}
                >
                    <Plus size={18} className="mr-2" />
                    Adicionar
                </button>
            )}
        </div>
      </div>

      <div className="space-y-10 mt-6">
        {Array.from({ length: 12 }).map((_, monthIdx) => {
            // Filter holidays for this month
            const monthHolidays = filteredHolidays.filter(h => {
                const [y, m, d] = h.date.split('-').map(Number);
                return (m - 1) === monthIdx;
            });

            if (monthHolidays.length === 0) return null;

            return (
                <div key={monthIdx} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-700 capitalize mb-6 flex items-center border-b border-slate-100 pb-4">
                        <span className={`w-2 h-8 bg-${themeColor}-500 rounded-full mr-3`}></span>
                        {getMonthName(monthIdx)}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {monthHolidays.map((holiday) => {
                            const { day, weekDay } = getDayDetails(holiday.date);
                            const styles = getColorClasses(holiday.color);
                            const isConfirming = deleteConfirmId === holiday.id;

                            return (
                                <div key={holiday.id} className="flex group relative bg-slate-50 rounded-2xl p-4 border border-slate-200 transition-all hover:bg-white hover:shadow-md hover:border-slate-300">
                                    {/* Date Box */}
                                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl ${styles.bg} ${styles.text} shrink-0 mr-4 border border-white shadow-sm`}>
                                        <span className="text-2xl font-bold leading-none">{day}</span>
                                        <span className="text-[9px] uppercase font-bold mt-1">Dia</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-base font-bold text-slate-800 truncate pr-2">{holiday.name}</h4>
                                                <p className="text-sm text-slate-500 capitalize">{weekDay}</p>
                                            </div>
                                            <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${styles.bg} ${styles.text} border-transparent`}>
                                                {holiday.type === 'Ponto Facultativo' ? 'Facultativo' : holiday.type.split(' ')[0]}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-xs text-slate-400 flex items-center truncate max-w-[70%]">
                                                {holiday.description && (
                                                    <>
                                                        <Info size={12} className="mr-1.5 shrink-0" />
                                                        <span className="truncate">{holiday.description}</span>
                                                    </>
                                                )}
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            handleOpenEdit(holiday);
                                                        }}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => handleDeleteClick(holiday.id, e)}
                                                        className={`transition-colors p-1 rounded flex items-center ${isConfirming ? 'text-red-600 bg-red-50 px-2' : 'text-slate-400 hover:text-red-600'}`}
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                        {isConfirming && <span className="text-[10px] font-bold ml-1">Confirmar</span>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}

        {/* Empty State if all holidays filtered out or empty */}
        {filteredHolidays.length === 0 && (
             <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Nenhum feriado cadastrado para {year}.</p>
                {isAdmin && (
                    <button onClick={handleOpenAdd} className="text-blue-600 font-bold text-sm mt-2 hover:underline">
                        Adicionar o primeiro feriado de {year}
                    </button>
                )}
             </div>
        )}
      </div>
    </div>
  );
};
