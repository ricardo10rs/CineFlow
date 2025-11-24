
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Announcements } from './components/Announcements';
import { Schedule } from './components/Schedule';
import { UploadModal } from './components/UploadModal';
import { Login } from './components/Login';
import { TeamManagement } from './components/TeamManagement';
import { Settings } from './components/Settings';
import { BranchManagement } from './components/BranchManagement';
import { Board } from './components/Board';
import { BreakMonitor } from './components/BreakMonitor';
import { HolidayCalendar } from './components/HolidayCalendar';
import { VacationMode } from './components/VacationMode';
import { ScheduledVacations } from './components/ScheduledVacations';
import { AppItem, AnnouncementItem, ContentType, WorkShift, User, ThemeColor, OffRequest, Notification, DailySchedule, DirectMessage, Branch, BreakSession, Reply, HolidayEvent, VacationSchedule } from './types';
import { Plus, Bell, Menu, Mail, Smartphone } from 'lucide-react';

// Initial Data with Branch IDs
const INITIAL_BRANCHES: Branch[] = [
  { id: '1', name: 'Matriz São Paulo', location: 'Av. Paulista' },
  { id: '2', name: 'Filial Rio de Janeiro', location: 'Copacabana' }
];

const INITIAL_ITEMS: AppItem[] = [];

