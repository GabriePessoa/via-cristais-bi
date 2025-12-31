
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TollRecord } from '../types';
import { TrendingUp, CarFront, DollarSign, AlertTriangle, Calendar, MapPin, Layers, ChevronRight, Pin, PinOff, Trash2, Activity, PlusCircle, MinusCircle, Tag, CreditCard, Search, Clock } from 'lucide-react';
import { ALL_PLAZAS } from '../constants';
import { OperationalForm } from './DataEntry';

interface OperationalDashboardProps {
  data: TollRecord[];
  selectedMonth: string;
  selectedYear: string;
  onFilterChange: (month: string, year: string) => void;
  onAdd?: (record: TollRecord) => void;
}

type SegmentType = 'Consolidado' | 'Norte' | 'Sul';

const OperationalDashboard: React.FC<OperationalDashboardProps> = ({ data, selectedMonth, selectedYear, onFilterChange, onAdd }) => {
  const [selectedSegment, setSelectedSegment] = useState<SegmentType>('Consolidado');
  const [selectedPlazas, setSelectedPlazas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  
  const themeColor = '#52C1DD'; // Ciano Operacional
  const darkBlue = '#052144';

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSegment !== 'Consolidado') count++;
    if (selectedPlazas.length > 0) count++;
    if (searchTerm) count++;
    return count;
  }, [selectedSegment, selectedPlazas, searchTerm]);

  const handleClearFilters = () => {
    setSelectedSegment('Consolidado');
    setSelectedPlazas([]);
    setSearchTerm('');
    const now = new Date();
    onFilterChange(String(now.getMonth() + 1).padStart(2, '0'), String(now.getFullYear()));
  };

  const setPreset = (preset: 'today' | '7days' | 'month') => {
      const now = new Date();
      onFilterChange(String(now.getMonth() + 1).padStart(2, '0'), String(now.getFullYear()));
      // Lógica de preset simplificada para o mock
  };

  const togglePlaza = (plaza: string) => {
    setSelectedPlazas(prev => {
      if (prev.includes(plaza)) return prev.filter(p => p !== plaza);
      return [...prev, plaza];
    });
  };

  const years = useMemo(() => ['2025', '2024'], []);

  const availablePlazas = useMemo(() => {
    if (selectedSegment === 'Norte') return ['PP1', 'PP2', 'PP3', 'PP4'];
    if (selectedSegment === 'Sul') return ['PP5', 'PP6', 'PP7'];
    return ALL_PLAZAS;
  }, [selectedSegment]);

  const stats = useMemo(() => {
    let filtered = data;
    if (selectedYear !== 'all') filtered = filtered.filter(r => r.date.startsWith(selectedYear));
    if (selectedMonth !== 'all') filtered = filtered.filter(r => r.date.split('-')[1] === selectedMonth);
    
    if (selectedSegment === 'Norte') {
      filtered = filtered.filter(r => ['PP1', 'PP2', 'PP3', 'PP4'].includes(r.plazaName || r.plaza_name));
    } else if (selectedSegment === 'Sul') {
      filtered = filtered.filter(r => ['PP5', 'PP6', 'PP7'].includes(r.plazaName || r.plaza_name));
    }
    
    if (selectedPlazas.length > 0) {
      filtered = filtered.filter(r => selectedPlazas.includes(r.plazaName || r.plaza_name));
    }

    if (searchTerm) {
        filtered = filtered.filter(r => 
            (r.plazaName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.lane || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const totalVehicles = filtered.reduce((acc, r) => acc + (r.lightVehicles || 0) + (r.heavyVehicles || 0), 0);
    const totalRevenue = filtered.reduce((acc, r) => acc + (r.revenueCash || 0) + (r.revenueElectronic || 0), 0);
    const totalAbnormal = filtered.reduce((acc, r) => acc + (r.abnormalTransactions || 0), 0);

    const trafficMap: Record<string, number> = {};
    filtered.forEach(r => {
      trafficMap[r.date] = (trafficMap[r.date] || 0) + ((r.lightVehicles || 0) + (r.heavyVehicles || 0));
    });

    const dailyTrend = Object.keys(trafficMap).sort().map(date => ({
      day: date.split('-')[2],
      veiculos: trafficMap[date]
    }));

    const paymentMethods = [
      { name: 'TAG', value: filtered.reduce((acc, r) => acc + (r.txTag || 0), 0), color: '#00458B' },
      { name: 'Cartão', value: filtered.reduce((acc, r) => acc + (r.txCard || 0), 0), color: '#8DC63F' },
      { name: 'Dinheiro', value: filtered.reduce((acc, r) => acc + (r.txCash || 0), 0), color: themeColor },
      { name: 'Pix', value: filtered.reduce((acc, r) => acc + (r.txPix || 0), 0), color: '#80D8E9' },
    ];

    return { totalVehicles, totalRevenue, totalAbnormal, dailyTrend, paymentMethods };
  }, [data, selectedMonth, selectedYear, selectedSegment, selectedPlazas, searchTerm]);

  const isVisible = isPinned || isHovered;

  return (
    <div className="flex flex-col min-h-full relative bg-[#E6E6E6]">
      
      {/* SMART TOOLBAR */}
      <div 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
        className="sticky top-0 z-40 w-full"
      >
        <div className={`bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 shadow-md transition-all duration-300 ease-out flex items-center justify-between overflow-hidden ${isVisible ? 'h-16 opacity-100' : 'h-2 opacity-0 -translate-y-2'}`}>
          <div className="flex items-center gap-4 flex-1">
            {/* PRESETS */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
               {['Mês', 'Hoje', '7D'].map((p, idx) => (
                   <button key={p} onClick={() => setPreset(idx === 0 ? 'month' : idx === 1 ? 'today' : '7days')} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:bg-white hover:text-[#052144] transition-all">
                       {p}
                   </button>
               ))}
            </div>

            <div className="h-8 w-px bg-slate-200 shrink-0"></div>

            {/* SELETORES TEMPORAIS */}
            <div className="flex items-center gap-2 shrink-0">
              <Calendar size={16} color={darkBlue} />
              <select 
                value={selectedMonth} 
                onChange={e => onFilterChange(e.target.value, selectedYear)}
                className="bg-transparent text-xs font-black uppercase text-[#052144] outline-none"
              >
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                  <option key={m} value={m}>{new Date(2025, parseInt(m)-1).toLocaleString('pt-BR', {month: 'short'})}</option>
                ))}
              </select>
            </div>

            <div className="h-8 w-px bg-slate-200 shrink-0"></div>

            {/* SEGMENTOS */}
            <div className="flex gap-1 shrink-0">
                {['Consolidado', 'Norte', 'Sul'].map(s => (
                  <button key={s} onClick={() => setSelectedSegment(s as any)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${selectedSegment === s ? 'text-white' : 'text-slate-400'}`} style={{ backgroundColor: selectedSegment === s ? themeColor : 'transparent' }}>{s}</button>
                ))}
            </div>

            <div className="h-8 w-px bg-slate-200 shrink-0"></div>

            {/* BUSCA INTEGRADA */}
            <div className="relative flex-1 max-w-xs group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#52C1DD]" size={14} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Filtrar dashboard..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#52C1DD] transition-all"
                />
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-full transition-all ${isPinned ? 'text-white shadow-inner' : 'text-slate-300'}`}
              style={{ backgroundColor: isPinned ? themeColor : 'transparent' }}
            >
              {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
            </button>
            <button 
              onClick={handleClearFilters}
              className="relative p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
            >
              <Trash2 size={14} />
              {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full animate-in zoom-in">
                      {activeFiltersCount}
                  </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* LINHA 1: KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GradientKPICard title="VOLUME TRÁFEGO" value={(stats.totalVehicles / 1000).toFixed(1) + 'k'} icon={<CarFront />} desc="VEÍCULOS NO PERÍODO" themeColor={themeColor} />
          <GradientKPICard title="ARRECADAÇÃO BRUTA" value={`R$ ${(stats.totalRevenue / 1000).toFixed(0)}k`} icon={<DollarSign />} desc="RECEITA TOTAL PREVISTA" themeColor={themeColor} />
          <GradientKPICard title="TRANSAÇÕES ANORMAIS" value={stats.totalAbnormal.toString()} icon={<AlertTriangle />} desc="ALERTAS DE SISTEMA" themeColor={themeColor} />
          <GradientKPICard title="TAXA AUTOMÁTICO" value="62%" icon={<Tag />} desc="PENETRAÇÃO DE TAG" themeColor={themeColor} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#52C1DD]"><TrendingUp size={24}/></div>
                <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Evolução do Fluxo Diário</h3>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyTrend}>
                  <defs>
                    <linearGradient id="opGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52C1DD" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#52C1DD" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" fontSize={10} fontWeight="900" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="900" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="veiculos" stroke="#52C1DD" strokeWidth={4} fill="url(#opGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#52C1DD]"><CreditCard size={24}/></div>
                <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Mix de Arrecadação</h3>
            </div>
            <div className="flex-1 flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.paymentMethods} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {stats.paymentMethods.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3 px-4">
                {stats.paymentMethods.map(m => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: m.color}}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.name}</span>
                    </div>
                    <span className="text-sm font-black text-[#052144]">{m.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GradientKPICard = ({ title, value, icon, desc, themeColor }: any) => (
  <div className="bg-white p-6 rounded-[30px] border border-slate-300 shadow-sm relative group hover:shadow-lg transition-all flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</span>
        <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#052144] to-[#52C1DD] tracking-tighter leading-tight">
          {value}
        </p>
      </div>
      <div className="p-2 bg-slate-50 rounded-xl text-slate-300 opacity-60 group-hover:opacity-100 transition-opacity border border-slate-100">
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
    <div className="h-[1px] w-full bg-gradient-to-r from-[#052144] to-[#52C1DD] my-4 opacity-20"></div>
    <p className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase">
      <ChevronRight size={10} className="text-[#52C1DD]" /> {desc}
    </p>
  </div>
);

export default OperationalDashboard;
