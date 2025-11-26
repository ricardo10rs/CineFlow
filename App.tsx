
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

import { User, AppItem, WorkShift, DailySchedule, OffRequest, Branch, ThemeColor, HolidayEvent, BreakSession, VacationSchedule, DirectMessage, ContentType, Notification, AnnouncementItem, DocumentItem } from './types';
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
  { id: 'u3', name: 'Maria Silva', email: 'maria@empresa.com', role: 'employee', branchId: '1', avatar: 'MS', password: '123', jobTitle: 'Recepcionista', themeColor: 'purple', notificationPrefs: { email: true, sms: true }, gender: 'female', hasQrCodeAccess: true },
  { id: 'u4', name: 'João Santos', email: 'joao@empresa.com', role: 'employee', branchId: '1', avatar: 'JS', password: '123', jobTitle: 'Vendedor', themeColor: 'orange', notificationPrefs: { email: false, sms: true }, gender: 'male' },
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

// Standard Shift Order (Sunday to Saturday)
const MOCK_SHIFTS: WorkShift[] = [
  { id: 's1', branchId: '1', dayOfWeek: 'Domingo', dayIndex: 0, startTime: '-', endTime: '-', type: 'Off' },
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
  const [shifts, setShifts] = useState<WorkShift[]>(MOCK_SHIFTS);
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  const [requests, setRequests] = useState<OffRequest[]>([]);
  const [holidays, setHolidays] = useState<HolidayEvent[]>(MOCK_HOLIDAYS);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>([]);
  const [breakHistory, setBreakHistory] = useState<BreakSession[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [vacationSchedules, setVacationSchedules] = useState<VacationSchedule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>(['Gerente', 'Recepcionista', 'Vendedor', 'Auxiliar de Limpeza']);
  const [publishedMonths, setPublishedMonths] = useState<string[]>([]);

  // Settings
  const [isSundayOffEnabled, setIsSundayOffEnabled] = useState(true);
  const [isWeeklyScheduleEnabled, setIsWeeklyScheduleEnabled] = useState(true);
  const [isMessagesTabEnabled, setIsMessagesTabEnabled] = useState(true);

  // UI State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'red' | 'green' | 'none'>('none');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Derived State
  const currentTheme = user?.themeColor || 'blue';
  
  const visibleItems = useMemo(() => {
    return items.filter(i => {
       if (user?.role === 'super_admin') return true;
       // Filter by branch if user has branchId
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
           // Admins see all messages for their branch(es)
           // For super admin, see all. For admin, filter by branch.
           return messages.filter(m => {
               if(user.role === 'super_admin') return true;
               return m.branchId === user.branchId;
           });
      }
      return messages.filter(m => m.userId === user.id);
  }, [messages, user]);

  const activeBreaks = useMemo(() => breakSessions.filter(b => !b.completedAt), [breakSessions]);
  
  const visibleVacationSchedules = useMemo(() => {
      if (user?.role === 'super_admin') return vacationSchedules;
      // Filter schedules for users in the same branch
      const branchUserIds = visibleUsers.map(u => u.id);
      return vacationSchedules.filter(vs => branchUserIds.includes(vs.userId));
  }, [vacationSchedules, visibleUsers, user]);

  const activeUserBreak = useMemo(() => {
      return breakSessions.find(b => b.userId === user?.id && !b.completedAt);
  }, [breakSessions, user]);

  // Check if user is currently in vacation mode
  const isOnVacation = useMemo(() => {
      if (user?.role === 'employee' && user.vacationReturnDate) {
          const today = new Date();
          const returnDate = new Date(user.vacationReturnDate + 'T00:00:00');
          return today < returnDate;
      }
      return false;
  }, [user]);

  // Synced Effects
  useEffect(() => {
      // Sync currently logged-in user with the users array to reflect changes like vacationReturnDate
      if (user) {
          const updatedUserRecord = users.find(u => u.id === user.id);
          if (updatedUserRecord && JSON.stringify(updatedUserRecord) !== JSON.stringify(user)) {
              setUser(updatedUserRecord);
          }
      }
  }, [users]); // Re-run when users array changes

  // Force vacation tab if on vacation
  useEffect(() => {
      if (isOnVacation) {
          setActiveTab('vacation');
      }
  }, [isOnVacation]);

  // Effects
  useEffect(() => {
      // Check for unread messages
      const hasUnread = userMessages.some(m => !m.read && (user?.role === 'employee' ? true : m.senderId !== user?.id));
      if (hasUnread) setMessageStatus('red');
      else setMessageStatus('none');
  }, [userMessages, user]);

  // Handlers
  const handleLogin = async (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && (u.password === pass || pass === '123')); // '123' as master pass for demo
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

  const handleLogout = () => {
    setUser(null);
    setActiveTab('announcements');
    setNotifications([]);
  };

  const handleRecoverPassword = async (email: string) => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleRegister = async (company: string, name: string, email: string, pass: string, phone: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password: pass,
          role: 'admin',
          avatar: name.substring(0,2).toUpperCase(),
          phone,
          themeColor: 'blue',
          notificationPrefs: { email: true, sms: true },
          gender: 'male'
      };
      setUsers([...users, newUser]);
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
          type: type as any, // Cast for simplicity in mock
          url: file ? URL.createObjectURL(file) : '#',
          analysis,
          expirationDate: durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : undefined
      };
      setItems([newItem, ...items]);
  };

  const handleDeleteItem = (id: string) => {
      setItems(items.filter(i => i.id !== id));
  };

  const handleStartBreak = (startTime: number) => {
      if (!user) return;
      const newSession: BreakSession = {
          id: Date.now().toString(),
          userId: user.id,
          branchId: user.branchId || '1',
          userName: user.name,
          userAvatar: user.avatar,
          startTime,
          duration: 3600 // 1 hour default
      };
      setBreakSessions([...breakSessions, newSession]);
  };

  const handleEndBreak = () => {
      if (!user) return;
      setBreakSessions(prev => prev.map(s => {
          if (s.userId === user.id && !s.completedAt) {
              const completedSession = { ...s, completedAt: Date.now() };
              setBreakHistory([completedSession, ...breakHistory]);
              return completedSession; // Mark as complete but keeping in state until cleanup? 
              // Actually activeBreaks filter removes it.
          }
          return s;
      }));
      // Remove from active list effectively
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

  // Schedule Handlers
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
      // Remove existing for those dates/users and add new
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
  };

  const handleResolveRequest = (requestId: string, status: 'approved' | 'rejected') => {
      setRequests(prev => prev.map(r => {
          if (r.id === requestId) {
              const updated = { ...r, status, resolutionDate: new Date().toISOString() };
              
              if (status === 'approved' && r.fullDate) {
                  const newDailySchedule: DailySchedule = {
                      id: Date.now().toString(),
                      userId: r.userId,
                      date: r.fullDate,
                      type: 'SundayOff' // Automatically set to SundayOff (Purple)
                  };
                  
                  // Update dailySchedules
                  setDailySchedules(currentSchedules => {
                      // Remove any existing schedule for this date/user
                      const filtered = currentSchedules.filter(s => !(s.userId === r.userId && s.date === r.fullDate));
                      return [...filtered, newDailySchedule];
                  });
              }
              
              return updated;
          }
          return r;
      }));
  };

  const handleDeleteRequest = (id: string) => setRequests(prev => prev.filter(r => r.id !== id));

  const handleTogglePublish = (monthKey: string) => {
      setPublishedMonths(prev => prev.includes(monthKey) ? prev.filter(k => k !== monthKey) : [...prev, monthKey]);
  };

  const handleAddBranch = (name: string, location: string) => {
      setBranches([...branches, { id: Date.now().toString(), name, location }]);
  };

  const handleDeleteBranch = (id: string) => {
      if(window.confirm("Tem certeza? Isso excluirá todos os funcionários e dados desta filial.")) {
          setBranches(branches.filter(b => b.id !== id));
          setShifts(prev => prev.filter(s => s.branchId !== id));
          // In real app, cascade delete users etc.
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
  };

  const handleReplyMessage = (msgId: string, content: string) => {
      if (!user) return;
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
      
      // Update User Record as well
      handleUpdateUser(userId, { vacationReturnDate: returnDate });
  };

  const handleDeleteVacationSchedule = (id: string) => {
      const vac = vacationSchedules.find(v => v.id === id);
      if (vac) {
          handleUpdateUser(vac.userId, { vacationReturnDate: undefined });
      }
      setVacationSchedules(prev => prev.filter(v => v.id !== id));
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

        // Easter Calculation (Meeus/Jones/Butcher's Algorithm)
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        const easterDate = new Date(year, month - 1, day);

        // Calculate mobile holidays relative to Easter
        const carnivalDate = new Date(easterDate);
        carnivalDate.setDate(easterDate.getDate() - 47); // Carnival is 47 days before Easter

        const goodFridayDate = new Date(easterDate);
        goodFridayDate.setDate(easterDate.getDate() - 2); // Good Friday is 2 days before Easter

        const corpusChristiDate = new Date(easterDate);
        corpusChristiDate.setDate(easterDate.getDate() + 60); // Corpus Christi is 60 days after Easter

        const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
        };

        const mobileHolidays: Omit<HolidayEvent, 'id'>[] = [
            { date: formatDate(carnivalDate), name: 'Carnaval', type: 'Ponto Facultativo', color: 'purple' },
            { date: formatDate(goodFridayDate), name: 'Sexta-feira Santa', type: 'Feriado Nacional', color: 'purple' },
            { date: formatDate(corpusChristiDate), name: 'Corpus Christi', type: 'Ponto Facultativo', color: 'red' },
        ];

        return [...fixedHolidays, ...mobileHolidays].map((h, idx) => ({
            ...h,
            id: `auto-${year}-${idx}`
        }));
  };

  // Check and Generate Holidays on Year Change
  const handleYearChange = (year: number) => {
      setCurrentYear(year);
      const hasHolidaysForYear = holidays.some(h => h.date.startsWith(`${year}-`));
      
      if (!hasHolidaysForYear) {
          const newHolidays = generateBrazilianHolidays(year);
          setHolidays(prev => [...prev, ...newHolidays]);
      }
  };

  // Init Holidays
  useEffect(() => {
      const currentY = new Date().getFullYear();
      const hasCurrent = holidays.some(h => h.date.startsWith(`${currentY}-`));
      if (!hasCurrent) {
          setHolidays(prev => [...prev, ...generateBrazilianHolidays(currentY)]);
      }
  }, []);

  // Holiday Handlers
  const handleAddHoliday = (h: HolidayEvent) => setHolidays([...holidays, h]);
  const handleEditHoliday = (h: HolidayEvent) => setHolidays(holidays.map(ev => ev.id === h.id ? h : ev));
  const handleDeleteHoliday = (id: string) => setHolidays(holidays.filter(h => h.id !== id));

  // QR Handlers
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
      // Update users with old title
      setUsers(users.map(u => u.jobTitle === o ? { ...u, jobTitle: n } : u));
  };
  const handleDeleteJobTitle = (t: string) => setJobTitles(jobTitles.filter(j => j !== t));

  // Check for auto-end vacation mode
  useEffect(() => {
      if (user && user.vacationReturnDate) {
          const today = new Date();
          const returnDate = new Date(user.vacationReturnDate + 'T00:00:00');
          // Logic: If today is equal or past return date, clear it.
          // Actually, let's keep it until user logs in next time or just rely on the VacationMode component logic
          // But for sidebar visibility, we need this check.
      }
  }, [user]);

  // Auto-cleanup messages 24h (or custom timer)
  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          setMessages(prevMessages => {
              const activeMessages = prevMessages.filter(msg => {
                  // If expiresAt is defined, use it. Else fallback to 24h (86400000ms)
                  const expirationTime = msg.expiresAt || (msg.timestamp + 86400000);
                  return now < expirationTime;
              });
              
              // If count changed, update state
              if (activeMessages.length !== prevMessages.length) {
                  return activeMessages;
              }
              return prevMessages;
          });
      }, 60000); // Check every minute

      return () => clearInterval(interval);
  }, []);

  // Handle auto-redirect if messages are empty and we are on messages tab
  useEffect(() => {
      if (activeTab === 'messages' && userMessages.length === 0 && !isMessagesTabEnabled && user?.role === 'employee') {
          setActiveTab('announcements');
      }
  }, [userMessages, activeTab, isMessagesTabEnabled, user]);

  // Automatic Vacation Mode Trigger based on Schedule
  useEffect(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const activeSchedules = vacationSchedules.filter(vs => vs.startDate === todayStr && vs.status === 'active');
      
      if (activeSchedules.length > 0) {
          activeSchedules.forEach(schedule => {
              const targetUser = users.find(u => u.id === schedule.userId);
              // Only update if not already set
              if (targetUser && targetUser.vacationReturnDate !== schedule.returnDate) {
                  handleUpdateUser(schedule.userId, { vacationReturnDate: schedule.returnDate });
              }
          });
      }
  }, [vacationSchedules, users]);

  // Auto-Reenable Weekly Schedule when returning from vacation
  useEffect(() => {
      if (user && user.hideWeeklySchedule) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const todayStr = new Date().toISOString().split('T')[0];

          const yesterdaySchedule = dailySchedules.find(s => s.userId === user.id && s.date === yesterdayStr);
          const todaySchedule = dailySchedules.find(s => s.userId === user.id && s.date === todayStr);

          // If yesterday was vacation and today is NOT vacation, re-enable weekly schedule
          if (yesterdaySchedule?.type === 'Vacation' && todaySchedule?.type !== 'Vacation') {
              handleUpdateUser(user.id, { hideWeeklySchedule: false });
              alert(`Bem-vindo de volta, ${user.name}! Sua escala semanal está visível novamente.`);
          }
      }
  }, [dailySchedules, user]);

  // Render Login
  if (!user) {
    return (
        <Login 
            onLogin={handleLogin} 
            onRecoverPassword={handleRecoverPassword}
            onRegister={handleRegister}
        />
    );
  }

  return (
    <div className={`flex min-h-screen font-sans theme-${currentTheme} overflow-hidden bg-slate-50 relative`}>
      
      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Radial Gradient for depth */}
          <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-${currentTheme}-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4`}></div>
          
          {/* Logo Shapes */}
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
        isMessagesTabEnabled={isMessagesTabEnabled}
        isVacationMode={isOnVacation}
      />

      <main className={`flex-1 transition-all duration-300 md:ml-0 min-h-screen flex flex-col relative z-10 ${activeTab === 'vacation' ? 'p-0' : 'p-4 md:p-8 lg:p-12'}`}>
        {/* Mobile Header */}
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
          {/* Top Bar (Desktop) */}
          {!isOnVacation && (
            <div className="hidden md:flex justify-end mb-8 items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <button className="relative p-2 text-slate-400 hover:bg-white rounded-full transition-all hover:shadow-sm">
                        <Bell size={20} />
                        {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
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

          {/* Content Area */}
          <div className="animate-fade-in h-full">
             {activeTab === 'announcements' && (
                <>
                    <UploadModal 
                        isOpen={uploadModalOpen} 
                        onClose={() => setUploadModalOpen(false)} 
                        onSubmit={handleAddItem} 
                    />
                    
                    {/* Only show 'Add' button for admins */}
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
                    onNotify={(msg) => alert(msg)} 
                 />
             )}

             {activeTab === 'break_monitor' && (
                 <BreakMonitor 
                    activeBreaks={activeBreaks} 
                    themeColor={currentTheme} 
                    breakHistory={breakHistory}
                    onNotifyLate={(uid, name) => alert(`Notificação enviada para ${name}`)} 
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
                    onAddBranch={handleAddBranch}
                    onDeleteBranch={handleDeleteBranch}
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
          </div>
        </div>
      </main>
    </div>
  );
}