const INITIAL_SHIFTS: WorkShift[] = [
  { id: '4', branchId: '1', dayOfWeek: 'Quinta-feira', date: '26/10', dayIndex: 4, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '5', branchId: '1', dayOfWeek: 'Sexta-feira', date: '27/10', dayIndex: 5, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '6', branchId: '1', dayOfWeek: 'Sábado', date: '28/10', dayIndex: 6, startTime: '09:00', endTime: '13:00', type: 'Work', location: 'Escritório', totalHours: 4 },
  { id: '7', branchId: '1', dayOfWeek: 'Domingo', date: '29/10', dayIndex: 0, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '1', branchId: '1', dayOfWeek: 'Segunda-feira', date: '30/10', dayIndex: 1, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '2', branchId: '1', dayOfWeek: 'Terça-feira', date: '31/10', dayIndex: 2, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  { id: '3', branchId: '1', dayOfWeek: 'Quarta-feira', date: '01/11', dayIndex: 3, startTime: '09:00', endTime: '18:00', type: 'Work', location: 'Escritório', totalHours: 8 },
  
  { id: '24', branchId: '2', dayOfWeek: 'Quinta-feira', date: '26/10', dayIndex: 4, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '25', branchId: '2', dayOfWeek: 'Sexta-feira', date: '27/10', dayIndex: 5, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '26', branchId: '2', dayOfWeek: 'Sábado', date: '28/10', dayIndex: 6, startTime: '09:00', endTime: '14:00', type: 'Work', location: 'Loja Copacabana', totalHours: 5 },
  { id: '27', branchId: '2', dayOfWeek: 'Domingo', date: '29/10', dayIndex: 0, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '21', branchId: '2', dayOfWeek: 'Segunda-feira', date: '30/10', dayIndex: 1, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '22', branchId: '2', dayOfWeek: 'Terça-feira', date: '31/10', dayIndex: 2, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
  { id: '23', branchId: '2', dayOfWeek: 'Quarta-feira', date: '01/11', dayIndex: 3, startTime: '10:00', endTime: '19:00', type: 'Work', location: 'Loja Copacabana', totalHours: 8 },
];

const INITIAL_USERS: User[] = [
  { id: '0', name: 'Super Admin', email: 'super@arco.com', role: 'super_admin', avatar: 'SA', password: '123', themeColor: 'slate', phone: '(00) 0000-0000', jobTitle: 'Diretor' },
  { id: '1', branchId: '1', name: 'Admin Silva', email: 'admin@empresa.com', role: 'admin', avatar: 'AS', password: '123', themeColor: 'blue', phone: '(11) 99999-0000', jobTitle: 'Gerente' },
  { id: '2', branchId: '1', name: 'Maria Bilheteira', email: 'maria@empresa.com', role: 'employee', avatar: 'MB', password: '123', themeColor: 'pink', phone: '(11) 98888-1111', jobTitle: 'Bilheteira' },
  { id: '3', branchId: '2', name: 'João Rio', email: 'joao@rio.com', role: 'admin', avatar: 'JR', password: '123', themeColor: 'green', phone: '(21) 99999-2222', jobTitle: 'Gerente Rio' },
];

const INITIAL_OFF_REQUESTS: OffRequest[] = [
  { id: '101', branchId: '1', userId: '2', userName: 'Maria Bilheteira', date: '29/10', status: 'pending', requestDate: '24/10 10:30' }
];

const getYesterdayBreakHistory = (): BreakSession[] => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const time1 = new Date(yesterday).setHours(11, 30, 0, 0);
    const time2 = new Date(yesterday).setHours(12, 15, 0, 0);
    const time3 = new Date(yesterday).setHours(13, 0, 0, 0);

    return [
        { id: 'h1', userId: '2', branchId: '1', userName: 'Maria Bilheteira', userAvatar: 'MB', startTime: time1, duration: 3600, completedAt: time1 + 3600000 },
        { id: 'h2', userId: '3', branchId: '2', userName: 'João Rio', userAvatar: 'JR', startTime: time2, duration: 3600, completedAt: time2 + 3600000 },
        { id: 'h3', userId: '99', branchId: '1', userName: 'Carlos Pipoca', userAvatar: 'CP', startTime: time3, duration: 3600, completedAt: time3 + 3600000 }
    ];
};

// --- HOLIDAY GENERATION LOGIC ---
const calculateEaster = (year: number): Date => {
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
  return new Date(year, month - 1, day);
};

const generateBrazilianHolidays = (year: number): HolidayEvent[] => {
  const fixedHolidays: Omit<HolidayEvent, 'id'>[] = [
    { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'Feriado Nacional', color: 'green', description: 'Início do ano novo.' },
    { date: `${year}-04-21`, name: 'Tiradentes', type: 'Feriado Nacional', color: 'blue', description: 'Dia da Inconfidência Mineira.' },
    { date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'Feriado Nacional', color: 'green', description: 'Dia Internacional dos Trabalhadores.' },
    { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'Feriado Nacional', color: 'green', description: 'Comemoração da Independência.' },
    { date: `${year}-10-12`, name: 'Nossa Sr.ª Aparecida', type: 'Feriado Nacional', color: 'blue', description: 'Padroeira do Brasil.' },
    { date: `${year}-11-02`, name: 'Finados', type: 'Feriado Nacional', color: 'purple', description: 'Dia de memória aos falecidos.' },
    { date: `${year}-11-15`, name: 'Proclamação da República', type: 'Feriado Nacional', color: 'green', description: 'Instauração do regime republicano.' },
    { date: `${year}-12-25`, name: 'Natal', type: 'Feriado Nacional', color: 'red', description: 'Celebração do Natal.' },
  ];

  const easter = calculateEaster(year);
  
  const carnivalMon = new Date(easter); carnivalMon.setDate(easter.getDate() - 48);
  const carnivalTue = new Date(easter); carnivalTue.setDate(easter.getDate() - 47);
  const ashWed = new Date(easter); ashWed.setDate(easter.getDate() - 46);
  const goodFriday = new Date(easter); goodFriday.setDate(easter.getDate() - 2);
  const corpusChristi = new Date(easter); corpusChristi.setDate(easter.getDate() + 60);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const mobileHolidays: Omit<HolidayEvent, 'id'>[] = [
    { date: formatDate(carnivalMon), name: 'Carnaval', type: 'Ponto Facultativo', color: 'orange', description: 'Segunda-feira de Carnaval.' },
    { date: formatDate(carnivalTue), name: 'Carnaval', type: 'Ponto Facultativo', color: 'orange', description: 'Terça-feira de Carnaval.' },
    { date: formatDate(ashWed), name: 'Quarta-feira de Cinzas', type: 'Ponto Facultativo', color: 'yellow', description: 'Até as 14h.' },
    { date: formatDate(goodFriday), name: 'Paixão de Cristo', type: 'Feriado Nacional', color: 'purple', description: 'Sexta-feira Santa.' },
    { date: formatDate(corpusChristi), name: 'Corpus Christi', type: 'Ponto Facultativo', color: 'yellow', description: 'Celebração Católica.' },
  ];

  return [...fixedHolidays, ...mobileHolidays].map((h, index) => ({
      ...h,
      id: `${year}-${index}-${Date.now()}`
  }));
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState('announcements'); 
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
  const [isWeeklyScheduleEnabled, setIsWeeklyScheduleEnabled] = useState(true);
  const [isMessagesTabEnabled, setIsMessagesTabEnabled] = useState(false);
  const [availableJobTitles, setAvailableJobTitles] = useState<string[]>(['Recepcionista', 'Bilheteira', 'Atendente de Bombonière', 'Auxiliar de Limpeza', 'Gerente']);
  const [activeBreaks, setActiveBreaks] = useState<BreakSession[]>([]);
  const [breakHistory, setBreakHistory] = useState<BreakSession[]>(getYesterdayBreakHistory());
  
  // Holiday State
  const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Vacation Schedule State
  const [vacationSchedules, setVacationSchedules] = useState<VacationSchedule[]>([]);

  // --- LOAD PREFERENCES ---
  useEffect(() => {
    const savedSunday = localStorage.getItem('cineflow_sunday_off');
    if (savedSunday !== null) setIsSundayOffEnabled(JSON.parse(savedSunday));

    const savedWeekly = localStorage.getItem('cineflow_weekly_schedule');
    if (savedWeekly !== null) setIsWeeklyScheduleEnabled(JSON.parse(savedWeekly));

    const savedMessages = localStorage.getItem('cineflow_messages_enabled');
    if (savedMessages !== null) setIsMessagesTabEnabled(JSON.parse(savedMessages));

    const savedHolidays = localStorage.getItem('cineflow_holidays_db');
    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays));
    } else {
      // If no holidays saved, generate for current year
      const defaultHolidays = generateBrazilianHolidays(new Date().getFullYear());
      setHolidays(defaultHolidays);
    }

    const savedSchedules = localStorage.getItem('cineflow_vacation_schedules');
    if (savedSchedules) {
        setVacationSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  // --- SAVE HOLIDAYS ---
  useEffect(() => {
    if (holidays.length > 0) {
        localStorage.setItem('cineflow_holidays_db', JSON.stringify(holidays));
    }
  }, [holidays]);

  // --- SAVE VACATION SCHEDULES ---
  useEffect(() => {
      localStorage.setItem('cineflow_vacation_schedules', JSON.stringify(vacationSchedules));
  }, [vacationSchedules]);

  const handleYearChange = (year: number) => {
      setCurrentYear(year);
      // Check if we have holidays for this year
      const hasHolidaysForYear = holidays.some(h => h.date.startsWith(`${year}-`));
      
      if (!hasHolidaysForYear) {
          const newHolidays = generateBrazilianHolidays(year);
          setHolidays(prev => [...prev, ...newHolidays]);
      }
  };

  // --- VACATION SCHEDULER AUTOMATION ---
  useEffect(() => {
    // Check daily (or on component mount) if any schedule needs activation
    const checkSchedules = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        let usersUpdated = false;
        let schedulesUpdated = false;
        const newUsers = [...users];
        const newSchedules = [...vacationSchedules];

        newSchedules.forEach((schedule, index) => {
            // Activate if start date is today or passed, and status is pending
            if (schedule.status === 'pending' && schedule.startDate <= todayStr) {
                // Find user and set vacation return date
                const userIndex = newUsers.findIndex(u => u.id === schedule.userId);
                if (userIndex !== -1) {
                    newUsers[userIndex] = {
                        ...newUsers[userIndex],
                        vacationReturnDate: schedule.returnDate
                    };
                    usersUpdated = true;
                    
                    // Mark schedule as active
                    newSchedules[index] = { ...schedule, status: 'active' };
                    schedulesUpdated = true;
                    
                    // Optional: notify admin?
                    // console.log(`Activated vacation for ${schedule.userName}`);
                }
            }
            
            // Mark as completed if return date passed
            if (schedule.status === 'active' && schedule.returnDate <= todayStr) {
                 newSchedules[index] = { ...schedule, status: 'completed' };
                 schedulesUpdated = true;
            }
        });

        if (usersUpdated) setUsers(newUsers);
        if (schedulesUpdated) setVacationSchedules(newSchedules);
    };

    checkSchedules();
    const timer = setInterval(checkSchedules, 60000 * 60); // Check every hour
    return () => clearInterval(timer);
  }, [vacationSchedules, users]);

  // --- CLEANUP ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => prev.filter(n => now - n.timestamp < 3600000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneDay = 86400000;
      setDirectMessages(prev => prev.filter(msg => {
          if (msg.expiresAt) return now < msg.expiresAt;
          return now - msg.timestamp < oneDay;
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fortyEightHours = 172800000;
      setBreakHistory(prev => prev.filter(session => {
         if (!session.completedAt) return false;
         return (now - session.completedAt) < fortyEightHours;
      }));
    }, 60000);
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
        
        // CHECK 1: Calendar based return (Scheduled vacation ending)
        const scheduleToday = dailySchedules.find(s => s.userId === user.id && s.date === todayStr);
        const scheduleYesterday = dailySchedules.find(s => s.userId === user.id && s.date === yesterdayStr);

        if (scheduleYesterday?.type === 'Vacation' && scheduleToday?.type !== 'Vacation') {
             // AUTO-ENABLE Weekly Schedule if it was hidden
             if (user.hideWeeklySchedule) {
                 setUsers(prev => prev.map(u => {
                    if (u.id === user.id) return { ...u, hideWeeklySchedule: false };
                    return u;
                 }));
                 setUser(prev => prev ? { ...prev, hideWeeklySchedule: false } : null);
             }

             const hasNotified = notifications.some(n => n.title === 'Bem-vindo de volta' && n.timestamp > Date.now() - 60000);
             if (!hasNotified) {
                 triggerNotification('🎉 Bem-vindo de volta! Sua escala semanal está disponível novamente.', 'sms');
             }
        }

        // CHECK 2: Vacation Mode Date Expiration (For the specific return date panel)
        if (user.vacationReturnDate) {
            const returnDate = new Date(user.vacationReturnDate + 'T00:00:00'); // Ensure time doesn't shift date
            // If today is equal or greater than return date, disable vacation mode
            if (today >= returnDate) {
                 // Clear the vacation date
                 const updatedUser = { ...user, vacationReturnDate: undefined, hideWeeklySchedule: false };
                 setUser(updatedUser);
                 setUsers(prev => prev.map(u => u.id === user.id ? { ...u, vacationReturnDate: undefined, hideWeeklySchedule: false } : u));
                 
                 // Notify
                 triggerNotification('🎉 Suas férias terminaram. Bem-vindo de volta!', 'sms');
            }
        }
    }
  }, [user, dailySchedules]);

  // --- DATA FILTERING ---
  const currentBranchId = user?.role === 'super_admin' ? null : user?.branchId;
  
  const visibleUsers = user?.role === 'super_admin' ? users : users.filter(u => u.branchId === currentBranchId);
  
  const visibleItems = user?.role === 'super_admin' 
      ? items 
      : items.filter(i => {
          const matchesBranch = i.branchId === currentBranchId;
          const isPublic = !i.targetUserId;
          const isForMe = i.targetUserId === user?.id;
          return matchesBranch && (isPublic || isForMe);
      });

  const visibleMessages = directMessages.filter(m => {
      if (!user) return false;
      if (m.userId === user.id) return true;
      if (m.senderId === user.id) return true;
      if (user.role === 'super_admin') return true;
      if (user.role === 'admin' && m.branchId === user.branchId) return true;
      return false;
  });

  const visibleShifts = user?.role === 'super_admin' ? shifts : shifts.filter(s => s.branchId === currentBranchId);
  const visibleRequests = user?.role === 'super_admin' ? offRequests : offRequests.filter(r => r.branchId === currentBranchId);
  const visibleBreaks = user?.role === 'super_admin' ? activeBreaks : activeBreaks.filter(b => b.branchId === currentBranchId);
  const visibleBreakHistory = user?.role === 'super_admin' ? breakHistory : breakHistory.filter(b => b.branchId === currentBranchId);
  
  // Filter vacation schedules for visible users
  const visibleVacationSchedules = vacationSchedules.filter(s => visibleUsers.some(u => u.id === s.userId));

  const announcements = visibleItems.filter(i => {
    if (i.type !== ContentType.ANNOUNCEMENT) return false;
    if (i.expirationDate) {
        return new Date() <= new Date(i.expirationDate);
    }
    return true;
  }) as AnnouncementItem[];

  // --- ACTIONS ---
  const triggerNotification = (message: string, type: 'email' | 'sms' = 'email', targetUserId?: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title: type === 'email' ? 'Novo Email' : 'Novo SMS',
      message,
      type: 'info',
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      targetUserId
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
        const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass);
        if (foundUser) {
          // Clear any leftover notifications from previous session
          setNotifications([]);
          setActiveToasts([]);
          
          setUser(foundUser);
          const savedTheme = localStorage.getItem(`cineflow_theme_${foundUser.id}`);
          setCurrentTheme((savedTheme as ThemeColor) || foundUser.themeColor || 'blue');
          
          // Force proper landing page based on role
          if (foundUser.role === 'super_admin') {
              setActiveTab('branches');
          } else {
              // Both regular Admin and Employee land on Announcements
              setActiveTab('announcements');
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
            if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
                reject(new Error("Email já cadastrado."));
                return;
            }
            const newBranch: Branch = { id: Date.now().toString(), name: companyName, location: 'Matriz' };
            setBranches(prev => [...prev, newBranch]);
            
            // Add default shifts...
            const days = [{name: 'Segunda-feira', idx: 1}, {name: 'Terça-feira', idx: 2}, {name: 'Quarta-feira', idx: 3}, {name: 'Quinta-feira', idx: 4}, {name: 'Sexta-feira', idx: 5}, {name: 'Sábado', idx: 6}, {name: 'Domingo', idx: 0}];
            const newShifts: WorkShift[] = days.map((day, i) => ({
                id: (Date.now() + i).toString(), branchId: newBranch.id, dayOfWeek: day.name, dayIndex: day.idx, date: '--/--', startTime: '09:00', endTime: '18:00', type: 'Work', totalHours: 8
            }));
            setShifts(prev => [...prev, ...newShifts]);

            const newUser: User = {
                id: (Date.now() + 1).toString(), branchId: newBranch.id, name, email, password: pass, role: 'super_admin', phone, avatar: name.substring(0,2).toUpperCase(), themeColor: 'blue', jobTitle: 'Diretor'
            };
            setUsers(prev => [...prev, newUser]);
            setUser(newUser);
            setCurrentTheme('blue');
            localStorage.setItem(`cineflow_theme_${newUser.id}`, 'blue');
            setActiveTab('branches');
            resolve();
        }, 1000);
    });
  };

  const handleRecoverPassword = async (email: string) => {
      return Promise.resolve();
  };

  const handleLogout = () => { 
      setUser(null); 
      setActiveTab('announcements'); 
      setNotifications([]); 
      setActiveToasts([]);
  };

  const handleToggleUserWeeklySchedule = (targetUserId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, hideWeeklySchedule: !u.hideWeeklySchedule };
      }
      return u;
    }));
  };
  
  const handleSendDirectMessage = (userId: string, message: string, file?: File, durationMinutes: number = 24 * 60) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !targetUser.branchId || !user) return;

    const expiresAt = Date.now() + (durationMinutes * 60000);

    const createMessage = (attachment?: any) => {
        const newMsg: DirectMessage = {
            id: Date.now().toString(),
            branchId: targetUser.branchId!,
            userId,
            senderId: user.id,
            senderName: user.name,
            message,
            date: new Date().toLocaleDateString('pt-BR'),
            timestamp: Date.now(),
            expiresAt,
            read: false,
            attachment,
            replies: []
        };
        setDirectMessages(prev => [newMsg, ...prev]);
        triggerNotification(`Mensagem enviada.`, 'sms');
    };

    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => createMessage({ name: file.name, url: reader.result as string, type: file.type.includes('pdf') ? 'PDF' : 'IMAGE' });
        reader.readAsDataURL(file);
    } else {
        createMessage();
    }
  };

  const handleReplyToMessage = (messageId: string, content: string) => {
      if (!user) return;
      setDirectMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
              return {
                  ...msg,
                  replies: [...msg.replies, {
                      id: Date.now().toString(),
                      authorId: user.id,
                      authorName: user.name,
                      content,
                      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                      timestamp: Date.now(),
                      isAdmin: user.role !== 'employee'
                  }]
              };
          }
          return msg;
      }));
      triggerNotification("Resposta enviada.", "sms");
  };

  const handleDeleteDirectMessage = (messageId: string) => {
      setDirectMessages(prev => prev.filter(msg => msg.id !== messageId));
      triggerNotification("Conversa encerrada.", "sms");
  };

  // --- HOLIDAY MANAGEMENT ---
  const handleAddHoliday = (holiday: HolidayEvent) => {
    setHolidays(prev => [...prev, holiday]);
    triggerNotification('Feriado adicionado com sucesso!', 'sms');
  };

  const handleEditHoliday = (updatedHoliday: HolidayEvent) => {
    setHolidays(prev => prev.map(h => h.id === updatedHoliday.id ? updatedHoliday : h));
    triggerNotification('Feriado atualizado.', 'sms');
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    triggerNotification('Feriado removido.', 'sms');
  };

  // --- VACATION SCHEDULE ACTIONS ---
  const handleAddVacationSchedule = (userId: string, startDate: string, returnDate: string) => {
      const userObj = users.find(u => u.id === userId);
      if (!userObj) return;

      const newSchedule: VacationSchedule = {
          id: Date.now().toString(),
          userId,
          userName: userObj.name,
          userAvatar: userObj.avatar,
          startDate,
          returnDate,
          status: 'pending'
      };

      setVacationSchedules(prev => [...prev, newSchedule]);
      triggerNotification('Férias agendadas com sucesso.', 'sms');
  };

  const handleDeleteVacationSchedule = (id: string) => {
      setVacationSchedules(prev => prev.filter(s => s.id !== id));
      triggerNotification('Agendamento de férias removido.', 'sms');
  };

  // --- MESSAGE STATUS LOGIC (GREEN/RED) ---
  let messageStatus: 'red' | 'green' | 'none' = 'none';

  if (visibleMessages.length > 0 && user) {
      let maxTime = 0;
      let authorOfMax = '';
      
      visibleMessages.forEach(msg => {
          if (msg.timestamp > maxTime) {
              maxTime = msg.timestamp;
              authorOfMax = msg.senderId || '';
          }
          if (msg.replies) {
              msg.replies.forEach(r => {
                  if (r.timestamp && r.timestamp > maxTime) {
                      maxTime = r.timestamp;
                      authorOfMax = r.authorId;
                  }
              });
          }
      });
      
      if (maxTime > 0) {
          // Green if I am the last author, Red if someone else is
          messageStatus = (authorOfMax === user.id) ? 'green' : 'red';
      } else {
          messageStatus = 'red';
      }
  }

  // Auto Redirect if on messages tab and messages are cleared
  // Exception: Admins can stay on messages tab if they want (or should they?)
  // Requirement said "Messages tab should always be active for admin". 
  // Redirect only if NOT admin and messages empty.
  useEffect(() => {
      if (activeTab === 'messages' && messageStatus === 'none' && !isMessagesTabEnabled && user?.role !== 'admin' && user?.role !== 'super_admin') {
          setActiveTab('announcements');
      }
  }, [activeTab, messageStatus, user?.role, isMessagesTabEnabled]);

  if (!user) {
    return <Login onLogin={handleLogin} onRecoverPassword={handleRecoverPassword} onRegister={handleRegister} />;
  }

  const visibleNotifications = notifications.filter(n => !n.targetUserId || n.targetUserId === user.id);

  // --- VACATION MODE CHECK ---
  // If user is employee AND has a vacation return date set
  const isOnVacation = !!user.vacationReturnDate && user.role === 'employee';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="fixed top-4 right-4 z-40 space-y-2 max-w-md w-full px-4 md:px-0 pointer-events-none">
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
        messageStatus={messageStatus}
        isMessagesTabEnabled={isMessagesTabEnabled}
        isVacationMode={isOnVacation}
      />
      
      <main className="flex-1 md:ml-64 relative">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 px-4 py-4 md:px-8 flex items-center justify-between transition-all duration-300 h-20 shadow-sm md:shadow-none">
           <div className="flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mr-4 md:hidden p-2 text-slate-600 transition-colors">
               <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-none">
                {isOnVacation ? 'Férias' : 
                 activeTab === 'announcements' ? 'Comunicados' : 
                 activeTab === 'messages' ? 'Minhas Mensagens' : 
                 activeTab === 'calendar' ? `Feriados ${currentYear}` : 
                 activeTab === 'schedulings' ? 'Agendamentos' : 'CineFlow'}
              </h1>
            </div>
           </div>
           
           <div className="flex items-center space-x-3 md:space-x-6 relative">
             <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="text-slate-400 hover:text-slate-600 p-2">
                    <Bell size={22} />
                    {visibleNotifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-800">Notificações</h4>
                        <button onClick={handleClearNotifications} className="text-xs text-blue-600 font-bold">Limpar</button>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto">
                        {visibleNotifications.map(n => (
                            <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50">
                                <p className="text-sm">{n.message}</p>
                            </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>
             <div className="hidden md:flex w-10 h-10 rounded-full bg-slate-800 text-white items-center justify-center font-bold text-sm">
                 {user.avatar.length > 5 ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : user.avatar}
             </div>
           </div>
        </header>

        <div className="p-4 md:p-8 pt-24 md:pt-28 max-w-6xl mx-auto">
          {/* VACATION MODE RENDER */}
          {isOnVacation ? (
              <VacationMode returnDate={user.vacationReturnDate!} userName={user.name} themeColor={currentTheme} />
          ) : (
            <>
                {user.role === 'super_admin' && activeTab === 'branches' && <BranchManagement branches={branches} onAddBranch={(n,l) => setBranches([...branches, {id: Date.now().toString(), name:n, location:l}])} onDeleteBranch={(id) => setBranches(prev => prev.filter(b => b.id !== id))} />}
                
                {activeTab === 'schedule' && <Schedule shifts={visibleShifts} dailySchedules={dailySchedules} themeColor={currentTheme} userRole={user.role} userId={user.id} users={visibleUsers} requests={visibleRequests} publishedMonths={publishedMonths} onUpdateShifts={s => setShifts(s)} onUpdateDailySchedule={s => setDailySchedules(p => [...p.filter(x => x.id !== s.id), s])} onBulkUpdateDailySchedule={list => setDailySchedules(p => [...p, ...list])} onRequestOff={d => setOffRequests(p => [...p, {id: Date.now().toString(), branchId: user.branchId!, userId: user.id, userName: user.name, date: d, status: 'pending', requestDate: new Date().toLocaleDateString()}])} onResolveRequest={(id, st) => setOffRequests(p => p.map(r => r.id === id ? {...r, status: st} : r))} onDeleteRequest={id => setOffRequests(p => p.filter(r => r.id !== id))} onTogglePublish={k => setPublishedMonths(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k])} onToggleUserWeeklySchedule={handleToggleUserWeeklySchedule} onUpdateUser={(id, data) => setUsers(p => p.map(u => u.id === id ? {...u, ...data} : u))} isSundayOffEnabled={isSundayOffEnabled} isWeeklyScheduleEnabled={isWeeklyScheduleEnabled} />}

                {activeTab === 'announcements' && <Announcements items={announcements} themeColor={currentTheme} userRole={user.role} onDelete={id => setItems(p => p.filter(i => i.id !== id))} userName={user.name} messages={[]} />}

                {activeTab === 'messages' && <Announcements title="Mensagens Recebidas" subtitle="Comunicação direta" items={[]} themeColor={currentTheme} userRole={user.role} onDelete={() => {}} userName={user.name} messages={visibleMessages} onReply={handleReplyToMessage} onDeleteMessage={handleDeleteDirectMessage} users={visibleUsers} onSendMessage={handleSendDirectMessage} />}

                {activeTab === 'board' && <Board themeColor={currentTheme} activeBreak={activeBreaks.find(b => b.userId === user.id)} onStartBreak={t => setActiveBreaks(p => [...p, {id: Date.now().toString(), userId: user.id, branchId: user.branchId!, userName: user.name, userAvatar: user.avatar, startTime: t, duration: 3600}])} onEndBreak={() => setActiveBreaks(p => p.filter(b => b.userId !== user.id))} onNotify={triggerNotification} />}
                
                {activeTab === 'team' && <TeamManagement users={visibleUsers} currentUserRole={user.role} branches={branches} availableJobTitles={availableJobTitles} onAddUser={(u) => setUsers(p => [...p, {...u, id: Date.now().toString(), avatar: 'NU', themeColor: 'blue'}])} onUpdateUser={(id, d) => setUsers(p => p.map(u => u.id === id ? {...u, ...d} : u))} onDeleteUser={id => setUsers(p => p.filter(u => u.id !== id))} onAddJobTitle={t => setAvailableJobTitles(p => [...p, t])} onEditJobTitle={(o, n) => setAvailableJobTitles(p => p.map(t => t === o ? n : t))} onDeleteJobTitle={t => setAvailableJobTitles(p => p.filter(x => x !== t))} onSendMessage={handleSendDirectMessage} />}
                
                {activeTab === 'settings' && <Settings user={user} currentTheme={currentTheme} onThemeChange={setCurrentTheme} isSundayOffEnabled={isSundayOffEnabled} onToggleSundayOff={() => setIsSundayOffEnabled(!isSundayOffEnabled)} isWeeklyScheduleEnabled={isWeeklyScheduleEnabled} onToggleWeeklySchedule={() => {
                    const newValue = !isWeeklyScheduleEnabled;
                    setIsWeeklyScheduleEnabled(newValue);
                    localStorage.setItem('cineflow_weekly_schedule', JSON.stringify(newValue));
                }} isMessagesTabEnabled={isMessagesTabEnabled} onToggleMessagesTab={() => {
                    const newValue = !isMessagesTabEnabled;
                    setIsMessagesTabEnabled(newValue);
                    localStorage.setItem('cineflow_messages_enabled', JSON.stringify(newValue));
                }} onUpdateAvatar={(f) => {}} />}
                
                {activeTab === 'break_monitor' && <BreakMonitor activeBreaks={visibleBreaks} themeColor={currentTheme} breakHistory={visibleBreakHistory} />}

                {activeTab === 'calendar' && <HolidayCalendar themeColor={currentTheme} holidays={holidays} onAdd={handleAddHoliday} onEdit={handleEditHoliday} onDelete={handleDeleteHoliday} userRole={user.role} year={currentYear} onYearChange={handleYearChange} />}

                {activeTab === 'schedulings' && <ScheduledVacations users={visibleUsers} schedules={visibleVacationSchedules} themeColor={currentTheme} onAddSchedule={handleAddVacationSchedule} onDeleteSchedule={handleDeleteVacationSchedule} />}
            </>
          )}
        </div>
      </main>

      {user.role === 'admin' && activeTab === 'announcements' && (
        <>
          <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSubmit={async (t, d, type, f, dur) => { setItems(p => [{id: Date.now().toString(), branchId: user.branchId!, title: t, date: new Date().toLocaleDateString(), author: user.name, type: ContentType.ANNOUNCEMENT, content: d, expirationDate: dur ? new Date(Date.now() + dur*86400000).toISOString() : undefined}, ...p]); setIsUploadModalOpen(false); }} />
          <button onClick={() => setIsUploadModalOpen(true)} className={`md:hidden fixed bottom-6 right-6 w-14 h-14 bg-${currentTheme}-600 text-white rounded-full shadow-xl flex items-center justify-center z-40`}>
            <Plus size={24} />
          </button>
        </>
      )}
    </div>
  );
}
