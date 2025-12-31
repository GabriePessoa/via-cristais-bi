
import React, { useState, useEffect } from 'react';
import { ViewType, TollRecord } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OperationalDashboard from './components/OperationalDashboard';
import DataEntry from './components/DataEntry';
import HistoryTable from './components/HistoryTable';
import InsightsView from './components/InsightsView';
import SafetyDashboard from './components/SafetyDashboard';
import SocioEnvironmentalDashboard from './components/SocioEnvironmentalDashboard';
import HRDashboard from './components/HRDashboard';
import DatabaseView from './components/DatabaseView';
import AccessManagement from './components/AccessManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import { 
  RefreshCw, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  Activity, 
  ShieldCheck, 
  Leaf, 
  Users, 
  History, 
  Sparkles, 
  Database, 
  LockKeyhole, 
  PlusCircle,
  MenuSquare
} from 'lucide-react';
import { INITIAL_DATA, INITIAL_EMPLOYEES } from './constants';

const AppContent: React.FC = () => {
  const { isAuthenticated, signOut, user } = useAuth();
  // Alterado: View padrão agora é 'dashboard' (Painel Geral)
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [records, setRecords] = useState<TollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Alterado: Controla se a sidebar está expandida ou recolhida
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState('2025');

  const forceAuthenticated = true; 

  const VCR_BLUE = '#004489';

  // Configuração das visões com cores específicas
  const viewConfig: Record<ViewType, { title: string; icon: any; color: string }> = {
    dashboard: { title: 'Painel Geral', icon: LayoutDashboard, color: VCR_BLUE },
    operational: { title: 'Indicadores Operacionais', icon: Activity, color: '#52C1DD' },
    safety: { title: 'Saúde e Segurança (SSO)', icon: ShieldCheck, color: '#009669' },
    socioenvironmental: { title: 'Socioambiental (ESG)', icon: Leaf, color: '#86BB25' },
    esg: { title: 'Socioambiental (ESG)', icon: Leaf, color: '#86BB25' },
    rh: { title: 'Recursos Humanos', icon: Users, color: '#762868' },
    history: { title: 'Histórico de Lançamentos', icon: History, color: VCR_BLUE },
    insights: { title: 'Insights Inteligência Artificial', icon: Sparkles, color: VCR_BLUE },
    database: { title: 'Banco de Dados', icon: Database, color: VCR_BLUE },
    access_control: { title: 'Gestão de Acessos', icon: LockKeyhole, color: VCR_BLUE },
    entry: { title: 'Lançar Dados', icon: PlusCircle, color: VCR_BLUE },
  };

  useEffect(() => {
    loadLocalData();
  }, []);

  const normalizeRecord = (r: any): TollRecord => {
    return {
      ...r,
      lightVehicles: Number(r.lightVehicles ?? r.light_vehicles ?? 0),
      heavyVehicles: Number(r.heavyVehicles ?? r.heavy_vehicles ?? 0),
      revenueCash: Number(r.revenueCash ?? r.revenue_cash ?? 0),
      revenueElectronic: Number(r.revenueElectronic ?? r.revenue_electronic ?? 0),
      plazaName: r.plazaName || r.plaza_name || 'Desconhecido',
      category: r.category || 'operational'
    };
  };

  const loadLocalData = () => {
    setLoading(true);
    setTimeout(() => {
      const storedData = localStorage.getItem('via_cristais_records');
      let loadedRecords: TollRecord[] = [];

      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          loadedRecords = parsed.map(normalizeRecord);
        } catch (e) {
          loadedRecords = INITIAL_DATA.map(normalizeRecord);
        }
      } else {
        loadedRecords = INITIAL_DATA.map(normalizeRecord);
        localStorage.setItem('via_cristais_records', JSON.stringify(loadedRecords));
      }
      
      loadedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(loadedRecords);
      setLoading(false);
    }, 600);
  };

  const handleAddRecord = async (newRecord: TollRecord) => {
    const normalizedNew = normalizeRecord(newRecord);
    const updatedRecords = [normalizedNew, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('via_cristais_records', JSON.stringify(updatedRecords));
    
    if (activeView === 'entry') {
        alert('Registro salvo com sucesso!');
        setActiveView(normalizedNew.category === 'operational' ? 'operational' : 'history');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 h-full bg-[#E6E6E6]">
          <RefreshCw size={48} className="animate-spin text-[#52C1DD]" />
          <p className="font-bold uppercase text-[10px] tracking-[0.3em] text-[#052144]">Carregando BI...</p>
        </div>
      );
    }

    const commonProps = {
      data: records,
      selectedMonth,
      selectedYear,
      onFilterChange: (month: string, year: string) => {
        setSelectedMonth(month);
        setSelectedYear(year);
      },
      onAdd: handleAddRecord
    };

    switch (activeView) {
      case 'dashboard': return <Dashboard data={records} setView={setActiveView} />;
      case 'operational': return <OperationalDashboard {...commonProps} />;
      case 'safety': return <SafetyDashboard {...commonProps} />;
      case 'socioenvironmental': return <SocioEnvironmentalDashboard {...commonProps} />;
      case 'rh': return <HRDashboard {...commonProps} />;
      case 'entry': return <DataEntry onAdd={handleAddRecord} />;
      case 'history': return <HistoryTable data={records} />;
      case 'insights': return <InsightsView data={records} />;
      case 'database': return <DatabaseView employees={INITIAL_EMPLOYEES} />;
      case 'access_control': return <AccessManagement />;
      default: return <OperationalDashboard {...commonProps} />;
    }
  };

  if (!isAuthenticated && !forceAuthenticated) return <LoginScreen />;

  const currentConfig = viewConfig[activeView] || { title: 'Via Cristais', icon: Activity, color: VCR_BLUE };
  const ActiveIcon = currentConfig.icon;
  const activeTitle = currentConfig.title;
  const headerColor = currentConfig.color;

  return (
    <div className="h-screen flex overflow-hidden bg-[#E6E6E6]">
      <Sidebar 
        currentView={activeView} 
        setView={(view) => { setActiveView(view); }} 
        isOpen={isSidebarExpanded}
        onClose={() => setIsSidebarExpanded(false)}
      />

      {/* Main Container ajusta a margem esquerda baseado no estado da sidebar */}
      <main 
        className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'ml-72' : 'ml-20'}`}
      >
        <header className="bg-white h-24 border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-3 text-[#052144] hover:bg-slate-50 rounded-xl transition-colors"
            >
              {isSidebarExpanded ? <MenuSquare size={32} /> : <Menu size={32} />}
            </button>
            <div className="flex items-center gap-4 transition-all duration-500">
               <ActiveIcon size={42} style={{ color: headerColor }} strokeWidth={2.5} />
               <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: headerColor }}>
                 {activeTitle}
               </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#052144] uppercase leading-none">{user?.name || 'ADMINISTRADOR MASTER'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1.5">SESSÃO BYPASS ATIVA</p>
             </div>
             <button onClick={signOut} className="p-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors border border-rose-100 shadow-sm">
                <LogOut size={22} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#E6E6E6]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => <AuthProvider><AppContent /></AuthProvider>;
export default App;
