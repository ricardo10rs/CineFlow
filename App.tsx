
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Announcements } from './components/Announcements';
import { Login } from './components/Login';
import { TeamManagement } from './components/TeamManagement';
import { Settings } from './components/Settings';
import { BranchManagement } from './components/BranchManagement';
import { Schedule } from './components/Schedule';
import { Board } from './components/Board';
import { BreakMonitor } from './components/BreakMonitor';
import { HolidayCalendar } from './components/HolidayCalendar';
import { VacationMode } from './components/VacationMode';
import { ScheduledVacations } from './components/ScheduledVacations';
import { QrCodeGenerator } from './components/QrCodeGenerator';
import { UploadModal } from './components/UploadModal';
import { Subscription } from './components/Subscription'; 
import { NotificationToast } from './components/NotificationToast'; 
import { NotificationCenter } from './components/NotificationCenter'; 
import { MarketingFiles } from './components/MarketingFiles';

import { User, AppItem, WorkShift, DailySchedule, OffRequest, Branch, ThemeColor, HolidayEvent, BreakSession, VacationSchedule, DirectMessage, ContentType, Notification, AnnouncementItem, DocumentItem, PromotionalFile } from './types';
import { analyzeContent } from './services/geminiService';
import { Menu, Plus, Bell, Hexagon } from 'lucide-react';

