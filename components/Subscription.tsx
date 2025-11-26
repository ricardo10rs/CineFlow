
import React, { useState } from 'react';
import { ThemeColor } from '../types';
import { CreditCard, Check, ShieldCheck, Zap, Receipt, Loader2, Lock } from 'lucide-react';

interface SubscriptionProps {
  themeColor: ThemeColor;
}

export const Subscription: React.FC<SubscriptionProps> = ({ themeColor }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [planType, setPlanType] = useState<'monthly' | 'annual'>('monthly');

  const handlePayment = () => {
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setPaymentStatus('paid');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl bg-${themeColor}-100 text-${themeColor}-600`}>
            <CreditCard size={24} strokeWidth={2} />
            </div>
            <div>
            <h2 className="text-xl font-bold text-slate-800">Assinatura e Faturamento</h2>
            <p className="text-sm text-slate-500">Gerencie o plano e os pagamentos do CineFlow.</p>
            </div>
        </div>
        
        {/* Plan Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center self-start md:self-auto">
            <button
                onClick={() => setPlanType('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${planType === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Mensal
            </button>
                <button
                onClick={() => setPlanType('annual')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${planType === 'annual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Anual
                <span className="bg-green-100 text-green-700 text-[10px] px-1.5 rounded border border-green-200 uppercase">Econômico</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Plan Details */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card */}
            <div className={`rounded-2xl p-6 border ${paymentStatus === 'paid' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {paymentStatus === 'paid' ? <ShieldCheck size={24} /> : <Zap size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Plano CineFlow PRO {planType === 'monthly' ? 'Mensal' : 'Anual'}</h3>
                            <p className={`text-sm font-medium ${paymentStatus === 'paid' ? 'text-green-700' : 'text-slate-500'}`}>
                                {paymentStatus === 'paid' 
                                    ? `Assinatura Ativa • Renovação em ${planType === 'monthly' ? '30 dias' : '1 ano'}` 
                                    : 'Aguardando Pagamento'}
                            </p>
                        </div>
                    </div>
                    {paymentStatus === 'paid' && (
                        <span className="bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Pago
                        </span>
                    )}
                </div>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Zap size={18} className={`text-${themeColor}-500`} />
                    O que está incluso no seu plano:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "Usuários Ilimitados",
                        "Gestão de Múltiplas Unidades",
                        "Escalas Inteligentes com IA",
                        "Controle de Ponto (QR Code)",
                        "Monitoramento de Intervalos",
                        "Gestão de Férias",
                        "Mural de Avisos & Chat",
                        "Suporte Prioritário 24/7"
                    ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-green-600" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invoice History (Mock) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                    <Receipt size={18} className="text-slate-400" />
                    <h4 className="font-bold text-slate-800">Histórico de Faturas</h4>
                </div>
                <div className="divide-y divide-slate-50">
                    <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                        <div>
                            <p className="text-sm font-bold text-slate-700">Fatura #001 - Outubro/2023</p>
                            <p className="text-xs text-slate-400">Pago em 25/10/2023</p>
                        </div>
                        <span className="text-sm font-mono text-slate-600">R$ 29,90</span>
                    </div>
                     <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                        <div>
                            <p className="text-sm font-bold text-slate-700">Fatura #002 - Setembro/2023</p>
                            <p className="text-xs text-slate-400">Pago em 25/09/2023</p>
                        </div>
                        <span className="text-sm font-mono text-slate-600">R$ 29,90</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Payment Action */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-8">
                <div className={`bg-${themeColor}-600 p-6 text-white text-center transition-all duration-300`}>
                    <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">
                        {planType === 'monthly' ? 'Plano Mensal' : 'Plano Anual'}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-medium opacity-80">R$</span>
                        <span className="text-5xl font-black tracking-tight">
                            {planType === 'monthly' ? '29,90' : '349,90'}
                        </span>
                    </div>
                    <p className="text-white/80 text-xs mt-2">
                        {planType === 'monthly' ? '/ mês' : '/ ano'}
                    </p>
                    {planType === 'annual' && (
                        <div className="mt-3 bg-white/20 text-white text-[10px] font-bold py-1 px-3 rounded-full inline-block">
                            Economize R$ 8,90/ano
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {paymentStatus === 'pending' ? (
                        <>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Cartão Cadastrado</span>
                                        <CreditCard size={16} className="text-slate-400" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-white text-[10px] font-bold">VISA</div>
                                        <span className="font-mono text-slate-700 text-sm">•••• •••• •••• 4242</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                    ${isLoading ? 'bg-slate-400 cursor-wait' : `bg-${themeColor}-600 hover:bg-${themeColor}-700 hover:scale-[1.02] shadow-${themeColor}-500/30`}
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Pagar {planType === 'monthly' ? 'R$ 29,90' : 'R$ 349,90'}
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                                <Lock size={10} /> Pagamento 100% seguro via Stripe
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Check size={32} strokeWidth={4} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Pagamento Confirmado!</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Sua assinatura {planType === 'monthly' ? 'mensal' : 'anual'} foi renovada com sucesso.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
