
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Announcements } from './components/Announcements';
import { Schedule } from './components/Schedule';
import { UploadModal } from './components/UploadModal';
import { Login } from './components/Login';
import { TeamManagement } from './components/TeamManagement';
import { Settings } from './components/Settings';
import { BranchManagement } from './components/BranchManagement';
import { AppItem, AnnouncementItem, ContentType, WorkShift, User, ThemeColor, OffRequest, Notification, DailySchedule, DirectMessage, Branch } from './types';
import { Plus, Bell, Menu, MessageSquare, Mail, Smartphone, Paperclip, Download } from 'lucide-react';

// Initial Data with Branch IDs (assuming '1' is the main default branch)
const INITIAL_BRANCHES: Branch[] = [
  { id: '1', name: 'Matriz São Paulo', location: 'Av. Paulista' },
  { id: '2', name: 'Filial Rio de Janeiro', location: 'Copacabana' }
];

const INITIAL_ITEMS: AppItem[] = [
  {
    id: '1',
    branchId: '1',
    type: ContentType.ANNOUNCEMENT,
    title: 'Nova Política de Férias',
    date: '25 Out',
    author: 'RH',
    content: 'Temos o prazer de anunciar as atualizações na nossa política de férias anual.',
  }
];

// SHIFTS REORDERED: Thursday (Qui) -> Wednesday (Qua)
const INITIAL_SHIFTS: WorkShift[] = [
  // Branch 1 Shifts (SP)
  { id: '4', branchId: '1', dayOfWeek: 'Quinta-feira', date: '26/10', dayIndex: 4, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '5', branchId: '1', dayOfWeek: 'Sexta-feira', date: '27/10', dayIndex: 5, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '6', branchId: '1', dayOfWeek: 'Sábado', date: '28/10', dayIndex: 6, startTime: '09:00', endTime: '13:00', type: 'Work', location: 'Escritório', totalHours: 4 },
  // Sunday Default OPEN
  { id: '7', branchId: '1', dayOfWeek: 'Domingo', date: '29/10', dayIndex: 0, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '1', branchId: '1', dayOfWeek: 'Segunda-feira', date: '30/10', dayIndex: 1, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '2', branchId: '1', dayOfWeek: 'Terça-feira', date: '31/10', dayIndex: 2, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '3', branchId: '1', dayOfWeek: 'Quarta-feira', date: '01/11', dayIndex: 3, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  
  // Branch 2 Shifts (RJ)
  { id: '24', branchId: '2', dayOfWeek: 'Quinta-feira', date: '26/10', dayIndex: 4, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '25', branchId: '2', dayOfWeek: 'Sexta-feira', date: '27/10', dayIndex: 5, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '26', branchId: '2', dayOfWeek: 'Sábado', date: '28/10', dayIndex: 6, startTime: '09:00', endTime: '14:00', type: 'Work', location: 'Loja Copacabana', totalHours: 5 },
  // Sunday Default OPEN
  { id: '27', branchId: '2', dayOfWeek: 'Domingo', date: '29/10', dayIndex: 0, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '21', branchId: '2', dayOfWeek: 'Segunda-feira', date: '30/10', dayIndex: 1, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '22', branchId: '2', dayOfWeek: 'Terça-feira', date: '31/10', dayIndex: 2, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '23', branchId: '2', dayOfWeek: 'Quarta-feira', date: '01/11', dayIndex: 3, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
];

const INITIAL_USERS: User[] = [
  // Super Admin (Global Access)
  { id: '0', name: 'Super Admin', email: 'super@arco.com', role: 'super_admin', avatar: 'SA', password: '123', themeColor: 'slate', phone: '(00) 0000-0000', jobTitle: 'Diretor' },
  // Branch 1 Users
  { id: '1', branchId: '1', name: 'Admin Silva', email: 'admin@empresa.com', role: 'admin', avatar: 'AS', password: '123', themeColor: 'blue', phone: '(11) 99999-0000', jobTitle: 'Gerente' },
  { id: '2', branchId: '1', name: 'Maria Bilheteira', email: 'maria@empresa.com', role: 'employee', avatar: 'MB', password: '123', themeColor: 'pink', phone: '(11) 98888-1111', jobTitle: 'Bilheteira' },
  // Branch 2 Users (Isolated)
  { id: '3', branchId: '2', name: 'João Rio', email: 'joao@rio.com', role: 'admin', avatar: 'JR', password: '123', themeColor: 'green', phone: '(21) 99999-2222', jobTitle: 'Gerente Rio' },
];

const INITIAL_OFF_REQUESTS: OffRequest[] = [
  { id: '101', branchId: '1', userId: '2', userName: 'Maria Bilheteira', date: '29/10', status: 'pending', requestDate: '24/10 10:30' }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<AppItem[]>(INITIAL_ITEMS);
  const [shifts, setShifts] = useState<WorkShift[]>(INITIAL_SHIFTS);
  const [offRequests, setOffRequests] = useState<OffRequest[]>(INITIAL_OFF_REQUESTS);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('blue');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeToasts, setActiveToasts] = useState<{id: string, msg: string, type: 'email'|'sms'}[]>([]);
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [publishedMonths, setPublishedMonths] = useState<string[]>([]); 
  const [isSundayOffEnabled, setIsSundayOffEnabled] = useState(true);
  const [isWeeklyScheduleEnabled, setIsWeeklyScheduleEnabled] = useState(true); // NEW STATE
  const [availableJobTitles, setAvailableJobTitles] = useState<string[]>(['Recepcionista', 'Bilheteira', 'Atendente de Bombonière', 'Auxiliar de Limpeza', 'Gerente']);

  // --- NOTIFICATION CLEANUP LOGIC (1 HOUR) ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in ms
      
      setNotifications(prev => {
        // Keep only notifications younger than 1 hour
        return prev.filter(n => now - n.timestamp < oneHour);
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // --- VACATION RETURN CHECK ---
  useEffect(() => {
    if (user) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const scheduleToday = dailySchedules.find(s => s.userId === user.id && s.date === todayStr);
        const scheduleYesterday = dailySchedules.find(s => s.userId === user.id && s.date === yesterdayStr);

        // Logic: If yesterday was Vacation AND today is NOT Vacation (either Work or undefined which defaults to Work)
        const wasVacationYesterday = scheduleYesterday?.type === 'Vacation';
        const isVacationToday = scheduleToday?.type === 'Vacation';

        if (wasVacationYesterday && !isVacationToday) {
             // Check if we already notified to avoid loop (simple in-memory check for this session)
             const hasNotified = notifications.some(n => n.title === 'Bem-vindo de volta' && n.timestamp > Date.now() - 60000);
             if (!hasNotified) {
                 triggerNotification('🎉 Bem-vindo de volta! Sua escala semanal está disponível novamente.', 'sms');
                 triggerNotification('Suas férias terminaram. Bom retorno ao trabalho!', 'email');
             }
        }
    }
  }, [user, dailySchedules]);


  // --- DATA FILTERING BY BRANCH ---
  const currentBranchId = user?.role === 'super_admin' ? null : user?.branchId;

  const visibleBranches = branches; // Super admin sees all (managed in component), others don't see this usually.

  const visibleUsers = user?.role === 'super_admin' 
      ? users 
      : users.filter(u => u.branchId === currentBranchId);

  const visibleItems = user?.role === 'super_admin' 
      ? items 
      : items.filter(i => i.branchId === currentBranchId);

  const visibleShifts = user?.role === 'super_admin'
      ? shifts 
      : shifts.filter(s => s.branchId === currentBranchId);

  const visibleRequests = user?.role === 'super_admin'
      ? offRequests
      : offRequests.filter(r => r.branchId === currentBranchId);

  // Filter announcements expiration
  const announcements = visibleItems.filter(i => {
    if (i.type !== ContentType.ANNOUNCEMENT) return false;
    if (i.expirationDate) {
        const expiry = new Date(i.expirationDate);
        const now = new Date();
        if (now > expiry) return false; 
    }
    return true;
  }) as AnnouncementItem[];

  // --- CALCULATE NEXT SHIFT DYNAMICALLY ---
  const getNextShiftDisplay = () => {
    if (!visibleShifts.length) return { time: '--:--', info: 'Sem escala definida' };

    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    // Loop through the next 7 days (0 = today, 1 = tomorrow...)
    for (let i = 0; i < 7; i++) {
      const targetIndex = (currentDayIndex + i) % 7;
      const shift = visibleShifts.find(s => s.dayIndex === targetIndex);

      if (shift && shift.type === 'Work' && shift.startTime && shift.startTime !== '-') {
        // Parse shift time
        const [h, m] = shift.startTime.split(':').map(Number);
        const shiftTimeVal = h * 60 + m;

        if (i === 0) {
           // If it's today, only show if start time is in the future
           if (currentTimeVal < shiftTimeVal) {
               return { 
                 time: shift.startTime, 
                 info: `Hoje, ${shift.location || 'Local não def.'}` 
               };
           }
        } else {
           // Future day
           const dayName = i === 1 ? 'Amanhã' : shift.dayOfWeek.split('-')[0];
           return { 
             time: shift.startTime, 
             info: `${dayName}, ${shift.location || 'Local não def.'}` 
           };
        }
      }
    }
    
    return { time: '--:--', info: 'Sem próximos turnos' };
  };

  const nextShift = getNextShiftDisplay();


  const triggerNotification = (message: string, type: 'email' | 'sms' = 'email') => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title: type === 'email' ? 'Novo Email' : 'Novo SMS',
      message,
      type: 'info',
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(), // Save creation time
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    const toastId = Date.now().toString() + type;
    setActiveToasts(prev => [...prev, { id: toastId, msg: message, type }]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const handleLogin = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Normalize input
        const normalizedEmail = email.trim().toLowerCase();
        
        const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === pass);
        if (foundUser) {
          setUser(foundUser);
          setCurrentTheme(foundUser.themeColor || 'blue');
          // Set correct starting tab
          if (foundUser.role === 'super_admin') {
             setActiveTab('branches');
          } else {
             setActiveTab('dashboard');
          }
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  };

  const handleRegister = async (companyName: string, name: string, email: string, pass: string, phone: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        
        // Check if email exists
        if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
            reject(new Error("Este email já está cadastrado."));
            return;
        }

        // Create new Branch (Company)
        const newBranch: Branch = {
            id: Date.now().toString(),
            name: companyName,
            location: 'Matriz'
        };
        setBranches(prev => [...prev, newBranch]);

        // --- CRITICAL FIX: Generate Default Shifts for this new branch ---
        // Without this, the schedule page is broken for the new user
        const days = [
            {name: 'Quinta-feira', idx: 4}, 
            {name: 'Sexta-feira', idx: 5}, 
            {name: 'Sábado', idx: 6}, 
            {name: 'Domingo', idx: 0}, 
            {name: 'Segunda-feira', idx: 1}, 
            {name: 'Terça-feira', idx: 2}, 
            {name: 'Quarta-feira', idx: 3}
        ];
        
        // Make Sunday open by default (Work)
        const newShifts: WorkShift[] = days.map((day, i) => ({
            id: (Date.now() + i + 100).toString(), // Ensure unique IDs
            branchId: newBranch.id,
            dayOfWeek: day.name,
            dayIndex: day.idx,
            date: '--/--', 
            startTime: '09:00',
            endTime: day.name === 'Sábado' ? '13:00' : '18:00',
            type: 'Work',
            totalHours: 8
        }));
        setShifts(prev => [...prev, ...newShifts]);
        // -----------------------------------------------------------

        // Create Super Admin User
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const newUser: User = {
            id: (Date.now() + 1).toString(),
            branchId: newBranch.id,
            name,
            email: normalizedEmail,
            password: pass,
            role: 'super_admin',
            phone,
            avatar: initials,
            themeColor: 'blue',
            jobTitle: 'Diretor'
        };
        
        setUsers(prev => [...prev, newUser]);
        
        // Auto Login
        setUser(newUser);
        setCurrentTheme('blue');
        setActiveTab('branches');
        
        resolve();
      }, 1000);
    });
  };

  const handleRecoverPassword = async (email: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (foundUser) {
          triggerNotification(`Email de recuperação enviado para ${email}`, 'email');
          setTimeout(() => {
             triggerNotification(`📧 [SIMULAÇÃO] Olá ${foundUser.name}, sua senha é: "${foundUser.password}"`, 'email');
          }, 1500);
          resolve();
        } else {
          reject(new Error("Email não encontrado"));
        }
      }, 1000);
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setNotifications([]);
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'avatar'>) => {
    const initials = newUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const userWithId: User = {
      ...newUser,
      id: Date.now().toString(),
      avatar: initials,
      themeColor: 'blue',
      // Auto-assign branch if not super admin
      branchId: newUser.branchId || (user?.role !== 'super_admin' ? user?.branchId : undefined)
    };
    setUsers([...users, userWithId]);
    alert(`Usuário ${newUser.name} cadastrado com sucesso!`);
  };

  const handleUpdateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    alert('Dados do usuário atualizados.');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    triggerNotification('Usuário removido com sucesso.', 'sms');
  };

  const handleAddJobTitle = (title: string) => {
    setAvailableJobTitles(prev => [...prev, title]);
  };

  const handleEditJobTitle = (oldTitle: string, newTitle: string) => {
    setAvailableJobTitles(prev => prev.map(t => t === oldTitle ? newTitle : t));
  };

  const handleDeleteJobTitle = (title: string) => {
    setAvailableJobTitles(prev => prev.filter(t => t !== title));
  };

  const handleAddBranch = (name: string, location: string) => {
      const newBranch: Branch = {
          id: Date.now().toString(),
          name,
          location
      };
      setBranches([...branches, newBranch]);
      
      // Create Default Shifts for this new branch
      // ORDERED: Quinta -> Quarta
      const days = [
          {name: 'Quinta-feira', idx: 4}, 
          {name: 'Sexta-feira', idx: 5}, 
          {name: 'Sábado', idx: 6}, 
          {name: 'Domingo', idx: 0}, 
          {name: 'Segunda-feira', idx: 1}, 
          {name: 'Terça-feira', idx: 2}, 
          {name: 'Quarta-feira', idx: 3}
      ];
      
      // Make Sunday open by default (Work)
      const newShifts: WorkShift[] = days.map((day, i) => ({
          id: Date.now().toString() + i,
          branchId: newBranch.id,
          dayOfWeek: day.name,
          dayIndex: day.idx,
          date: '--/--', // Placeholder
          startTime: '09:00',
          endTime: day.name === 'Sábado' ? '13:00' : '18:00',
          type: 'Work',
          totalHours: 8
      }));
      
      setShifts(prev => [...prev, ...newShifts]);
      alert(`Filial ${name} criada com sucesso!`);
  };

  const handleDeleteBranch = (id: string) => {
      if (window.confirm("Tem certeza? Isso não pode ser desfeito.")) {
          setBranches(prev => prev.filter(b => b.id !== id));
          // Clean up users and data related to branch? In a real app yes.
      }
  };

  const handleThemeChange = (newColor: ThemeColor) => {
    setCurrentTheme(newColor);
    if (user) {
        const updatedUser = { ...user, themeColor: newColor };
        setUser(updatedUser);
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  const handleUpdateAvatar = (file: File) => {
      if (!user) return;

      // Convert File to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          const updatedUser = { ...user, avatar: base64String };
          setUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
          triggerNotification("Foto de perfil atualizada com sucesso!", "sms");
      };
      reader.readAsDataURL(file);
  };

  const handleUpdateShifts = (updatedShifts: WorkShift[]) => {
    // Merge updated shifts back into main array
    // We only updated the visible shifts (current branch), so we replace them in the main array
    const otherShifts = shifts.filter(s => s.branchId !== currentBranchId);
    setShifts([...otherShifts, ...updatedShifts]);
    triggerNotification('Os horários padrão da empresa foram atualizados.', 'sms');
  };

  const handleUpdateDailySchedule = (schedule: DailySchedule) => {
    setDailySchedules(prev => {
        const filtered = prev.filter(s => !(s.userId === schedule.userId && s.date === schedule.date));
        return [...filtered, schedule];
    });
  };

  const handleBulkUpdateDailySchedule = (newSchedules: DailySchedule[]) => {
      setDailySchedules(prev => {
          // Remove any existing schedule that conflicts with new ones
          const filtered = prev.filter(s => !newSchedules.some(n => n.userId === s.userId && n.date === s.date));
          return [...filtered, ...newSchedules];
      });
      triggerNotification('Escala atualizada em lote (Férias).', 'sms');
  };

  const handleTogglePublishMonth = (monthKey: string) => {
    setPublishedMonths(prev => {
        const isPublished = prev.includes(monthKey);
        if (isPublished) {
            triggerNotification(`A escala de ${monthKey} foi ocultada da equipe.`, 'email');
            return prev.filter(m => m !== monthKey);
        } else {
            const [userId] = monthKey.split(':'); 
            const targetUser = users.find(u => u.id === userId);
            const userName = targetUser ? targetUser.name : 'Funcionário';
            triggerNotification(`🔔 Atenção: A escala de ${userName} foi publicada!`, 'sms');
            setTimeout(() => {
                triggerNotification(`📧 Aviso enviado: Escala disponível para consulta no app.`, 'email');
            }, 800);
            return [...prev, monthKey];
        }
    });
  };

  const handleToggleUserWeeklySchedule = (targetUserId: string) => {
    setUsers(prev => prev.map(u => {
        if (u.id === targetUserId) {
            const newState = !u.hideWeeklySchedule;
            triggerNotification(`Escala semanal ${newState ? 'OCULTA' : 'VISÍVEL'} para ${u.name}.`, 'sms');
            return { ...u, hideWeeklySchedule: newState };
        }
        return u;
    }));
  };

  const handleRequestOff = (date: string) => {
    if (!user || !currentBranchId) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newRequest: OffRequest = {
      id: Date.now().toString(),
      branchId: currentBranchId,
      userId: user.id,
      userName: user.name,
      date: date,
      status: 'pending',
      requestDate: `${formattedDate} ${formattedTime}`
    };
    setOffRequests(prev => [...prev, newRequest]);
  };

  const handleResolveRequest = (requestId: string, status: 'approved' | 'rejected') => {
    setOffRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status, resolutionDate: new Date().toISOString() } : req
    ));
    const request = offRequests.find(r => r.id === requestId);
    if (request) {
      const statusText = status === 'approved' ? 'APROVADA' : 'NEGADA';
      triggerNotification(`Sua solicitação de folga para ${request.date} foi ${statusText}.`, 'email');
      if (status === 'approved') {
          // FIX: Ensure day and month are 2 digits for YYYY-MM-DD format consistency with Calendar
          // Handle year turnover (if request is for next year)
          const [d, m] = request.date.split('/');
          const day = d.padStart(2, '0');
          const month = m.padStart(2, '0');
          
          const currentMonthIdx = new Date().getMonth() + 1;
          let year = new Date().getFullYear();
          
          // If request month (e.g. 01) is smaller than current month (e.g. 12), assume next year
          if (parseInt(month) < currentMonthIdx) {
              year += 1;
          }
          
          const dateStr = `${year}-${month}-${day}`;
          const newSchedule: DailySchedule = {
              id: Date.now().toString(),
              userId: request.userId,
              date: dateStr,
              type: 'SundayOff'
          };
          handleUpdateDailySchedule(newSchedule);
      }
    }
  };

  const handleDeleteRequest = (requestId: string) => {
    setOffRequests(prev => prev.filter(r => r.id !== requestId));
    triggerNotification('Solicitação removida com sucesso.', 'sms');
  };

  const handleToggleSundayOff = () => {
    const newState = !isSundayOffEnabled;
    setIsSundayOffEnabled(newState);
    if (newState === true) {
      triggerNotification('A agenda para solicitação de folgas de Domingo está ABERTA.', 'sms');
    } else {
      triggerNotification('A agenda para solicitação de folgas de Domingo foi FECHADA.', 'email');
    }
  };

  // NEW: Toggle Weekly Schedule
  const handleToggleWeeklySchedule = () => {
      const newState = !isWeeklyScheduleEnabled;
      setIsWeeklyScheduleEnabled(newState);
      triggerNotification(`A escala semanal foi ${newState ? 'HABILITADA' : 'DESABILITADA'} para os funcionários.`, 'sms');
  };

  const handleUpload = async (title: string, description: string, type: ContentType, file?: File, durationDays?: number | null) => {
    if (!user || !currentBranchId) return;
    
    // AI Analysis REMOVED
    
    let expirationDate;
    if (durationDays) {
        const date = new Date();
        date.setDate(date.getDate() + durationDays);
        expirationDate = date.toISOString();
    }

    const newItem: any = {
      id: Date.now().toString(),
      branchId: currentBranchId,
      title,
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
      author: user.name,
      type: ContentType.ANNOUNCEMENT,
      content: description,
      expirationDate
    };

    setItems(prev => [newItem, ...prev]);
    triggerNotification(`Novo comunicado: ${title}`, 'email');
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
        setItems(prev => prev.filter(item => item.id !== id));
        triggerNotification('Comunicado excluído com sucesso.', 'sms');
    }
  };

  const handleSendDirectMessage = (userId: string, message: string, file?: File) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !targetUser.branchId) return;

    // Helper function to create message after potential file processing
    const createMessage = (attachment?: { name: string, url: string, type: 'PDF'|'IMAGE' }) => {
        const newMsg: DirectMessage = {
            id: Date.now().toString(),
            branchId: targetUser.branchId!,
            userId,
            message,
            date: new Date().toLocaleDateString('pt-BR'),
            read: false,
            attachment
        };
        setDirectMessages(prev => [newMsg, ...prev]);
        triggerNotification(`Mensagem enviada para o funcionário.`, 'sms');
    };

    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            createMessage({
                name: file.name,
                url: base64,
                type: file.type.includes('pdf') ? 'PDF' : 'IMAGE'
            });
        };
        reader.readAsDataURL(file);
    } else {
        createMessage();
    }
  };

  const handleMarkMessageRead = (id: string) => {
    setDirectMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (!user) {
    return <Login onLogin={handleLogin} onRecoverPassword={handleRecoverPassword} onRegister={handleRegister} />;
  }

  const myMessages = directMessages.filter(m => m.userId === user.id);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full px-4 md:px-0 pointer-events-none">
        {activeToasts.map(toast => (
          <div key={toast.id} className="bg-white text-slate-800 border border-slate-200 px-4 py-3 rounded-lg shadow-xl flex items-center text-sm animate-fade-in-left pointer-events-auto">
            {toast.type === 'email' ? <Mail size={16} className="mr-3 text-blue-500 shrink-0" /> : <Smartphone size={16} className="mr-3 text-green-500 shrink-0" />}
            <span className="break-words font-medium">{toast.msg}</span>
          </div>
        ))}
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
        themeColor={currentTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative">
        
        {/* Fixed Header */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 px-4 py-4 md:px-8 flex items-center justify-between transition-all duration-300 h-20 shadow-sm md:shadow-none">
           <div className="flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="mr-4 md:hidden p-2 text-slate-600">
              <Menu />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-none">
                {user.role === 'super_admin' && activeTab === 'branches' && 'Gestão de Unidades'}
                {activeTab === 'dashboard' && `Bom dia, ${user.name.split(' ')[0]} 👋`}
                {activeTab === 'schedule' && 'Escalas de Trabalho'}
                {activeTab === 'announcements' && 'Comunicados'}
                {activeTab === 'team' && 'Equipe e Acessos'}
                {activeTab === 'settings' && 'Preferências'}
              </h1>
              {user.branchId && activeTab === 'dashboard' && (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 hidden md:inline-block">
                      {branches.find(b => b.id === user.branchId)?.name}
                  </span>
              )}
            </div>
           </div>
           
           <div className="flex items-center space-x-3 md:space-x-6 relative">
             {/* Notifications Bell */}
             <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-slate-400 hover:text-slate-600 transition-colors relative p-2 rounded-full hover:bg-slate-100 outline-none"
                >
                    <Bell size={22} />
                    {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-800">Notificações</h4>
                        {notifications.length > 0 && (
                          <button onClick={handleClearNotifications} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Limpar tudo
                          </button>
                        )}
                     </div>
                     <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">Nenhuma nova notificação</div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                               <div className="flex items-start space-x-3">
                                  <div className={`mt-0.5 p-1.5 rounded-full ${notif.title.includes('Email') ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                     {notif.title.includes('Email') ? <Mail size={12} /> : <Smartphone size={12} />}
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-700 leading-snug">{notif.message}</p>
                                    <span className="text-[10px] text-slate-400 mt-1 block">{notif.date}</span>
                                  </div>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}
             </div>
              <div className="hidden md:flex w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-black text-white items-center justify-center text-sm font-bold shadow-lg border border-slate-700 overflow-hidden">
                 {user.avatar.length > 5 ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                    user.avatar
                 )}
              </div>
              
              {user.role === 'admin' && activeTab !== 'team' && activeTab !== 'settings' && activeTab !== 'schedule' && (
                <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`hidden md:flex bg-${currentTheme}-600 hover:bg-${currentTheme}-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-${currentTheme}-600/20 items-center`}
                >
                    <Plus size={18} className="mr-2" />
                    Novo Item
                </button>
               )}
           </div>
        </header>

        {/* Content Wrapper with padding-top to account for fixed header */}
        <div className="p-4 md:p-8 pt-24 md:pt-28 max-w-6xl mx-auto">
          
          {/* SUPER ADMIN: BRANCH MANAGEMENT */}
          {user.role === 'super_admin' && activeTab === 'branches' && (
              <BranchManagement 
                  branches={branches} 
                  onAddBranch={handleAddBranch} 
                  onDeleteBranch={handleDeleteBranch} 
              />
          )}

          {activeTab === 'dashboard' && (
             <div className="space-y-10 animate-fade-in">
                  {myMessages.length > 0 && (
                    <div className="space-y-3">
                        {myMessages.map(msg => (
                            <div key={msg.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start justify-between animate-fade-in-up shadow-sm">
                                <div className="flex items-start space-x-3 flex-1">
                                    <MessageSquare size={20} className="text-amber-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-amber-800 mb-1">Lembrete da Administração</h4>
                                        <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                        
                                        {msg.attachment && (
                                            <div className="mt-3">
                                                <a 
                                                    href={msg.attachment.url} 
                                                    download={msg.attachment.name}
                                                    className="inline-flex items-center px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                                                >
                                                    <Paperclip size={12} className="mr-1.5" />
                                                    {msg.attachment.type === 'PDF' ? 'Baixar PDF' : 'Ver Imagem'}: {msg.attachment.name}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleMarkMessageRead(msg.id)}
                                    className="ml-3 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
                                >
                                    Entendido
                                </button>
                            </div>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className={`bg-gradient-to-br from-${currentTheme}-600 to-${currentTheme}-700 p-6 rounded-2xl shadow-lg shadow-${currentTheme}-500/20 text-white flex flex-col justify-between relative overflow-hidden order-first`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div>
                            <p className={`text-${currentTheme}-50 text-sm font-medium mb-1`}>Próximo Turno</p>
                            <p className="text-3xl font-bold">{nextShift.time}</p>
                            <p className={`text-sm text-${currentTheme}-100 mt-1`}>{nextShift.info}</p>
                        </div>
                     </div>
                     <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-${currentTheme}-200 transition-colors`}>
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Avisos Recentes</p>
                            <p className="text-3xl font-bold text-slate-800">{announcements.length}</p>
                        </div>
                        <div className={`w-12 h-12 bg-${currentTheme}-50 rounded-full flex items-center justify-center text-${currentTheme}-600 group-hover:scale-110 transition-transform`}>
                            <span className="font-bold">!</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Announcements 
                                items={announcements.slice(0, 3)} 
                                themeColor={currentTheme} 
                                userRole={user.role}
                                onDelete={handleDeleteAnnouncement}
                            />
                        </div>
                  </div>
             </div>
          )}

          {activeTab === 'schedule' && user.role !== 'super_admin' && (
            <Schedule 
              shifts={visibleShifts} 
              dailySchedules={dailySchedules}
              themeColor={currentTheme} 
              userRole={user.role}
              userId={user.id}
              users={visibleUsers}
              requests={visibleRequests}
              publishedMonths={publishedMonths}
              onUpdateShifts={handleUpdateShifts}
              onUpdateDailySchedule={handleUpdateDailySchedule}
              onBulkUpdateDailySchedule={handleBulkUpdateDailySchedule}
              onRequestOff={handleRequestOff}
              onResolveRequest={handleResolveRequest}
              onDeleteRequest={handleDeleteRequest}
              onTogglePublish={handleTogglePublishMonth}
              onToggleUserWeeklySchedule={handleToggleUserWeeklySchedule} // NEW PROP
              isSundayOffEnabled={isSundayOffEnabled}
              isWeeklyScheduleEnabled={isWeeklyScheduleEnabled}
            />
          )}

          {activeTab === 'announcements' && (
            <Announcements 
              items={announcements} 
              themeColor={currentTheme} 
              userRole={user.role}
              onDelete={handleDeleteAnnouncement}
            />
          )}
          
          {activeTab === 'team' && (user.role === 'admin' || user.role === 'super_admin') && (
            <TeamManagement 
                users={visibleUsers} 
                currentUserRole={user.role}
                branches={branches}
                availableJobTitles={availableJobTitles}
                onAddUser={handleAddUser} 
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onAddJobTitle={handleAddJobTitle}
                onEditJobTitle={handleEditJobTitle}
                onDeleteJobTitle={handleDeleteJobTitle}
                onSendMessage={handleSendDirectMessage} 
            />
          )}
          
          {activeTab === 'settings' && (
            <Settings 
              user={user} 
              currentTheme={currentTheme} 
              onThemeChange={handleThemeChange} 
              isSundayOffEnabled={isSundayOffEnabled}
              onToggleSundayOff={handleToggleSundayOff}
              isWeeklyScheduleEnabled={isWeeklyScheduleEnabled}
              onToggleWeeklySchedule={handleToggleWeeklySchedule}
              onUpdateAvatar={handleUpdateAvatar}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {user.role === 'admin' && activeTab !== 'team' && activeTab !== 'settings' && activeTab !== 'schedule' && (
        <>
          <UploadModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)} 
            onSubmit={handleUpload}
          />
          <button onClick={() => setIsUploadModalOpen(true)} className={`md:hidden fixed bottom-6 right-6 w-14 h-14 bg-${currentTheme}-600 text-white rounded-full shadow-xl flex items-center justify-center z-40`}>
            <Plus size={24} />
          </button>
        </>
      )}
    </div>
  );
}