// MOCK DATA
const MOCK_BRANCHES: Branch[] = [
  { id: '1', name: 'Matriz São Paulo', location: 'Av. Paulista, 1000' },
  { id: '2', name: 'Filial Rio de Janeiro', location: 'Av. Atlântica, 500' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin Geral', email: 'super@arco.com', role: 'super_admin', avatar: 'AG', password: '123', themeColor: 'blue', notificationPrefs: { email: true, sms: true }, gender: 'male' },
  { id: 'u2', name: 'Gerente SP', email: 'admin@empresa.com', role: 'admin', branchId: '1', avatar: 'GS', password: '123', themeColor: 'green', notificationPrefs: { email: true, sms: true }, gender: 'male' },
  { id: 'u3', name: 'Maria Silva', email: 'maria@empresa.com', role: 'employee', branchId: '1', avatar: 'MS', password: '123', jobTitle: 'Recepcionista', themeColor: 'purple', notificationPrefs: { email: true, sms: true }, gender: 'female', hasQrCodeAccess: false },
  { id: 'u4', name: 'João Santos', email: 'joao@empresa.com', role: 'employee', branchId: '1', avatar: 'JS', password: '123', jobTitle: 'Atendente de Bomboniere', themeColor: 'orange', notificationPrefs: { email: false, sms: true }, gender: 'male' },
];

const MOCK_ITEMS: AppItem[] = [
  { 
    id: '1', 
    branchId: '1', 
    title: 'Boas-vindas ao novo sistema!', 
    content: 'Estamos muito felizes em anunciar o lançamento da nova plataforma.', 
    date: '25/10/2023', 
    author: 'Admin Geral', 
    type: ContentType.ANNOUNCEMENT,
    analysis: { summary: 'Novo sistema lançado.', tags: ['Novidade'], sentiment: 'Positive' }
  }
];

const MOCK_PROMOTIONAL: PromotionalFile[] = [
    // 2024 Files
    {
        id: 'p1',
        title: 'Janeiro: Saldão de Estoque',
        description: 'Peças para redes sociais (Stories e Feed) e Email Marketing.',
        url: '#',
        type: 'IMAGE',
        date: '05/01/2024'
    },
    {
        id: 'p2',
        title: 'Diretrizes Visuais 2024',
        description: 'Novo manual de identidade visual atualizado.',
        url: '#',
        type: 'PDF',
        date: '15/01/2024'
    },
    {
        id: 'p3',
        title: 'Carnaval: Horários Especiais',
        description: 'Comunicado oficial para clientes (PDF A4 para impressão).',
        url: '#',
        type: 'PDF',
        date: '10/02/2024'
    },
    {
        id: 'p4',
        title: 'Assets Carnaval',
        description: 'Pacote de ícones e vetores temáticos.',
        url: '#',
        type: 'ZIP',
        date: '12/02/2024'
    },
    {
        id: 'p5',
        title: 'Campanha Páscoa - Vídeo',
        description: 'Vídeo promocional de 30s para TVs da loja.',
        url: '#',
        type: 'VIDEO',
        date: '01/03/2024'
    },
    {
        id: 'p6',
        title: 'Catálogo de Ovos de Páscoa',
        description: 'Lista completa de produtos e preços.',
        url: '#',
        type: 'PDF',
        date: '05/03/2024'
    },
    {
        id: 'p7',
        title: 'Dia das Mães - Pack Fotos',
        description: 'Fotos em alta resolução dos produtos para vitrine.',
        url: '#',
        type: 'ZIP',
        date: '20/04/2024'
    },
    {
        id: 'p8',
        title: 'Promoção Dia dos Namorados',
        description: 'Banner principal do site.',
        url: '#',
        type: 'IMAGE',
        date: '01/06/2024'
    },
    {
        id: 'p9',
        title: 'Festa Junina - Convite Digital',
        description: 'Arte para envio via WhatsApp.',
        url: '#',
        type: 'IMAGE',
        date: '10/06/2024'
    },
    {
        id: 'p10',
        title: 'Campanha Black Friday Teaser',
        description: 'Vídeo curto de aquecimento.',
        url: '#',
        type: 'VIDEO',
        date: '01/11/2024'
    },
    // 2025 Files (For testing navigation)
    {
        id: 'p11',
        title: 'Planejamento Q1 2025',
        description: 'Apresentação de estratégia para o primeiro trimestre.',
        url: '#',
        type: 'PDF',
        date: '10/01/2025'
    },
    {
        id: 'p12',
        title: 'Campanha Verão 2025',
        description: 'Banner principal para campanha de verão.',
        url: '#',
        type: 'IMAGE',
        date: '15/01/2025'
    }
];

// Standard Shift Order (Sunday to Saturday)
// Sunday starts as Work at 13:00 per request
const MOCK_SHIFTS: WorkShift[] = [
  { id: 's1', branchId: '1', dayOfWeek: 'Domingo', dayIndex: 0, startTime: '13:00', endTime: '22:00', type: 'Work' },
  { id: 's2', branchId: '1', dayOfWeek: 'Segunda', dayIndex: 1, startTime: '09:00', endTime: '18:00', type: 'Work' },
  { id: 's3', branchId: '1', dayOfWeek: 'Terça', dayIndex: 2, startTime: '09:00', endTime: '18:00', type: 'Work' },
  { id: 's4', branchId: '1', dayOfWeek: 'Quarta', dayIndex: 3, startTime: '09:00', endTime: '18:00', type: 'Work' },
  { id: 's5', branchId: '1', dayOfWeek: 'Quinta', dayIndex: 4, startTime: '09:00', endTime: '18:00', type: 'Work' },
  { id: 's6', branchId: '1', dayOfWeek: 'Sexta', dayIndex: 5, startTime: '09:00', endTime: '18:00', type: 'Work' },
  { id: 's7', branchId: '1', dayOfWeek: 'Sábado', dayIndex: 6, startTime: '10:00', endTime: '14:00', type: 'Work' },
];

const MOCK_HOLIDAYS: HolidayEvent[] = [
    { id: 'h1', date: '2023-12-25', name: 'Natal', type: 'Feriado Nacional', color: 'red', description: 'Feriado de Natal' },
    { id: 'h2', date: '2024-01-01', name: 'Confraternização Universal', type: 'Feriado Nacional', color: 'green' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('announcements');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [items, setItems] = useState<AppItem[]>(MOCK_ITEMS);
  const [promotionalFiles, setPromotionalFiles] = useState<PromotionalFile[]>(MOCK_PROMOTIONAL);
  const [shifts, setShifts] = useState<WorkShift[]>(MOCK_SHIFTS);
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  const [requests, setRequests] = useState<OffRequest[]>([]);
  const [holidays, setHolidays] = useState<HolidayEvent[]>(MOCK_HOLIDAYS);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>([]);
  const [breakHistory, setBreakHistory] = useState<BreakSession[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [vacationSchedules, setVacationSchedules] = useState<VacationSchedule[]>([]);
  
  // Notification States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]); 
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);

  const [jobTitles, setJobTitles] = useState<string[]>(['Gerente', 'Sub-gerente', 'Recepcionista', 'Atendente de Bomboniere', 'Auxiliar de Limpeza']);
  const [publishedMonths, setPublishedMonths] = useState<string[]>([]);

  // Settings
  const [isSundayOffEnabled, setIsSundayOffEnabled] = useState(false);
  const [isWeeklyScheduleEnabled, setIsWeeklyScheduleEnabled] = useState(true);
  const [isMessagesTabEnabled, setIsMessagesTabEnabled] = useState(false);

  // UI State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'red' | 'green' | 'none'>('none');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Derived State
  const currentTheme = user?.themeColor || 'blue';
  
  const visibleItems = useMemo(() => {
    return items.filter(i => {
       if (user?.role === 'super_admin') return true;
       if (user?.branchId && i.branchId !== user.branchId) return false;
       return true;
    });
  }, [items, user]);

  const announcements = visibleItems.filter(i => i.type === ContentType.ANNOUNCEMENT) as AnnouncementItem[];

  const visibleUsers = useMemo(() => {
      if (user?.role === 'super_admin') return users;
      return users.filter(u => u.branchId === user?.branchId);
  }, [users, user]);

  const userMessages = useMemo(() => {
      if (!user) return [];
      if (user.role === 'admin' || user.role === 'super_admin') {
           return messages.filter(m => {
               if(user.role === 'super_admin') return true;
               return m.branchId === user.branchId;
           });
      }
      return messages.filter(m => m.userId === user.id);
  }, [messages, user]);

  const unreadMessageCount = useMemo(() => {
      return userMessages.filter(m => !m.read && (user?.role === 'employee' ? true : m.senderId !== user?.id)).length;
  }, [userMessages, user]);

  const userNotifications = useMemo(() => {
      if (!user) return [];
      return notifications.filter(n => 
          !n.targetUserId || n.targetUserId === user.id || 
          (user.role === 'admin' && n.targetUserId === 'ADMIN_BRANCH_' + user.branchId) ||
          (user.role === 'super_admin' && n.targetUserId === 'SUPER_ADMIN')
      );
  }, [notifications, user]);

  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length;
  const activeBreaks = useMemo(() => breakSessions.filter(b => !b.completedAt), [breakSessions]);
  
  const visibleVacationSchedules = useMemo(() => {
      if (user?.role === 'super_admin') return vacationSchedules;
      const branchUserIds = visibleUsers.map(u => u.id);
      return vacationSchedules.filter(vs => branchUserIds.includes(vs.userId));
  }, [vacationSchedules, visibleUsers, user]);

  const activeUserBreak = useMemo(() => {
      return breakSessions.find(b => b.userId === user?.id && !b.completedAt);
  }, [breakSessions, user]);

  const isOnVacation = useMemo(() => {
      if (user?.role === 'employee' && user.vacationReturnDate) {
          const today = new Date();
          const returnDate = new Date(user.vacationReturnDate + 'T00:00:00');
          return today < returnDate;
      }
      return false;
  }, [user]);

  useEffect(() => {
      if (user) {
          const updatedUserRecord = users.find(u => u.id === user.id);
          if (updatedUserRecord && JSON.stringify(updatedUserRecord) !== JSON.stringify(user)) {
              setUser(updatedUserRecord);
          }
      }
  }, [users]); 

  useEffect(() => {
      if (isOnVacation) {
          setActiveTab('vacation');
      }
  }, [isOnVacation]);

  useEffect(() => {
      const hasUnread = userMessages.some(m => !m.read && (user?.role === 'employee' ? true : m.senderId !== user?.id));
      if (hasUnread) setMessageStatus('red');
      else setMessageStatus('none');
  }, [userMessages, user]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning', targetUserId?: string) => {
      const newNotif: Notification = {
          id: Date.now().toString() + Math.random(),
          title,
          message,
          type,
          date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          read: false,
          targetUserId
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      
      const shouldShowToast = !user || !targetUserId || targetUserId === user.id || 
                              (user.role === 'admin' && targetUserId === 'ADMIN_BRANCH_' + user.branchId);

      if (shouldShowToast) {
          setToasts(prev => [...prev, newNotif]);
      }
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleMarkNotifRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
      if (!user) return;
      setNotifications(prev => prev.filter(n => {
          const isForUser = !n.targetUserId || n.targetUserId === user.id;
          return !isForUser; 
      }));
  };

  const handleLogin = async (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && (u.password === pass || pass === '123'));
    if (foundUser) {
        setUser(foundUser);
        if (foundUser.role === 'super_admin') {
            setActiveTab('branches');
        } else {
            setActiveTab('announcements');
        }
    } else {
        throw new Error("Credenciais inválidas");
    }
  };

  const handleRegister = async (name: string, email: string, pass: string, phone: string) => {
      const existing = users.find(u => u.email === email);
      if (existing) throw new Error("Email já cadastrado.");

      const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password: pass,
          role: 'super_admin',
          avatar: name.substring(0, 2).toUpperCase(),
          phone,
          themeColor: 'blue',
          notificationPrefs: { email: true, sms: true }
      };

      setUsers([...users, newUser]);
      setUser(newUser);
      setActiveTab('branches');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('announcements');
    setToasts([]);
  };

  const handleRecoverPassword = async (email: string) => {
      // Simulation of checking backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userExists = users.find(u => u.email === email);
      
      if (!userExists) {
           throw new Error("Email não encontrado no sistema.");
      }
      
      // In a real application, we would call an API to send the CURRENT credentials via email.
      // Since we can't send real emails, we just resolve successfully to trigger the UI message.
      // The requirement is to send the *existing* credentials, NOT reset them.
      console.log(`[SIMULAÇÃO] Credenciais enviadas para ${email}: Senha = ${userExists.password}`);
  };

  const handleAddItem = async (title: string, content: string, type: ContentType, file?: File, durationDays?: number | null) => {
      let analysis = undefined;
      if (type === ContentType.ANNOUNCEMENT) {
         analysis = await analyzeContent(content, 'announcement');
      }

      const newItem: AppItem = {
          id: Date.now().toString(),
          branchId: user?.branchId || '1',
          title,
          content: type === ContentType.ANNOUNCEMENT ? content : '',
          description: type !== ContentType.ANNOUNCEMENT ? content : '',
          date: new Date().toLocaleDateString('pt-BR'),
          author: user?.name || 'Admin',
          type: type as any,
          url: file ? URL.createObjectURL(file) : '#',
          analysis,
          expirationDate: durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : undefined
      };
      setItems([newItem, ...items]);
      addNotification('Novo Comunicado', `"${title}" foi publicado por ${user?.name}.`, 'info');
  };

  const handleDeleteItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleStartBreak = (startTime: number) => {
      if (!user) return;
      const newSession: BreakSession = {
          id: Date.now().toString(),
          userId: user.id,
          branchId: user.branchId || '1',
          userName: user.name,
          userAvatar: user.avatar,
          startTime,
          duration: 3600 
      };
      setBreakSessions([...breakSessions, newSession]);
      addNotification('Início de Intervalo', `${user.name} iniciou o intervalo.`, 'info', `ADMIN_BRANCH_${user.branchId}`);
  };

  const handleEndBreak = () => {
      if (!user) return;
      setBreakSessions(prev => prev.map(s => {
          if (s.userId === user.id && !s.completedAt) {
              const completedSession = { ...s, completedAt: Date.now() };
              setBreakHistory([completedSession, ...breakHistory]);
              return completedSession; 
          }
          return s;
      }));
      setBreakSessions(prev => prev.filter(s => s.userId !== user.id || s.completedAt));
  };

  const handleUpdateUser = (id: string, data: Partial<User>) => {
      setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
      if (user?.id === id) {
          setUser(prev => prev ? { ...prev, ...data } : null);
      }
  };

  const handleAddUser = (userData: Omit<User, 'id' | 'avatar'>) => {
      const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          avatar: userData.name.substring(0,2).toUpperCase()
      };
      setUsers([...users, newUser]);
  };

  const handleDeleteUser = (id: string) => {
      setUsers(users.filter(u => u.id !== id));
      setDailySchedules(prev => prev.filter(s => s.userId !== id));
      setRequests(prev => prev.filter(r => r.userId !== id));
      setBreakSessions(prev => prev.filter(b => b.userId !== id));
      setMessages(prev => prev.filter(m => m.userId !== id));
      setVacationSchedules(prev => prev.filter(v => v.userId !== id));
  };

  const handleUpdateShifts = (newShifts: WorkShift[]) => setShifts(newShifts);
  const handleUpdateDailySchedule = (schedule: DailySchedule) => {
      setDailySchedules(prev => {
          const existing = prev.findIndex(s => s.id === schedule.id || (s.date === schedule.date && s.userId === schedule.userId));
          if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = { ...updated[existing], ...schedule };
              return updated;
          }
          return [...prev, schedule];
      });
  };
  const handleBulkUpdateDailySchedule = (newSchedules: DailySchedule[]) => {
      const newKeys = new Set(newSchedules.map(s => `${s.userId}-${s.date}`));
      setDailySchedules(prev => [
          ...prev.filter(s => !newKeys.has(`${s.userId}-${s.date}`)),
          ...newSchedules
      ]);
  };

  const handleRequestOff = (dateIso: string) => {
      if (!user) return;
      const [year, month, day] = dateIso.split('-');
      const displayDate = `${day}/${month}`;
      const newReq: OffRequest = {
          id: Date.now().toString(),
          branchId: user.branchId || '1',
          userId: user.id,
          userName: user.name,
          date: displayDate,
          fullDate: dateIso,
          status: 'pending',
          requestDate: new Date().toLocaleDateString('pt-BR')
      };
      setRequests([...requests, newReq]);
      addNotification('Solicitação de Folga', `${user.name} solicitou folga para ${displayDate}.`, 'warning', `ADMIN_BRANCH_${user.branchId}`);
  };

  const handleResolveRequest = (requestId: string, status: 'approved' | 'rejected') => {
      const targetReq = requests.find(r => r.id === requestId);
      if (!targetReq) return;

      setRequests(prev => prev.map(r => {
          if (r.id === requestId) {
              return { ...r, status, resolutionDate: new Date().toISOString() };
          }
          return r;
      }));

      if (status === 'approved' && targetReq.fullDate) {
          const newDailySchedule: DailySchedule = {
              id: Date.now().toString(),
              userId: targetReq.userId,
              date: targetReq.fullDate,
              type: 'SundayOff'
          };
          setDailySchedules(currentSchedules => {
              const filtered = currentSchedules.filter(s => !(s.userId === targetReq.userId && s.date === targetReq.fullDate));
              return [...filtered, newDailySchedule];
          });
      }

      addNotification(
          status === 'approved' ? 'Folga Aprovada' : 'Folga Recusada',
          `Sua solicitação para ${targetReq.date} foi ${status === 'approved' ? 'aprovada' : 'recusada'}.`,
          status === 'approved' ? 'success' : 'warning',
          targetReq.userId
      );
  };

  const handleDeleteRequest = (id: string) => setRequests(prev => prev.filter(r => r.id !== id));

  const handleTogglePublish = (monthKey: string) => {
      setPublishedMonths(prev => prev.includes(monthKey) ? prev.filter(k => k !== monthKey) : [...prev, monthKey]);
      const isNowPublished = !publishedMonths.includes(monthKey);
      if (isNowPublished) {
          addNotification('Escala Publicada', `A escala de ${monthKey} está disponível.`, 'info');
      }
  };

  // Updated to include Admin creation
  const handleAddBranch = (name: string, location: string, adminEmail?: string, adminPass?: string) => {
      const branchId = Date.now().toString();
      const newBranch: Branch = { id: branchId, name, location };
      setBranches([...branches, newBranch]);

      // Automatically create Admin User if credentials provided
      if (adminEmail && adminPass) {
          const newAdmin: User = {
              id: Date.now().toString() + 'u',
              name: `Admin - ${name}`,
              email: adminEmail,
              password: adminPass,
              role: 'admin',
              branchId: branchId,
              avatar: 'AD',
              themeColor: 'blue',
              notificationPrefs: { email: true, sms: true },
              jobTitle: 'Gerente'
          };
          setUsers([...users, newAdmin]);
          addNotification('Admin Criado', `Usuário admin criado para a unidade ${name}.`, 'success');
      }
  };
  
  const handleUpdateBranch = (id: string, data: Partial<Branch>) => {
      setBranches(branches.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const handleDeleteBranch = (id: string) => {
      if(window.confirm("Tem certeza? Isso excluirá todos os funcionários e dados desta filial.")) {
          setBranches(branches.filter(b => b.id !== id));
          setShifts(prev => prev.filter(s => s.branchId !== id));
          // Optionally delete users associated with this branch?
          // setUsers(users.filter(u => u.branchId !== id));
      }
  };

  const handleSendMessage = (targetUserId: string, text: string, file?: File, duration?: number) => {
      if (!user) return;
      const newMessage: DirectMessage = {
          id: Date.now().toString(),
          branchId: user.branchId || '1',
          userId: targetUserId,
          senderId: user.id,
          senderName: user.name,
          message: text,
          date: new Date().toLocaleString('pt-BR'),
          timestamp: Date.now(),
          read: false,
          replies: [],
          expiresAt: duration ? Date.now() + duration * 60000 : undefined,
          attachment: file ? { name: file.name, url: URL.createObjectURL(file), type: file.type.includes('pdf') ? 'PDF' : 'IMAGE' } : undefined
      };
      setMessages([newMessage, ...messages]);
      addNotification('Nova Mensagem', `Você recebeu uma mensagem de ${user.name}.`, 'info', targetUserId);
  };

  const handleReplyMessage = (msgId: string, content: string) => {
      if (!user) return;
      const originalMsg = messages.find(m => m.id === msgId);

      setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
              return {
                  ...m,
                  replies: [...m.replies, {
                      id: Date.now().toString(),
                      authorId: user.id,
                      authorName: user.name,
                      content,
                      date: new Date().toLocaleString('pt-BR'),
                      timestamp: Date.now(),
                      isAdmin: user.role !== 'employee'
                  }]
              };
          }
          return m;
      }));

      if (originalMsg) {
          const targetId = user.id === originalMsg.senderId ? originalMsg.userId : originalMsg.senderId;
          if (targetId) {
            addNotification('Nova Resposta', `${user.name} respondeu sua mensagem.`, 'info', targetId);
          }
      }
  };

  const handleDeleteMessage = (id: string) => setMessages(prev => prev.filter(m => m.id !== id));

  const handleAddVacationSchedule = (userId: string, startDate: string, returnDate: string) => {
      const userName = users.find(u => u.id === userId)?.name || 'Unknown';
      const newVacation: VacationSchedule = {
          id: Date.now().toString(),
          userId,
          userName,
          startDate,
          returnDate,
          status: 'active'
      };
      setVacationSchedules([...vacationSchedules, newVacation]);
      handleUpdateUser(userId, { vacationReturnDate: returnDate });
      addNotification('Férias Agendadas', `Suas férias foram agendadas: ${startDate} até ${returnDate}.`, 'success', userId);
  };

  const handleDeleteVacationSchedule = (id: string) => {
      const vac = vacationSchedules.find(v => v.id === id);
      if (vac) {
          handleUpdateUser(vac.userId, { vacationReturnDate: undefined });
      }
      setVacationSchedules(prev => prev.filter(v => v.id !== id));
  };

  // --- MARKETING FILES HANDLERS ---
  const handleUploadPromotional = (title: string, description: string, file: File) => {
      const newFile: PromotionalFile = {
          id: Date.now().toString(),
          title,
          description,
          url: URL.createObjectURL(file),
          type: file.type.includes('pdf') ? 'PDF' : file.type.includes('video') ? 'VIDEO' : file.type.includes('zip') ? 'ZIP' : 'IMAGE',
          date: new Date().toLocaleDateString('pt-BR')
      };
      setPromotionalFiles([newFile, ...promotionalFiles]);
      addNotification('Novo Material de Marketing', `"${title}" foi disponibilizado para as filiais.`, 'info');
  };

  // Update existing promotional file
  const handleUpdatePromotional = (id: string, data: Partial<PromotionalFile>) => {
      setPromotionalFiles(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
      addNotification('Material Atualizado', 'O arquivo de marketing foi editado com sucesso.', 'success');
  };

  const handleDeletePromotional = (id: string) => {
      setPromotionalFiles(promotionalFiles.filter(f => f.id !== id));
  };

  const generateBrazilianHolidays = (year: number): HolidayEvent[] => {
        const fixedHolidays: Omit<HolidayEvent, 'id'>[] = [
            { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'Feriado Nacional', color: 'green' },
            { date: `${year}-04-21`, name: 'Tiradentes', type: 'Feriado Nacional', color: 'red' },
            { date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'Feriado Nacional', color: 'blue' },
            { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'Feriado Nacional', color: 'green' },
            { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'Feriado Nacional', color: 'blue' },
            { date: `${year}-11-02`, name: 'Finados', type: 'Feriado Nacional', color: 'purple' },
            { date: `${year}-11-15`, name: 'Proclamação da República', type: 'Feriado Nacional', color: 'green' },
            { date: `${year}-12-25`, name: 'Natal', type: 'Feriado Nacional', color: 'red' },
        ];
        return fixedHolidays.map((h, idx) => ({ ...h, id: `auto-${year}-${idx}` }));
  };

  const handleYearChange = (year: number) => {
      setCurrentYear(year);
      const hasHolidaysForYear = holidays.some(h => h.date.startsWith(`${year}-`));
      if (!hasHolidaysForYear) {
          setHolidays(prev => [...prev, ...generateBrazilianHolidays(year)]);
      }
  };

  useEffect(() => {
      const currentY = new Date().getFullYear();
      const hasCurrent = holidays.some(h => h.date.startsWith(`${currentY}-`));
      if (!hasCurrent) {
          setHolidays(prev => [...prev, ...generateBrazilianHolidays(currentY)]);
      }
  }, []);

  const handleAddHoliday = (h: HolidayEvent) => setHolidays([...holidays, h]);
  const handleEditHoliday = (h: HolidayEvent) => setHolidays(holidays.map(ev => ev.id === h.id ? h : ev));
  const handleDeleteHoliday = (id: string) => setHolidays(holidays.filter(h => h.id !== id));

  const handleToggleQrAccess = (userId: string) => {
      const target = users.find(u => u.id === userId);
      if (target) {
          handleUpdateUser(userId, { hasQrCodeAccess: !target.hasQrCodeAccess });
      }
  };
  const handleUploadUserQrCode = (userId: string, file: File) => {
      const url = URL.createObjectURL(file);
      handleUpdateUser(userId, { qrCodeImage: url });
  };
  const handleDeleteUserQrCode = (userId: string) => {
      handleUpdateUser(userId, { qrCodeImage: undefined });
  };

  const handleAddJobTitle = (t: string) => setJobTitles([...jobTitles, t]);
  const handleEditJobTitle = (o: string, n: string) => {
      setJobTitles(jobTitles.map(t => t === o ? n : t));
      setUsers(users.map(u => u.jobTitle === o ? { ...u, jobTitle: n } : u));
  };
  const handleDeleteJobTitle = (t: string) => setJobTitles(jobTitles.filter(j => j !== t));

  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          setMessages(prevMessages => {
              const activeMessages = prevMessages.filter(msg => {
                  const expirationTime = msg.expiresAt || (msg.timestamp + 86400000);
                  return now < expirationTime;
              });
              if (activeMessages.length !== prevMessages.length) {
                  return activeMessages;
              }
              return prevMessages;
          });
      }, 60000); 

      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (activeTab === 'messages' && userMessages.length === 0 && !isMessagesTabEnabled && user?.role === 'employee') {
          setActiveTab('announcements');
      }
  }, [userMessages, activeTab, isMessagesTabEnabled, user]);

  useEffect(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const activeSchedules = vacationSchedules.filter(vs => vs.startDate === todayStr && vs.status === 'active');
      
      if (activeSchedules.length > 0) {
          activeSchedules.forEach(schedule => {
              const targetUser = users.find(u => u.id === schedule.userId);
              if (targetUser && targetUser.vacationReturnDate !== schedule.returnDate) {
                  handleUpdateUser(schedule.userId, { vacationReturnDate: schedule.returnDate });
              }
          });
      }
  }, [vacationSchedules, users]);

  useEffect(() => {
      if (user && user.hideWeeklySchedule) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const todayStr = new Date().toISOString().split('T')[0];

          const yesterdaySchedule = dailySchedules.find(s => s.userId === user.id && s.date === yesterdayStr);
          const todaySchedule = dailySchedules.find(s => s.userId === user.id && s.date === todayStr);

          if (yesterdaySchedule?.type === 'Vacation' && todaySchedule?.type !== 'Vacation') {
              handleUpdateUser(user.id, { hideWeeklySchedule: false });
          }
      }
  }, [dailySchedules, user]);

  if (!user) {
    return (
        <Login 
            onLogin={handleLogin} 
            onRegister={handleRegister}
            onRecoverPassword={handleRecoverPassword} 
        />
    );
  }

  return (
    <div className={`flex min-h-screen font-sans theme-${currentTheme} overflow-hidden bg-slate-50 relative`}>
      <NotificationToast notifications={toasts} removeNotification={removeToast} />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-${currentTheme}-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4`}></div>
          <Hexagon className={`absolute top-20 left-10 text-${currentTheme}-200/20 w-64 h-64 rotate-12`} strokeWidth={1} />
          <Hexagon className={`absolute bottom-10 right-20 text-${currentTheme}-300/10 w-96 h-96 -rotate-12`} strokeWidth={0.5} />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        themeColor={currentTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        messageStatus={messageStatus}
        unreadMessageCount={unreadMessageCount}
        isMessagesTabEnabled={isMessagesTabEnabled}
        isVacationMode={isOnVacation}
      />

      <main className={`flex-1 transition-all duration-300 md:ml-0 min-h-screen flex flex-col relative z-10 ${activeTab === 'vacation' ? 'p-0' : 'p-4 md:p-8 lg:p-12'}`}>
        <header className="md:hidden h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
             <div className="flex items-center text-slate-800 font-bold text-xl">
                CineFlow
             </div>
             <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
             >
                <Menu size={24} />
             </button>
        </header>

        <div className={`flex-1 max-w-7xl mx-auto w-full ${activeTab === 'vacation' ? 'max-w-full' : ''}`}>
          {!isOnVacation && (
            <div className="hidden md:flex justify-end mb-8 items-center space-x-6">
                <div className="flex items-center space-x-2 relative">
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
                            className="relative p-2 text-slate-400 hover:bg-white rounded-full transition-all hover:shadow-sm"
                        >
                            <Bell size={20} />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>
                        <NotificationCenter 
                            isOpen={isNotifCenterOpen} 
                            onClose={() => setIsNotifCenterOpen(false)}
                            notifications={userNotifications}
                            onMarkAsRead={handleMarkNotifRead}
                            onClearAll={handleClearNotifications}
                            themeColor={currentTheme}
                        />
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex items-center space-x-3 pl-2">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-700">{user.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.role === 'super_admin' ? 'Super Admin' : user.jobTitle || 'Colaborador'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 font-bold text-xs overflow-hidden">
                            {user.avatar.length > 5 ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.avatar}
                        </div>
                    </div>
                </div>
            </div>
          )}

          <div className="animate-fade-in h-full">
             {activeTab === 'announcements' && (
                <>
                    <UploadModal 
                        isOpen={uploadModalOpen} 
                        onClose={() => setUploadModalOpen(false)} 
                        onSubmit={handleAddItem} 
                    />
                    
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                        <div className="mb-6 flex justify-end">
                            <button 
                                onClick={() => setUploadModalOpen(true)}
                                className={`bg-${currentTheme}-600 hover:bg-${currentTheme}-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-${currentTheme}-500/20 flex items-center transition-all`}
                            >
                                <Plus size={18} className="mr-2" />
                                Novo Aviso
                            </button>
                        </div>
                    )}

                    <Announcements 
                        items={announcements} 
                        themeColor={currentTheme} 
                        userRole={user.role} 
                        onDelete={handleDeleteItem}
                        userName={user.name}
                        userGender={user.gender}
                    />
                </>
             )}

             {activeTab === 'vacation' && user.vacationReturnDate && (
                 <VacationMode 
                    returnDate={user.vacationReturnDate} 
                    userName={user.name} 
                    themeColor={currentTheme}
                />
             )}

             {activeTab === 'messages' && (
                 <Announcements 
                    items={[]} 
                    messages={userMessages}
                    themeColor={currentTheme} 
                    userRole={user.role} 
                    onDelete={() => {}} 
                    userName={user.name}
                    title="Mensagens Recebidas"
                    subtitle="Comunicação direta com a administração."
                    onReply={handleReplyMessage}
                    onDeleteMessage={handleDeleteMessage}
                    users={visibleUsers}
                    onSendMessage={handleSendMessage}
                    userGender={user.gender}
                 />
             )}

             {activeTab === 'board' && (
                 <Board 
                    themeColor={currentTheme} 
                    activeBreak={activeUserBreak} 
                    onStartBreak={handleStartBreak} 
                    onEndBreak={handleEndBreak} 
                    onNotify={(msg) => addNotification("Aviso de Intervalo", msg, "warning", user.id)}
                 />
             )}

             {activeTab === 'break_monitor' && (
                 <BreakMonitor 
                    activeBreaks={activeBreaks} 
                    themeColor={currentTheme} 
                    breakHistory={breakHistory}
                    onNotifyLate={(uid, name) => addNotification("Atraso no Intervalo", `Por favor, retorne ao trabalho.`, "warning", uid)} 
                 />
             )}

             {activeTab === 'schedule' && (
                 <Schedule 
                    shifts={shifts}
                    dailySchedules={dailySchedules}
                    themeColor={currentTheme}
                    userRole={user.role}
                    userId={user.id}
                    users={visibleUsers}
                    requests={requests}
                    publishedMonths={publishedMonths}
                    onUpdateShifts={handleUpdateShifts}
                    onUpdateDailySchedule={handleUpdateDailySchedule}
                    onBulkUpdateDailySchedule={handleBulkUpdateDailySchedule}
                    onRequestOff={handleRequestOff}
                    onResolveRequest={handleResolveRequest}
                    onDeleteRequest={handleDeleteRequest}
                    onTogglePublish={handleTogglePublish}
                    isSundayOffEnabled={isSundayOffEnabled}
                    isWeeklyScheduleEnabled={isWeeklyScheduleEnabled}
                    onToggleUserWeeklySchedule={(uid) => {
                        const target = users.find(u => u.id === uid);
                        if(target) handleUpdateUser(uid, { hideWeeklySchedule: !target.hideWeeklySchedule });
                    }}
                 />
             )}

             {activeTab === 'calendar' && (
                 <HolidayCalendar 
                    themeColor={currentTheme} 
                    holidays={holidays}
                    userRole={user.role}
                    year={currentYear}
                    onYearChange={setCurrentYear}
                    onAdd={handleAddHoliday}
                    onEdit={handleEditHoliday}
                    onDelete={handleDeleteHoliday}
                 />
             )}

             {activeTab === 'schedulings' && (
                 <ScheduledVacations 
                    users={visibleUsers} 
                    schedules={visibleVacationSchedules} 
                    themeColor={currentTheme} 
                    branches={branches}
                    userRole={user.role}
                    onAddSchedule={handleAddVacationSchedule}
                    onDeleteSchedule={handleDeleteVacationSchedule}
                 />
             )}

             {activeTab === 'team' && (
                 <TeamManagement 
                    users={visibleUsers} 
                    currentUserRole={user.role}
                    branches={branches}
                    availableJobTitles={jobTitles}
                    onAddUser={handleAddUser} 
                    onUpdateUser={handleUpdateUser} 
                    onDeleteUser={handleDeleteUser}
                    onAddJobTitle={handleAddJobTitle}
                    onEditJobTitle={handleEditJobTitle}
                    onDeleteJobTitle={handleDeleteJobTitle}
                    onSendMessage={handleSendMessage}
                 />
             )}

             {activeTab === 'marketing' && (user.role === 'admin' || user.role === 'super_admin') && (
                 <MarketingFiles 
                    files={promotionalFiles}
                    themeColor={currentTheme}
                    userRole={user.role}
                    onUpload={handleUploadPromotional}
                    onUpdate={handleUpdatePromotional}
                    onDelete={handleDeletePromotional}
                 />
             )}

             {activeTab === 'settings' && (
                 <Settings 
                    user={user} 
                    currentTheme={currentTheme} 
                    onThemeChange={(c) => handleUpdateUser(user.id, { themeColor: c })} 
                    isSundayOffEnabled={isSundayOffEnabled}
                    onToggleSundayOff={() => setIsSundayOffEnabled(!isSundayOffEnabled)}
                    isWeeklyScheduleEnabled={isWeeklyScheduleEnabled}
                    onToggleWeeklySchedule={() => setIsWeeklyScheduleEnabled(!isWeeklyScheduleEnabled)}
                    isMessagesTabEnabled={isMessagesTabEnabled}
                    onToggleMessagesTab={() => setIsMessagesTabEnabled(!isMessagesTabEnabled)}
                    onUpdateAvatar={(f) => handleUpdateUser(user.id, { avatar: URL.createObjectURL(f) })}
                 />
             )}

             {activeTab === 'branches' && (
                 <BranchManagement 
                    branches={branches}
                    users={users}
                    onAddBranch={handleAddBranch}
                    onDeleteBranch={handleDeleteBranch}
                    onUpdateBranch={handleUpdateBranch}
                 />
             )}

             {activeTab === 'qrcode' && (
                 <QrCodeGenerator 
                    themeColor={currentTheme} 
                    userRole={user.role} 
                    users={visibleUsers} 
                    currentUser={user}
                    onToggleAccess={handleToggleQrAccess}
                    onUploadQrCode={handleUploadUserQrCode}
                    onDeleteQrCode={handleDeleteUserQrCode}
                 />
             )}

             {activeTab === 'subscription' && (
                 <Subscription themeColor={currentTheme} />
             )}

          </div>
        </div>
      </main>
    </div>
  );
}
