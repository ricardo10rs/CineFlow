
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Loader2, ArrowLeft, KeyRound, Hexagon, User, Building, Phone } from 'lucide-react';

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
        // Tenta fazer o login
        await onLogin(email, password);

        // Se login for bem sucedido, processa o "Salvar Credenciais"
        if (rememberMe) {
          localStorage.setItem('cineflow_saved_email', email);
          localStorage.setItem('cineflow_saved_pass', password);
        } else {
          localStorage.removeItem('cineflow_saved_email');
          localStorage.removeItem('cineflow_saved_pass');
        }

      } else if (mode === 'register') {
        if (password !== regConfirmPass) {
            throw new Error("As senhas não coincidem.");
        }
        await onRegister(regCompany, regName, email, password, regPhone);
        setSuccessMsg('Conta criada com sucesso!');
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

  const renderContent = () => {
      if (mode === 'login') return (
          <>
             <h1 className="text-2xl font-bold text-slate-900 mb-2">CineFlow</h1>
             <p className="text-slate-500 text-sm">Acesse sua conta corporativa</p>
          </>
      );
      if (mode === 'recovery') return (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Recuperação</h1>
            <p className="text-slate-500 text-sm">Recupere seu acesso ao sistema</p>
          </>
      );
      return (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Criar Conta</h1>
            <p className="text-slate-500 text-sm">Cadastro de Administrador</p>
          </>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
             <Hexagon size={40} className="text-white" strokeWidth={2} />
          </div>
          {renderContent()}
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'recovery' && (
              <div className="text-sm text-blue-700 bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
                Informe seu email corporativo. Enviaremos sua senha atual para sua caixa de entrada.
              </div>
            )}

            {mode === 'register' && (
                <>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Empresa</label>
                        <div className="relative">
                            <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={regCompany}
                                onChange={(e) => setRegCompany(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ex: Rede de Cinemas"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seu Nome</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome Completo"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="tel"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="(00) 00000-0000"
                                required
                            />
                        </div>
                    </div>
                </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {mode !== 'recovery' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {mode === 'login' && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer bg-white"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer font-medium">
                    Salvar credenciais
                  </label>
                </div>
              )}
              
              <div className={`text-xs ${mode !== 'login' ? 'w-full text-right' : ''}`}>
                {mode === 'login' ? (
                  <button type="button" onClick={() => setMode('recovery')} className="font-bold text-blue-600 hover:text-blue-500">
                    Esqueceu a senha?
                  </button>
                ) : (
                  <button type="button" onClick={() => { setMode('login'); setError(''); }} className="font-bold text-slate-500 hover:text-slate-700 flex items-center ml-auto">
                    <ArrowLeft size={14} className="mr-1" /> Voltar para Login
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            {successMsg && (
               <div className="text-green-600 text-xs bg-green-50 p-3 rounded-lg border border-green-100 text-center font-medium">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                mode === 'login' ? 'Entrar' : mode === 'register' ? 'Finalizar Cadastro' : 'Recuperar Senha'
              )}
            </button>

            {mode === 'login' && (
                <div className="pt-4 text-center border-t border-slate-50 mt-4">
                    <p className="text-xs text-slate-500 mb-2">Novo por aqui?</p>
                    <button 
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                        Cadastrar Administrador
                    </button>
                </div>
            )}
          </form>

          {mode === 'login' && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-3 font-bold">Credenciais de Teste:</p>
                <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Super Admin:</span> <span className="font-mono text-slate-600">super@arco.com / 123</span>
                </div>
                <div className="flex justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Admin Unidade:</span> <span className="font-mono text-slate-600">admin@empresa.com / 123</span>
                </div>
                <div className="flex justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Funcionário:</span> <span className="font-mono text-slate-600">maria@empresa.com / 123</span>
                </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
