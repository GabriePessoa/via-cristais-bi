
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle, Info, FileText, X } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { signIn, signUp, verifyCode } = useAuth();
  const [view, setView] = useState<'login' | 'register' | 'verify'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      if (result.requiresCode) {
        setView('verify');
        setSuccessMsg('Validação necessária. Insira o código enviado pelo administrador.');
      }
    } else {
      setError(result.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Você precisa aceitar a Política de Privacidade e Tratamento de Dados.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await signUp(name, email, password, acceptedTerms);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setView('login');
        setSuccessMsg('');
        setPassword('');
      }, 3000);
    } else {
      setError(result.message);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const isValid = await verifyCode(email, code);
    setLoading(false);

    if (!isValid) {
      setError('Código inválido ou incorreto.');
    }
  };

  return (
    <div className="min-h-screen bg-[#052144] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative z-20">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-r from-[#052144] to-[#0a3560] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#52C1DD] to-[#8DC63F]"></div>
          <div className="relative z-10">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                <ShieldCheck className="text-[#52C1DD]" size={32} />
             </div>
             <h1 className="text-2xl font-black text-white uppercase tracking-tight">Via Cristais</h1>
             <p className="text-[#52C1DD] text-xs font-bold uppercase tracking-[0.3em] mt-1">Gestão de Operações</p>
          </div>
          {/* Background Pattern */}
          <div className="absolute -right-6 -bottom-6 text-white/5 rotate-12">
            <Lock size={120} />
          </div>
        </div>

        <div className="p-8 pb-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2 animate-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#052144] font-bold text-[#052144]" placeholder="nome@viacristais.com.br" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#052144] font-bold text-[#052144]" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#052144] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#0a3560] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                {loading ? 'Acessando...' : <>Entrar <ArrowRight size={18} /></>}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setView('register'); setError(''); setSuccessMsg(''); }} className="text-xs font-bold text-slate-400 hover:text-[#52C1DD] transition-colors">
                  Não possui acesso? Solicitar cadastro
                </button>
              </div>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#052144] font-bold text-[#052144]" placeholder="Seu Nome" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#052144] font-bold text-[#052144]" placeholder="nome@viacristais.com.br" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#052144] font-bold text-[#052144]" placeholder="Crie uma senha forte" />
                </div>
              </div>
              
              {/* LGPD Consent */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow transition-all checked:border-[#52C1DD] checked:bg-[#52C1DD] hover:shadow-md"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                 </div>
                 <label htmlFor="terms" className="text-[10px] text-slate-500 font-medium leading-relaxed">
                   Concordo com o tratamento dos meus dados pessoais conforme a <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-[#052144] font-bold underline hover:text-[#52C1DD]">Política de Privacidade e LGPD</button>.
                 </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#52C1DD] text-[#052144] py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                {loading ? 'Enviando...' : 'Solicitar Acesso'}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }} className="text-xs font-bold text-slate-400 hover:text-[#052144] transition-colors">
                  Voltar para Login
                </button>
              </div>
            </form>
          )}

          {view === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 text-center">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  O administrador aprovou seu cadastro e enviou um código de 6 dígitos para o seu e-mail.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Verificação</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required 
                  value={code} 
                  onChange={e => setCode(e.target.value.replace(/\D/g,''))} 
                  className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#52C1DD] font-mono text-3xl text-center tracking-[0.5em] text-[#052144]" 
                  placeholder="000000" 
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#052144] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#0a3560] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                {loading ? 'Validando...' : 'Validar Acesso'}
              </button>
              <button type="button" onClick={() => setView('login')} className="text-xs font-bold text-slate-400 hover:text-[#052144] transition-colors">
                  Cancelar
              </button>
            </form>
          )}
        </div>
        
        {/* Rodapé com Dica de Acesso */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2">
           <Info size={14} className="text-slate-400" />
           <p className="text-[10px] font-medium text-slate-500">
             Admin Demo: <span className="font-bold text-slate-700">admin@viacristais.com</span> / <span className="font-bold text-slate-700">admin123</span>
           </p>
        </div>
      </div>
      <div className="absolute bottom-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
        Sistema Seguro v2.4.0
      </div>

      {/* Modal de Privacidade */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#052144]/80 backdrop-blur-sm" onClick={() => setShowPrivacyModal(false)}></div>
           <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] relative z-10 flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#052144] text-white">
                 <div className="flex items-center gap-2">
                    <FileText size={20} className="text-[#52C1DD]" />
                    <h2 className="font-black uppercase tracking-widest text-sm">Política de Privacidade & LGPD</h2>
                 </div>
                 <button onClick={() => setShowPrivacyModal(false)}><X size={20} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar text-slate-600 text-sm leading-relaxed space-y-4">
                 <h3 className="font-bold text-[#052144] uppercase text-xs tracking-widest">1. Coleta de Dados</h3>
                 <p>Coletamos seu nome e e-mail corporativo estritamente para autenticação e auditoria de ações no sistema operacional de pedágio.</p>
                 
                 <h3 className="font-bold text-[#052144] uppercase text-xs tracking-widest">2. Finalidade</h3>
                 <p>Os dados são utilizados para garantir a rastreabilidade (accountability) das inserções de dados financeiros e operacionais, conforme exigido por normas de compliance corporativo.</p>
                 
                 <h3 className="font-bold text-[#052144] uppercase text-xs tracking-widest">3. Compartilhamento</h3>
                 <p>Seus dados não são compartilhados com terceiros externos. O acesso é restrito aos administradores do sistema Via Cristais.</p>

                 <h3 className="font-bold text-[#052144] uppercase text-xs tracking-widest">4. Seus Direitos</h3>
                 <p>Você tem direito a solicitar a exportação ou exclusão dos seus dados pessoais a qualquer momento, entrando em contato com o Encarregado de Dados (DPO) através do painel administrativo.</p>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                 <button onClick={() => { setAcceptedTerms(true); setShowPrivacyModal(false); }} className="px-6 py-3 bg-[#52C1DD] text-[#052144] font-black uppercase text-xs rounded-xl hover:brightness-105 shadow-md">
                    Li e Concordo
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
