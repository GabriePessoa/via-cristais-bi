
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, PlusCircle, History, Sparkles, ShieldCheck, Leaf, Users, Database, Activity, LockKeyhole, MonitorCheck, X, LogOut } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean; // Agora representa "Expanded"
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  // Ordem reorganizada conforme solicitado
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Painel Geral', icon: LayoutDashboard, color: '#52C1DD' },
    { id: 'operational' as ViewType, label: 'Operacional', icon: Activity, color: '#52C1DD' },
    { id: 'safety' as ViewType, label: 'SSO', icon: ShieldCheck, color: '#009669' },
    { id: 'rh' as ViewType, label: 'RH', icon: Users, color: '#762868' },
    { id: 'socioenvironmental' as ViewType, label: 'ESG', icon: Leaf, color: '#86BB25' },
    { id: 'entry' as ViewType, label: 'Inserir', icon: PlusCircle, color: '#94a3b8' },
    { id: 'history' as ViewType, label: 'Histórico', icon: History, color: '#94a3b8' },
    { id: 'database' as ViewType, label: 'Banco de Dados', icon: Database, color: '#94a3b8' },
    // Mantendo Insights como extra no final
    { id: 'insights' as ViewType, label: 'Insights AI', icon: Sparkles, color: '#94a3b8' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'access_control' as ViewType, label: 'Gestão de Acessos', icon: LockKeyhole, color: '#94a3b8' });
  }

  return (
    <>
      {/* Sidebar - Fixa e com largura variável */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[#052144] text-white flex flex-col transition-all duration-300 ease-in-out z-[70] shadow-2xl ${
          isOpen ? 'w-72' : 'w-20'
        }`}
      >
        {/* Top Logo Area */}
        <div className={`h-24 flex items-center shrink-0 border-b border-white/5 transition-all duration-300 ${isOpen ? 'px-6 justify-between' : 'justify-center px-0'}`}>
          <div className="flex items-center overflow-hidden">
             <div className="min-w-[32px] w-8 h-8 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                <MonitorCheck size={20} className="text-[#052144]" />
             </div>
             {/* Texto do Logo - Oculto quando fechado */}
             <div className={`ml-4 whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                <h1 className="font-black text-[14px] uppercase tracking-tighter leading-none">Via Cristais</h1>
                <p className="text-[9px] font-bold text-[#52C1DD] uppercase tracking-[0.2em] mt-1">Control Tower BI</p>
             </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto scrollbar-width-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const activeColor = item.color;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={!isOpen ? item.label : ''} // Tooltip nativo quando fechado
                className={`w-full flex items-center h-12 transition-all group relative ${
                  isOpen ? 'px-6 justify-start' : 'px-0 justify-center'
                } ${
                  isActive 
                    ? 'bg-white/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{ color: isActive ? activeColor : undefined }}
              >
                <div className={`min-w-[24px] flex items-center justify-center shrink-0 transition-all ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-white'}`}>
                  <Icon size={20} />
                </div>
                
                {/* Texto do Item - Oculto quando fechado */}
                <span className={`ml-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                  {item.label}
                </span>

                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full shadow-[0_0_10px_currentColor]"
                    style={{ backgroundColor: activeColor }}
                  ></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className={`shrink-0 border-t border-white/5 bg-[#041a36] transition-all duration-300 ${isOpen ? 'p-4' : 'p-2'}`}>
          <div className={`flex items-center ${isOpen ? 'gap-3' : 'flex-col gap-2'}`}>
             {/* Status Online */}
             <div className={`flex items-center border border-white/5 bg-white/5 rounded-xl transition-all ${isOpen ? 'flex-1 py-2.5 px-3' : 'w-10 h-10 justify-center p-0'}`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                {isOpen && <p className="ml-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">Sistema Online</p>}
             </div>

             {/* Botão de Encerrar Sessão */}
             <button 
               onClick={signOut}
               className={`flex items-center justify-center rounded-xl bg-rose-900/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all border border-rose-900/30 group ${isOpen ? 'w-10 h-10' : 'w-10 h-10'}`}
               title="Encerrar Sessão"
             >
                <LogOut size={18} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
