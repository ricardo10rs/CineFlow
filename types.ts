
export enum ContentType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  PDF = 'PDF',
  IMAGE = 'IMAGE'
}

export type UserRole = 'super_admin' | 'admin' | 'employee';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'slate';

export type JobTitle = string; // Dynamic string now

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface User {
  id: string;
  branchId?: string; // Optional for super_admin
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string;
  themeColor?: ThemeColor;
  phone?: string;
  jobTitle?: JobTitle;
  notificationPrefs?: NotificationPreferences;
  hideWeeklySchedule?: boolean; // Nova propriedade para ocultar escala individualmente
  vacationReturnDate?: string; // NEW: Data de retorno das férias (YYYY-MM-DD)
}

export interface AIAnalysis {
  summary: string;
  tags: string[];
  sentiment: string;
}

export interface BaseItem {
  id: string;
  branchId: string;
  title: string;
  date: string;
  author: string;
  analysis?: AIAnalysis;
  targetUserId?: string; // NEW: Optional field to target a specific user (Private Announcement)
}

export interface AnnouncementItem extends BaseItem {
  type: ContentType.ANNOUNCEMENT;
  content: string;
  expirationDate?: string; // ISO String data de validade
}

export interface DocumentItem extends BaseItem {
  type: ContentType.PDF | ContentType.IMAGE;
  description: string;
  url: string;
}

export type AppItem = AnnouncementItem | DocumentItem;

export interface WorkShift {
  id: string;
  branchId: string;
  dayOfWeek: string;
  date?: string; // Added manually editable date
  dayIndex: number; // 0-6 for logic consistency (Make mandatory for validation)
  startTime: string;
  endTime: string;
  type: 'Work' | 'Off' | 'Remote';
  location?: string;
  totalHours?: number;
}

export interface DailySchedule {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: 'Work' | 'Off' | 'SundayOff' | 'Vacation';
  startTime?: string;
  endTime?: string;
}

export interface OffRequest {
  id: string;
  branchId: string;
  userId: string;
  userName: string;
  date: string; // DD/MM
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  resolutionDate?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  date: string;
  timestamp: number; // Timestamp para expiração automática
  read: boolean;
  targetUserId?: string; // NEW: ID do usuário alvo para notificações privadas
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  date: string;
  timestamp: number; // ADDED: To track latest activity order
  isAdmin: boolean;
}

export interface DirectMessage {
  id: string;
  branchId: string;
  userId: string; // Recipient ID
  senderId?: string; // Sender ID (Admin)
  senderName?: string;
  message: string;
  date: string;
  timestamp: number; // Creation timestamp
  expiresAt?: number; // NEW: Specific expiration timestamp set by timer
  read: boolean;
  attachment?: {
    name: string;
    url: string; // Base64
    type: 'PDF' | 'IMAGE';
  };
  replies: Reply[];
}

export interface BreakSession {
  id: string;
  userId: string;
  branchId: string;
  userName: string;
  userAvatar: string;
  startTime: number; // Timestamp do início do intervalo
  duration: number; // Duração em segundos (ex: 3600 para 1h)
  completedAt?: number; // Timestamp de quando terminou (para histórico)
}

export interface ChartData {
  name: string;
  uploads: number;
  views: number;
}

export interface HolidayEvent {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
  color: 'green' | 'orange' | 'yellow' | 'blue' | 'purple' | 'red';
  description?: string;
}

export interface VacationSchedule {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  startDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  status: 'pending' | 'active' | 'completed';
}
