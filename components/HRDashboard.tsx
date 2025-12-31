
import React, { useMemo, useState } from 'react';
import { TollRecord } from '../types';
import { Users, UserMinus, UserPlus, Briefcase, Calendar, MapPin, Layers, ChevronRight, Pin, PinOff, Trash2, PieChart as PieChartIcon, PlusCircle, MinusCircle, UserCheck, Search } from 'lucide-react';
import { ALL_PLAZAS, INITIAL_EMPLOYEES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface HRDashboardProps {
  data: TollRecord[];
  selectedMonth: string;
  selectedYear: string;
  onFilterChange: (month: string, year: string) => void;
  onAdd?: (record: TollRecord) => void;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ data, selectedMonth, selectedYear, onFilterChange, onAdd }) => {
  const [selectedSegment, setSelectedSegment] = useState<'Consolidado' | 'Norte' | 'Sul'>('Consolidado');
  const [selectedPlazas, setSelectedPlazas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const brandColor = '#762868'; // Roxo RH
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

  const stats = useMemo(() => {
    let filtered = data.filter(r => r.isHrRecord);
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
            (r.observations || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.plazaName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const faltas = filtered.filter(r => r.hrType === 'falta').length;
    const atestados = filtered.filter(r => r.hrType === 'atestado').length;
    const ferias = filtered.filter(r => r.hrType === 'ferias').length;
    return { faltas, atestados, ferias };
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
            <div className="flex items-center gap-2 shrink-0">
              <Calendar size={16} color={darkBlue} />
              <select value={selectedMonth} onChange={e => onFilterChange(e.target.value, selectedYear)} className="bg-transparent text-xs font-black uppercase text-[#052144] outline-none">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                  <option key={m} value={m}>{new Date(2025, parseInt(m)-1).toLocaleString('pt-BR', {month: 'short'})}</option>
                ))}
              </select>
            </div>

            <div className="h-8 w-px bg-slate-200 shrink-0"></div>

            <div className="flex gap-1 shrink-0">
                {['Consolidado', 'Norte', 'Sul'].map(s => (
                  <button key={s} onClick={() => setSelectedSegment(s as any)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${selectedSegment === s ? 'text-white' : 'text-slate-400'}`} style={{ backgroundColor: selectedSegment === s ? brandColor : 'transparent' }}>{s}</button>
                ))}
            </div>

            <div className="h-8 w-px bg-slate-200 shrink-0"></div>

            <div className="relative flex-1 max-w-xs group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#762868]" size={14} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar em RH..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#762868] transition-all"
                />
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-full transition-all ${isPinned ? 'text-white shadow-inner' : 'text-slate-300'}`}
              style={{ backgroundColor: isPinned ? brandColor : 'transparent' }}
            >
              {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
            </button>
            <button 
              onClick={handleClearFilters}
              className="relative p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
            >
              <Trash2 size={14} />
              {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full">
                      {activeFiltersCount}
                  </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GradientKPICard title="FALTAS TOTAIS" value={stats.faltas.toString()} icon={<UserMinus />} desc="ABSENTEÍSMO NO MÊS" themeColor={brandColor} />
            <GradientKPICard title="ATESTADOS MÉDICOS" value={stats.atestados.toString()} icon={<Briefcase />} desc="LICENÇAS ATIVAS" themeColor={brandColor} />
            <GradientKPICard title="COLAB. EM FÉRIAS" value={stats.ferias.toString()} icon={<UserCheck />} desc="EFETIVO EM DESCANSO" themeColor={brandColor} />
            <GradientKPICard title="TAXA DE RETENÇÃO" value="98.2%" icon={<UserPlus />} desc="KPI TURNOVER" themeColor={brandColor} />
         </div>

         <div className="bg-white p-8 rounded-[30px] border border-slate-200 shadow-sm flex items-center justify-center text-slate-300">
            <div className="text-center">
                <Users size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest">Painel de Efetivo em Breve</p>
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
        <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#052144] to-[#762868] tracking-tighter leading-tight">
          {value}
        </p>
      </div>
      <div className="p-2 bg-slate-50 rounded-xl text-slate-300 opacity-60 group-hover:opacity-100 transition-opacity border border-slate-100">
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
    <div className="h-[1px] w-full bg-gradient-to-r from-[#052144] to-[#762868] my-4 opacity-20"></div>
    <p className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase">
      <ChevronRight size={10} className="text-[#762868]" /> {desc}
    </p>
  </div>
);

export default HRDashboard;
