
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Loader2, ArrowLeft, User, Building, Phone, Hexagon, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRecoverPassword: (email: string) => Promise<void>;
  onRegister: (companyName: string, name: string, email: string, pass: string, phone: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRecoverPassword, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'recovery' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register specific states
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('cineflow_saved_email');
    const savedPass = localStorage.getItem('cineflow_saved_pass');
    
    if (savedEmail && savedPass && mode === 'login') {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await onLogin(email, password);
        if (rememberMe) {
          localStorage.setItem('cineflow_saved_email', email);
          localStorage.setItem('cineflow_saved_pass', password);
        } else {
          localStorage.removeItem('cineflow_saved_email');
          localStorage.removeItem('cineflow_saved_pass');
        }
      } else if (mode === 'register') {
        if (password !== regConfirmPass) throw new Error("As senhas não coincidem.");
        await onRegister(regCompany, regName, email, password, regPhone);
        setSuccessMsg('Conta criada com sucesso!');
        setTimeout(() => setMode('login'), 2000);
      } else {
        await onRecoverPassword(email);
        setSuccessMsg('Sua senha foi enviada para o email cadastrado.');
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-slate-900 font-sans">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
            alt="Workspace Background" 
            className="w-full h-full object-cover opacity-50"
        />
        {/* Gradient Overlay - Matching the "Workout" reference style but with Blue/Indigo theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/80 to-slate-900"></div>
      </div>

      {/* Background Shapes (Logo Branding) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Hexagon strokeWidth={1} className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] text-white/5 rotate-12" />
          <Hexagon strokeWidth={1} className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] text-white/5 -rotate-12" />
          <Hexagon strokeWidth={1.5} className="absolute -bottom-[10%] right-[20%] w-[300px] h-[300px] text-indigo-500/10 rotate-45" />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col h-full md:h-auto justify-center min-h-screen md:min-h-0 animate-fade-in-up">
        
        {/* Header Section - Centered */}
        <div className="mb-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/30 shadow-lg">
                <Hexagon size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-lg">
                {mode === 'login' ? 'CineFlow' : mode === 'register' ? 'Criar Conta' : 'Recuperar'}
            </h1>
            <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-2xl leading-relaxed">
                {mode === 'login' 
                    ? 'Soluções em gestão e comunicação empresarial.' 
                    : mode === 'register' 
                    ? 'Comece a gerenciar sua equipe hoje.' 
                    : 'Informe seu email para continuar.'}
            </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            
            {/* Error/Success Messages */}
            {error && <div className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold p-3 rounded-2xl text-center shadow-lg">{error}</div>}
            {successMsg && <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold p-3 rounded-2xl text-center shadow-lg">{successMsg}</div>}

            {mode === 'register' && (
                <>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Building size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input type="text" value={regCompany} onChange={(e) => setRegCompany(e.target.value)} placeholder="Nome da Empresa" required
                            className="block w-full pl-12 pr-5 py-4 bg-white rounded-full text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Seu Nome" required
                            className="block w-full pl-12 pr-5 py-4 bg-white rounded-full text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Phone size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="Telefone" required
                            className="block w-full pl-12 pr-5 py-4 bg-white rounded-full text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg transition-all"
                        />
                    </div>
                </>
            )}

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-5 py-4 bg-white rounded-full text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg transition-all"
                    placeholder="Email corporativo"
                    required
                />
            </div>

            {mode !== 'recovery' && (
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-12 py-4 bg-white rounded-full text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg transition-all"
                        placeholder="Senha"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            )}

            {mode === 'register' && (
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                        type="password"
                        value={regConfirmPass}
                        onChange={(e) => setRegConfirmPass(e.target.value)}
                        className="block w-full pl-12 pr-5 py-4 bg-white rounded-full text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-lg transition-all"
                        placeholder="Confirmar Senha"
                        required
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-wide text-sm py-4 px-6 rounded-full shadow-xl shadow-indigo-900/30 transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'CRIAR CONTA' : 'RECUPERAR')}
            </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-8 w-full">
            {mode === 'login' && (
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2">
                        <input 
                            id="remember" 
                            type="checkbox" 
                            checked={rememberMe} 
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-sm font-medium text-white/80 cursor-pointer">Lembrar de mim</label>
                    </div>
                    
                    <div className="flex justify-between w-full text-sm font-bold px-2">
                        <button onClick={() => setMode('recovery')} className="text-indigo-200 hover:text-white transition-colors">
                            Esqueceu a senha?
                        </button>
                        <button onClick={() => setMode('register')} className="text-white hover:text-indigo-200 transition-colors">
                            Criar conta
                        </button>
                    </div>
                </div>
            )}

            {mode !== 'login' && (
                <button onClick={() => { setMode('login'); setError(''); }} className="w-full flex items-center justify-center text-white/80 hover:text-white font-bold text-sm transition-colors mt-4">
                    <ArrowLeft size={16} className="mr-2" /> Voltar para Login
                </button>
            )}
        </div>

        {/* Demo Credentials - Restored Visibility */}
        {mode === 'login' && (
            <div className="mt-8 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center w-full shadow-lg">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-3">Acesso Demo (Admin / Func)</p>
                <div className="flex flex-col gap-2 text-sm text-white font-mono">
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                        <span className="opacity-80">super@arco.com</span>
                        <span className="font-bold">123</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                        <span className="opacity-80">admin@empresa.com</span>
                        <span className="font-bold">123</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                        <span className="opacity-80">maria@empresa.com</span>
                        <span className="font-bold">123</span>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
