
import React, { useState, useRef, useEffect } from 'react';
import { AnnouncementItem, ThemeColor, UserRole, DirectMessage, User } from '../types';
import { Calendar, Trash2, Clock, UserCircle, CheckCircle2, Layout, AlertCircle, MessageCircle, Send, FileText, Image as ImageIcon, Coffee, Sparkles, Sun, Smile, Plus, X, Paperclip, Search } from 'lucide-react';

interface AnnouncementsProps {
  items: AnnouncementItem[];
  themeColor: ThemeColor;
  userRole: UserRole;
  onDelete: (id: string) => void;
  userName: string;
  messages?: DirectMessage[];
  onReply?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  title?: string;
  subtitle?: string;
  // New props for sending new messages
  users?: User[];
  onSendMessage?: (userId: string, message: string, file?: File, durationMinutes?: number) => void;
  userGender?: string; 
}

// Internal component for Gender-based Flat Illustrations
const RelaxedIllustration = ({ gender, themeColor, variant = 1 }: { gender?: string, themeColor: ThemeColor, variant?: number }) => {
    
    // Helper to map theme names to hex colors for SVG usage
    const getThemeHex = (shade: number) => {
        const colors: Record<string, Record<number, string>> = {
            blue: { 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700:'#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
            green: { 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700:'#15803d', 800: '#166534', 900: '#14532d' },
            purple: { 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700:'#7e22ce', 800: '#6b21a8', 900: '#581c87' },
            pink: { 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700:'#be185d', 800: '#9d174d', 900: '#831843' },
            orange: { 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700:'#c2410c', 800: '#9a3412', 900: '#7c2d12' },
            slate: { 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700:'#334155', 800: '#1e293b', 900: '#0f172a' },
        };
        const theme = colors[themeColor] || colors.blue;
        return theme[shade];
    };

    // Realistic Skin Tones
    const skinBaseF = "#F5D0B5"; // Light Warm
    const skinShadowF = "#E8B99B";
    const skinBaseM = "#EACBAA"; // Neutral
    const skinShadowM = "#D6B08C";
    const hairColor = "#2c2c2c";

    // --- FEMALE ILLUSTRATIONS ---
    if (gender === 'female') {
        if (variant === 2) {
             // VARIANT 2: Standing with Coffee (Stylish)
             return (
                <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id={`coat-${themeColor}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={getThemeHex(500)} />
                            <stop offset="100%" stopColor={getThemeHex(700)} />
                        </linearGradient>
                    </defs>
                    
                    {/* Shadow */}
                    <ellipse cx="170" cy="255" rx="50" ry="8" fill={getThemeHex(900)} opacity="0.1" />

                    {/* Background Element: Tall Plant Right */}
                    <g transform="translate(230, 80)">
                        <path d="M10 180 L 15 200 L 45 200 L 50 180 Z" fill="#9CA3AF" />
                        <path d="M30 180 Q 30 100 10 50" stroke="#166534" strokeWidth="2" fill="none" />
                        <ellipse cx="10" cy="50" rx="15" ry="25" fill="#16a34a" transform="rotate(-20)" />
                        <ellipse cx="30" cy="80" rx="15" ry="25" fill="#15803d" transform="rotate(20)" />
                        <ellipse cx="15" cy="110" rx="15" ry="20" fill="#22c55e" transform="rotate(-10)" />
                    </g>

                    {/* Character Group */}
                    <g transform="translate(130, 30)">
                         {/* Legs */}
                         <path d="M30 150 L 25 220 L 15 225" stroke="#374151" strokeWidth="18" strokeLinecap="round" fill="none" /> {/* Left Leg */}
                         <path d="M50 150 L 55 220 L 65 225" stroke="#1f2937" strokeWidth="18" strokeLinecap="round" fill="none" /> {/* Right Leg */}
                         
                         {/* Shoes */}
                         <path d="M5 225 L 25 225 L 25 232 L 5 232 Z" fill="#111827" />
                         <path d="M55 225 L 75 225 L 75 232 L 55 232 Z" fill="#111827" />

                         {/* Coat/Dress */}
                         <path d="M20 160 L 15 90 C 15 80, 65 80, 65 90 L 60 160 L 70 200 L 10 200 L 20 160 Z" fill={`url(#coat-${themeColor})`} />
                         <path d="M40 90 L 40 200" stroke="rgba(0,0,0,0.1)" strokeWidth="1" /> {/* Coat opening line */}
                         
                         {/* Neck */}
                         <rect x="33" y="75" width="14" height="15" fill={skinBaseF} />

                         {/* Head */}
                         <ellipse cx="40" cy="65" rx="14" ry="18" fill={skinBaseF} />
                         <path d="M38 68 Q 40 66 42 68" stroke="#8B5E3C" strokeWidth="1" fill="none" /> {/* Eye */}
                         <path d="M38 72 Q 41 74 44 72" stroke="#D97757" strokeWidth="1" /> {/* Mouth */}

                         {/* Hair (Short Bob) */}
                         <path d="M40 45 C 25 45, 20 60, 20 70 L 20 75 L 60 75 L 60 70 C 60 60, 55 45, 40 45" fill={hairColor} />
                         
                         {/* Arm (Holding Coffee) */}
                         <path d="M20 100 Q 10 130 35 120" stroke={`url(#coat-${themeColor})`} strokeWidth="14" strokeLinecap="round" fill="none" />
                         <circle cx="38" cy="118" r="4" fill={skinBaseF} />
                         
                         {/* Coffee Cup */}
                         <path d="M35 110 L 37 125 L 47 125 L 49 110 Z" fill="white" stroke="#e5e7eb" />
                         <path d="M36 115 L 48 115" stroke={getThemeHex(400)} strokeWidth="4" />

                         {/* Arm (Hanging) */}
                         <path d="M60 100 Q 65 130 60 150" stroke={`url(#coat-${themeColor})`} strokeWidth="14" strokeLinecap="round" fill="none" />
                         <circle cx="60" cy="155" r="4" fill={skinBaseF} />
                    </g>
                </svg>
             );
        }

        // VARIANT 1: Sitting Yoga (Default)
        return (
             <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={`clothes-${themeColor}`} x1="0" y1="0" x2="1" y2="1">
                         <stop offset="0%" stopColor={getThemeHex(400)} />
                         <stop offset="100%" stopColor={getThemeHex(600)} />
                    </linearGradient>
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="2" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Floor Shadow */}
                <ellipse cx="170" cy="245" rx="90" ry="10" fill={getThemeHex(900)} opacity="0.1" />

                {/* Background Decor: Realistic Plant Pot Left */}
                <g transform="translate(40, 140)">
                     {/* Pot with Theme Accent */}
                     <path d="M10 80 L 15 100 L 45 100 L 50 80 Z" fill="#9CA3AF" />
                     <path d="M10 80 L 50 80 L 48 85 L 12 85 Z" fill={getThemeHex(500)} /> {/* Theme Accent Rim */}
                     {/* Leaves */}
                     <path d="M30 80 Q 10 40 5 20 Q 25 40 30 80" fill="#15803d" />
                     <path d="M30 80 Q 50 30 60 10 Q 55 40 30 80" fill="#16a34a" />
                     <path d="M30 80 Q 15 50 10 30" stroke="#14532d" strokeWidth="0.5" fill="none" />
                </g>

                {/* Character */}
                <g transform="translate(110, 50)" filter="url(#softShadow)">
                    {/* LEGS (Crossed) - Dark neutral pants to contrast with colorful top */}
                    <path d="M30 140 C 10 160, 0 190, 60 195 L 80 185" fill="#374151" /> {/* Left Leg Back */}
                    <path d="M90 140 C 110 160, 120 190, 60 195" fill="#1f2937" /> {/* Right Leg Back */}
                    <path d="M35 150 Q 20 170 50 180" stroke="white" strokeWidth="1" opacity="0.1" fill="none" />

                    {/* TORSO - Theme Color Top */}
                    <path d="M40 145 L 45 80 C 45 75, 75 75, 75 80 L 80 145 C 80 155, 40 155, 40 145 Z" fill={`url(#clothes-${themeColor})`} />
                    <path d="M45 130 Q 60 135 75 128" stroke="black" strokeWidth="1" opacity="0.1" fill="none" />

                    {/* NECK */}
                    <path d="M53 80 L 53 70 L 67 70 L 67 80" fill={skinBaseF} />
                    <path d="M53 72 Q 60 76 67 72" fill={skinShadowF} opacity="0.5" />

                    {/* HEAD */}
                    <path d="M48 45 C 48 30, 72 30, 72 45 C 72 65, 60 72, 48 45" fill={skinBaseF} />
                    <ellipse cx="60" cy="45" rx="13" ry="16" fill={skinBaseF} />

                    {/* Facial Features */}
                    <path d="M54 44 Q 57 42 60 44" stroke="#8B5E3C" strokeWidth="1" fill="none" />
                    <path d="M62 44 Q 65 42 68 44" stroke="#8B5E3C" strokeWidth="1" fill="none" />
                    <path d="M61 48 L 59 52 L 63 52" fill={skinShadowF} opacity="0.6" />
                    <path d="M58 58 Q 61 60 64 58" stroke="#D97757" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M53 40 Q 57 38 60 39" stroke="#5C4033" strokeWidth="1" fill="none" opacity="0.8"/>
                    <path d="M62 39 Q 65 38 69 40" stroke="#5C4033" strokeWidth="1" fill="none" opacity="0.8"/>

                    {/* HAIR */}
                    <path d="M60 20 C 40 20, 35 40, 35 55 C 35 60, 40 65, 45 60" fill={hairColor} />
                    <path d="M60 20 C 70 20, 85 30, 85 55 C 85 65, 80 60, 75 55" fill={hairColor} />
                    <path d="M45 28 C 45 28, 45 40, 40 50" fill="none" stroke={hairColor} strokeWidth="8" />
                    <path d="M75 28 C 75 28, 75 40, 80 50" fill="none" stroke={hairColor} strokeWidth="8" />
                    <circle cx="60" cy="18" r="10" fill={hairColor} />
                    <path d="M55 20 Q 60 15 65 20" stroke="#4B5563" strokeWidth="1" opacity="0.5" fill="none"/>

                    {/* ARMS */}
                    <path d="M45 85 Q 30 110 35 130" stroke={skinBaseF} strokeWidth="8" strokeLinecap="round" fill="none" /> 
                    <path d="M75 85 Q 90 110 85 130" stroke={skinBaseF} strokeWidth="8" strokeLinecap="round" fill="none" /> 
                    <circle cx="35" cy="130" r="5" fill={skinBaseF} />
                    <circle cx="85" cy="130" r="5" fill={skinBaseF} />
                </g>

                 {/* Floating Tablet/Book with Theme Glow */}
                 <g transform="translate(230, 160) rotate(10)" className="animate-pulse" style={{ animationDuration: '4s' }}>
                    <rect x="0" y="0" width="40" height="50" rx="3" fill="#f3f4f6" stroke={getThemeHex(300)} strokeWidth="1.5" />
                    <rect x="5" y="5" width="30" height="40" rx="1" fill="white" />
                    <rect x="8" y="10" width="24" height="2" fill={getThemeHex(200)} />
                    <rect x="8" y="15" width="20" height="2" fill={getThemeHex(200)} />
                    <rect x="8" y="20" width="24" height="2" fill={getThemeHex(200)} />
                 </g>
            </svg>
        );
    }
    
    // --- MALE ILLUSTRATIONS ---
    if (variant === 2) {
        // VARIANT 2: Leaning with Tablet
        return (
             <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={`shirt-${themeColor}`} x1="0" y1="0" x2="1" y2="1">
                         <stop offset="0%" stopColor={getThemeHex(400)} />
                         <stop offset="100%" stopColor={getThemeHex(600)} />
                    </linearGradient>
                </defs>
                
                {/* Wall/Desk Shadow */}
                <path d="M190 80 L 190 250" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
                <ellipse cx="150" cy="255" rx="60" ry="10" fill={getThemeHex(900)} opacity="0.1" />

                {/* Character */}
                <g transform="translate(110, 40)">
                     {/* Legs Leaning */}
                     <path d="M30 150 L 35 230" stroke="#374151" strokeWidth="18" strokeLinecap="round" />
                     <path d="M50 150 L 65 230" stroke="#1f2937" strokeWidth="18" strokeLinecap="round" />
                     
                     {/* Shoes */}
                     <path d="M20 230 L 50 230 L 45 238 L 20 238 Z" fill="#111827" />
                     <path d="M55 230 L 80 230 L 75 238 L 55 238 Z" fill="#111827" />

                     {/* Torso */}
                     <path d="M25 155 L 20 80 C 20 75, 60 75, 60 80 L 65 155 L 25 155 Z" fill={`url(#shirt-${themeColor})`} />
                     <path d="M42 80 L 42 155" stroke="rgba(0,0,0,0.1)" strokeWidth="1" /> {/* Shirt seam */}

                     {/* Head */}
                     <rect x="33" y="70" width="14" height="15" fill={skinBaseM} /> {/* Neck */}
                     <ellipse cx="40" cy="60" rx="15" ry="19" fill={skinBaseM} />
                     <path d="M25 45 C 25 40, 35 35, 45 35 C 55 35, 60 45, 60 55 L 60 60 L 25 60 Z" fill={hairColor} /> {/* Hair */}
                     <path d="M36 62 Q 39 60 42 62" stroke="#4B5563" strokeWidth="1" fill="none" /> {/* Eye */}
                     <path d="M46 62 Q 49 60 52 62" stroke="#4B5563" strokeWidth="1" fill="none" /> {/* Eye */}
                     <path d="M39 70 Q 44 72 49 70" stroke="#D97757" strokeWidth="1.5" /> {/* Smile */}

                     {/* Arm holding Tablet */}
                     <path d="M20 85 Q 0 110 25 120" stroke={`url(#shirt-${themeColor})`} strokeWidth="14" strokeLinecap="round" fill="none" />
                     <circle cx="25" cy="120" r="5" fill={skinBaseM} />
                     
                     {/* Tablet */}
                     <rect x="20" y="105" width="25" height="35" rx="2" fill="#1e293b" transform="rotate(-15 32 122)" />
                     <rect x="22" y="107" width="21" height="31" rx="1" fill="white" transform="rotate(-15 32 122)" />
                     <rect x="24" y="115" width="17" height="2" fill={getThemeHex(400)} transform="rotate(-15 32 122)" />
                     <rect x="24" y="120" width="12" height="2" fill={getThemeHex(200)} transform="rotate(-15 32 122)" />
                </g>
             </svg>
        );
    }

    // VARIANT 1: Male Beanbag (Default)
    return (
        <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
             <defs>
                <linearGradient id={`grad-m-${themeColor}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={getThemeHex(500)} />
                    <stop offset="100%" stopColor={getThemeHex(700)} />
                </linearGradient>
                <filter id="shadowM" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={getThemeHex(900)} floodOpacity="0.2" />
                </filter>
            </defs>

             {/* Floor Shadow */}
             <ellipse cx="150" cy="250" rx="100" ry="12" fill={getThemeHex(900)} opacity="0.1" />

             {/* BEANBAG CHAIR */}
             <path d="M60 160 C 50 230, 200 250, 230 180 C 240 130, 140 120, 60 160" fill="#475569" filter="url(#shadowM)" />
             <path d="M70 165 C 65 220, 200 230, 220 180 C 220 140, 120 140, 70 165" fill="#334155" /> {/* Inner shading */}
             <path d="M80 170 Q 150 150 210 180" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.2" />

             {/* CHARACTER GROUP */}
             <g transform="translate(10, 20)">
                 
                 {/* Right Leg (Behind) */}
                 <path d="M150 170 L 190 200 L 170 235" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" fill="none" />
                 
                 {/* Left Leg (Front) */}
                 <path d="M110 170 L 130 200 L 170 205" stroke="#334155" strokeWidth="22" strokeLinecap="round" fill="none" />
                 
                 {/* Shoes */}
                 <g transform="translate(160, 225) rotate(10)">
                    <path d="M0 0 L 0 10 L 25 10 Q 30 5 25 0 Z" fill="white" />
                    <path d="M0 10 L 25 10" stroke={getThemeHex(600)} strokeWidth="4" />
                    <path d="M5 0 L 15 0" stroke="#cbd5e1" strokeWidth="2" />
                 </g>
                 <g transform="translate(155, 195) rotate(5)">
                    <path d="M0 0 L 0 10 L 25 10 Q 30 5 25 0 Z" fill="#f8fafc" />
                    <path d="M0 10 L 25 10" stroke={getThemeHex(600)} strokeWidth="4" />
                 </g>

                 {/* TORSO (Hoodie) - Uses Theme Color */}
                 <path d="M95 160 L 90 100 C 90 90, 160 90, 160 100 L 155 160 L 95 160 Z" fill={`url(#grad-m-${themeColor})`} />
                 <path d="M125 100 L 125 140" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                 <path d="M110 140 Q 125 145 140 140" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />

                 {/* NECK */}
                 <path d="M115 100 L 115 90 L 135 90 L 135 100" fill={skinBaseM} />
                 
                 {/* HEAD */}
                 <ellipse cx="125" cy="80" rx="20" ry="24" fill={skinBaseM} />
                 <path d="M125 104 C 115 104, 110 100, 125 100 C 140 100, 135 104, 125 104" fill={skinShadowM} opacity="0.3" />

                 {/* Facial Features */}
                 <path d="M126 84 L 122 88 L 128 88" fill={skinShadowM} />
                 <path d="M120 94 Q 125 96 130 94" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" />
                 <path d="M115 80 L 135 80" stroke="#374151" strokeWidth="1.5" />
                 <circle cx="118" cy="80" r="6" stroke="#374151" strokeWidth="1.5" fill="rgba(255,255,255,0.2)" />
                 <circle cx="132" cy="80" r="6" stroke="#374151" strokeWidth="1.5" fill="rgba(255,255,255,0.2)" />
                 <path d="M115 74 Q 118 72 122 74" stroke="#4B5563" strokeWidth="1.5" fill="none" />
                 <path d="M128 74 Q 132 72 135 74" stroke="#4B5563" strokeWidth="1.5" fill="none" />
                 
                 {/* Beard/Stubble */}
                 <path d="M110 85 Q 125 105 140 85" fill="#D6B08C" opacity="0.3" />

                 {/* HAIR (Modern Cut) */}
                 <path d="M105 70 C 105 60, 115 50, 125 50 C 140 50, 145 60, 145 75 L 145 80 L 142 80 L 142 70 C 142 70, 135 60, 125 60 C 115 60, 108 70, 108 80 L 105 80 Z" fill={hairColor} />
                 <path d="M125 50 Q 135 45 140 55" fill={hairColor} />

                 {/* ARMS (Holding Device) */}
                 <path d="M100 110 Q 80 130 110 145" stroke={skinBaseM} strokeWidth="12" strokeLinecap="round" fill="none" /> 
                 <path d="M150 110 Q 170 130 140 145" stroke={skinBaseM} strokeWidth="12" strokeLinecap="round" fill="none" />

                 {/* PHONE */}
                 <rect x="115" y="135" width="20" height="30" rx="2" fill="#1e293b" transform="rotate(-10 125 150)" />
                 <rect x="117" y="137" width="16" height="24" rx="1" fill={getThemeHex(400)} transform="rotate(-10 125 150)" />
                 <circle cx="125" cy="162" r="1" fill="#fff" transform="rotate(-10 125 150)" opacity="0.5" />
             </g>

             {/* COFFEE CUP on Floor */}
             <g transform="translate(260, 230)">
                <ellipse cx="12" cy="18" rx="8" ry="3" fill="#000" opacity="0.2" />
                <path d="M4 18 L 6 0 L 18 0 L 20 18 Z" fill="white" stroke="#e2e8f0" />
                <path d="M6 0 L 18 0" stroke="#e2e8f0" strokeWidth="1" />
                <path d="M5 8 L 19 8 L 18 14 L 6 14 Z" fill={getThemeHex(600)} />
                <path d="M8 -5 Q 12 -10 8 -15" stroke={getThemeHex(300)} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                <path d="M16 -8 Q 20 -14 16 -20" stroke={getThemeHex(300)} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
             </g>
        </svg>
    );
};

export const Announcements: React.FC<AnnouncementsProps> = ({ 
  items, 
  themeColor, 
  userRole, 
  onDelete, 
  userName, 
  messages = [], 
  onReply, 
  onDeleteMessage,
  onMarkAsRead, 
  title = "Mural de Avisos",
  subtitle = "Atualizações e comunicados importantes da empresa.",
  users = [],
  onSendMessage,
  userGender = 'female'
}) => {
  const firstName = userName.split(' ')[0];
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // New Message Modal States
  const [isNewMsgModalOpen, setIsNewMsgModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageDuration, setNewMessageDuration] = useState('1440');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Illustration Variant Randomizer
  const [illustrationVariant, setIllustrationVariant] = useState(1);
  useEffect(() => {
    // Randomly pick variant 1 or 2 on mount
    setIllustrationVariant(Math.random() > 0.5 ? 2 : 1);
  }, []);

  const handleReplyChange = (id: string, text: string) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  const submitReply = (id: string) => {
      const text = replyText[id];
      if (text && text.trim() && onReply) {
          onReply(id, text);
          setReplyText(prev => ({ ...prev, [id]: '' }));
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleSubmitNewMessage = () => {
      if (targetUserId && newMessageText && onSendMessage) {
          const duration = parseInt(newMessageDuration);
          onSendMessage(targetUserId, newMessageText, selectedFile || undefined, duration);
          
          // Reset and Close
          setIsNewMsgModalOpen(false);
          setTargetUserId('');
          setNewMessageText('');
          setSelectedFile(null);
          setNewMessageDuration('1440');
      }
  };

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* NEW MESSAGE MODAL */}
      {isNewMsgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                        <MessageCircle size={18} className="mr-2 text-blue-500" />
                        Nova Mensagem Privada
                    </h3>
                    <button onClick={() => setIsNewMsgModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {/* User Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Para quem?</label>
                        <div className="relative">
                            <UserCircle size={16} className="absolute left-3 top-3 text-slate-400" />
                            <select 
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 appearance-none"
                            >
                                <option value="">Selecione um funcionário...</option>
                                {users.filter(u => u.role !== 'super_admin').map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} {u.jobTitle ? `(${u.jobTitle})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Message Body */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem</label>
                        <textarea 
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Digite sua mensagem aqui..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Timer */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Visibilidade</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <select 
                                    value={newMessageDuration}
                                    onChange={(e) => setNewMessageDuration(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 appearance-none"
                                >
                                    <option value="15">15 Minutos</option>
                                    <option value="60">1 Hora</option>
                                    <option value="360">6 Horas</option>
                                    <option value="1440">24 Horas</option>
                                    <option value="2880">48 Horas</option>
                                </select>
                            </div>
                        </div>

                        {/* Attachment */}
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Anexo</label>
                             <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center justify-center transition-colors h-[38px]"
                                >
                                    <Paperclip size={14} className="mr-2" />
                                    {selectedFile ? 'Alterar' : 'Anexar'}
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={handleFileSelect}
                                />
                             </div>
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <div className="flex items-center overflow-hidden">
                                {selectedFile.type.includes('pdf') ? <FileText size={14} className="text-blue-600 mr-2 shrink-0" /> : <ImageIcon size={14} className="text-blue-600 mr-2 shrink-0" />}
                                <span className="text-xs text-blue-800 truncate">{selectedFile.name}</span>
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="text-blue-400 hover:text-red-500 ml-2">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={handleSubmitNewMessage}
                        disabled={!newMessageText.trim() || !targetUserId}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} className="mr-2" />
                        Enviar Mensagem
                    </button>
                </div>
            </div>
          </div>
      )}

      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
         </div>
         <div className="flex items-center gap-3">
             {(items.length > 0 || messages.length > 0) && (
                <span className={`bg-${themeColor}-50 text-${themeColor}-700 border border-${themeColor}-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm`}>
                    <AlertCircle size={14} className="mr-1.5" />
                    {items.length + messages.length} {items.length + messages.length === 1 ? 'ativo' : 'ativos'}
                </span>
             )}
             
             {/* Add Button for Admins in Message View */}
             {isAdmin && onSendMessage && (
                 <button 
                    onClick={() => setIsNewMsgModalOpen(true)}
                    className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white p-2 rounded-full shadow-lg shadow-${themeColor}-500/30 transition-all active:scale-95`}
                    title="Nova Mensagem Privada"
                 >
                    <Plus size={20} />
                 </button>
             )}
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* DIRECT MESSAGES SECTION */}
        {messages.map((msg, index) => (
          <div 
            key={msg.id}
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            className="relative bg-white rounded-xl p-6 shadow-md border-l-4 border-l-purple-500 border-y border-r border-slate-100 group animate-fade-in"
          >
            <div className="flex flex-col space-y-4">
               {/* Header of Message */}
               <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                       <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                          <MessageCircle size={20} />
                       </div>
                       <div>
                           <h3 className="text-base font-bold text-slate-800">Mensagem Direta</h3>
                           <p className="text-xs text-slate-500 flex items-center">
                               {/* If Admin viewing: Show who it was sent TO. If Employee: Show who sent it. */}
                               {isAdmin ? (
                                   <span className="font-semibold text-purple-600 mr-1">Para: {users.find(u => u.id === msg.userId)?.name || 'Usuário'}</span>
                               ) : (
                                   <span className="font-semibold text-purple-600 mr-1">{msg.senderName || 'Administração'}</span>
                               )}
                               • {msg.date}
                           </p>
                       </div>
                   </div>
                   
                   {/* Delete Message Button (Admin Only) */}
                   {userRole !== 'employee' && onDeleteMessage && (
                       <button 
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             onDeleteMessage(msg.id);
                           }}
                           className="flex items-center text-xs font-bold text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-100 cursor-pointer z-10"
                           title="Encerrar Conversa (Remove a aba para o funcionário)"
                       >
                           <Trash2 size={14} className="mr-1.5" />
                           Encerrar Conversa
                       </button>
                   )}
               </div>
               
               {/* Message Body */}
               <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                   {msg.message}
                   
                   {msg.attachment && (
                        <div className="mt-3 flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 w-fit">
                            {msg.attachment.type === 'PDF' ? <FileText size={16} className="text-red-500" /> : <ImageIcon size={16} className="text-blue-500" />}
                            <span className="text-xs font-medium text-slate-700">{msg.attachment.name}</span>
                            <a href={msg.attachment.url} download={msg.attachment.name} className="text-[10px] text-blue-600 font-bold hover:underline ml-2">Baixar</a>
                        </div>
                   )}
               </div>

               {/* Replies Thread */}
               {msg.replies.length > 0 && (
                   <div className="space-y-3 pl-4 border-l-2 border-slate-100 mt-2">
                       {msg.replies.map(reply => (
                           <div key={reply.id} className={`flex flex-col ${reply.isAdmin ? 'items-start' : 'items-end'}`}>
                               <div className={`max-w-[85%] p-3 rounded-lg text-sm ${reply.isAdmin ? 'bg-purple-50 text-slate-700 rounded-tl-none' : 'bg-blue-50 text-slate-700 rounded-tr-none'}`}>
                                   <p>{reply.content}</p>
                               </div>
                               <span className="text-[10px] text-slate-400 mt-1">{reply.authorName} • {reply.date}</span>
                           </div>
                       ))}
                   </div>
               )}

               {/* Reply Input */}
               <div className="mt-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={replyText[msg.id] || ''}
                            onChange={(e) => handleReplyChange(msg.id, e.target.value)}
                            placeholder="Escreva sua resposta..."
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && submitReply(msg.id)}
                        />
                        <button 
                            onClick={() => submitReply(msg.id)}
                            disabled={!replyText[msg.id]}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4"
                        >
                            <Send size={16} />
                            <span className="text-xs font-bold hidden sm:inline">
                                Responder
                            </span>
                        </button>
                    </div>
                    {userRole === 'employee' && (
                        <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                            A conversa permanecerá ativa até que o administrador a encerre.
                        </p>
                    )}
               </div>
            </div>
          </div>
        ))}

        {/* REGULAR ANNOUNCEMENTS */}
        {items.map((item, index) => (
          <div 
            key={item.id} 
            style={{ animationDelay: `${(messages.length + index) * 0.1}s`, animationFillMode: 'both' }}
            className={`
              relative bg-white rounded-xl p-6 shadow-sm border border-slate-100 
              hover:shadow-md transition-all duration-300 group overflow-hidden animate-fade-in
              ${item.targetUserId ? 'bg-blue-50/30' : ''}
            `}
          >
            {/* Colored Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${item.targetUserId ? 'blue' : themeColor}-500`}></div>

            <div className="pl-4 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1 mr-4">
                  
                  {/* Metadata Row */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
                      <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <span className="uppercase tracking-wider font-bold mr-2 text-[10px] text-slate-400">Por</span>
                        {item.author}
                      </div>
                      
                      <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <Calendar size={12} className="mr-1.5 text-slate-400" />
                        <span>{item.date}</span>
                      </div>

                      {item.targetUserId && (
                           <div className="flex items-center text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm">
                                <UserCircle size={12} className="mr-1.5" />
                                <span>Mensagem Privada</span>
                           </div>
                      )}

                      {(userRole === 'admin' || userRole === 'super_admin') && item.expirationDate && (
                          <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100" title="Data de Expiração">
                             <Clock size={12} className="mr-1.5" />
                             <span>Expira: {new Date(item.expirationDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                      )}
                  </div>

                  <h3 className={`text-xl font-bold text-slate-800 leading-snug group-hover:text-${themeColor}-600 transition-colors pt-1`}>
                    {item.title}
                  </h3>
                </div>
                
                <div className="flex items-center pl-2">
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Comunicado"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-slate-600 leading-relaxed text-sm border-t border-slate-50 pt-4">
                <p className="whitespace-pre-line">{item.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State Card - Visually Rich & Relaxed */}
        {items.length === 0 && messages.length === 0 && (
          <div className={`
            relative overflow-hidden rounded-3xl p-12 text-center min-h-[450px] flex flex-col items-center justify-center
            bg-white border border-slate-200 shadow-sm
            animate-fade-in group
          `}>
             {/* Dynamic Background Shapes */}
             <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-${themeColor}-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60`}></div>
             <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-${themeColor}-100 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-40`}></div>
             
             {/* Main Illustration Container */}
             <div className="relative z-10 mb-8 transform transition-transform duration-700 group-hover:scale-[1.02]">
                 <div className="flex items-center justify-center">
                    {title === 'Mensagens Recebidas' ? (
                       <div className="bg-slate-50 p-6 rounded-full border border-slate-100">
                           <MessageCircle size={64} className={`text-${themeColor}-400 drop-shadow-sm`} strokeWidth={1.5} />
                       </div>
                    ) : (
                       // CUSTOM ILLUSTRATION BASED ON GENDER & RANDOM VARIANT
                       <RelaxedIllustration gender={userGender} themeColor={themeColor} variant={illustrationVariant} />
                    )}
                 </div>
             </div>
             
             <div className="relative z-10 max-w-md mx-auto space-y-3">
                <h3 className={`text-3xl font-black tracking-tight text-slate-800`}>
                    {title === 'Mensagens Recebidas' ? 'Caixa limpa!' : 'Tudo tranquilo por aqui!'}
                </h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    {title === 'Mensagens Recebidas' 
                      ? 'Você leu todas as suas mensagens. Hora de focar no que importa!' 
                      : `Relaxa, ${firstName}! O mural de avisos está zerado.`}
                </p>
                
                <div className="pt-6">
                    {isAdmin && title === 'Mensagens Recebidas' ? (
                        <button 
                            onClick={() => setIsNewMsgModalOpen(true)}
                            className={`
                                inline-flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-all
                                bg-${themeColor}-600 text-white shadow-${themeColor}-500/30 hover:bg-${themeColor}-700 hover:scale-105
                            `}
                        >
                            <Plus size={18} className="mr-2" />
                            Nova Mensagem
                        </button>
                    ) : (
                        <span className={`
                            inline-flex items-center px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all
                            bg-white text-${themeColor}-600 border border-${themeColor}-100
                            group-hover:shadow-md group-hover:border-${themeColor}-200 group-hover:-translate-y-0.5
                        `}>
                            {title === 'Mensagens Recebidas' ? (
                                <>✨ Nenhuma pendência</>
                            ) : (
                                <>🚀 Aproveite o dia</>
                            )}
                        </span>
                    )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
