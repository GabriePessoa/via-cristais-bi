
import React, { useState, useMemo } from 'react';
import { TollRecord } from '../types';
import { Leaf, Droplets, Zap, Recycle, Calendar, MapPin, Layers, ChevronRight, Pin, PinOff, Trash2, BarChart2, PlusCircle, MinusCircle, Sprout, Search } from 'lucide-react';
import { ALL_PLAZAS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SocioEnvironmentalDashboardProps {
  data: TollRecord[];
  selectedMonth: string;
  selectedYear: string;
  onFilterChange: (month: string, year: string) => void;
  onAdd?: (record: TollRecord) => void;
}

const SocioEnvironmentalDashboard: React.FC<SocioEnvironmentalDashboardProps> = ({ data, selectedMonth, selectedYear, onFilterChange, onAdd }) => {
  const [selectedSegment, setSelectedSegment] = useState<'Consolidado' | 'Norte' | 'Sul'>('Consolidado');
  const [selectedPlazas, setSelectedPlazas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const brandColor = '#86BB25'; // Verde ESG
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
    let filtered = data.filter(r => r.isEnvironmentalRecord);
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
            (r.plazaName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const chartDataMap: Record<string, { water: number, energy: number, waste: number }> = {};
    filtered.forEach(r => {
        const day = r.date.split('-')[2];
        if (!chartDataMap[day]) chartDataMap[day] = { water: 0, energy: 0, waste: 0 };
        chartDataMap[day].water += (r.waterReading || 0);
        chartDataMap[day].energy += (r.energyReading || 0);
        chartDataMap[day].waste += (r.wasteReading || 0);
    });

    return Object.keys(chartDataMap).sort().map(day => ({
        day,
        water: chartDataMap[day].water,
        energy: chartDataMap[day].energy,
        waste: chartDataMap[day].waste
    }));
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#86BB25]" size={14} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Filtrar dados ESG..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#86BB25] transition-all"
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
            <GradientKPICard title="CONSUMO ÁGUA" value={(data.filter(r => r.isEnvironmentalRecord).reduce((acc, r) => acc + (r.waterReading || 0), 0)).toLocaleString() + ' m³'} icon={<Droplets />} desc="VOLUME TOTAL MEDIDO" themeColor={brandColor} />
            <GradientKPICard title="EFICIÊNCIA ENERGIA" value={(data.filter(r => r.isEnvironmentalRecord).reduce((acc, r) => acc + (r.energyReading || 0), 0)).toLocaleString() + ' kWh'} icon={<Zap />} desc="CONSUMO NO PERÍODO" themeColor={brandColor} />
            <GradientKPICard title="RESÍDUOS RECICLADOS" value={(data.filter(r => r.isEnvironmentalRecord).reduce((acc, r) => acc + (r.wasteReading || 0), 0)).toLocaleString() + ' kg'} icon={<Recycle />} desc="COLETA SELETIVA" themeColor={brandColor} />
            <GradientKPICard title="ECOEFICIÊNCIA" value="94%" icon={<Sprout />} desc="META SUSTENTÁVEL" themeColor={brandColor} />
         </div>

         <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-lime-50 rounded-xl flex items-center justify-center text-[#86BB25]"><BarChart2 size={24}/></div>
                <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Evolução de Consumo Ambiental</h3>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" fontSize={10} fontWeight="900" stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} fontWeight="900" stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="water" name="Água" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="energy" name="Energia" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
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
        <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#052144] to-[#86BB25] tracking-tighter leading-tight">
          {value}
        </p>
      </div>
      <div className="p-2 bg-slate-50 rounded-xl text-slate-300 opacity-60 group-hover:opacity-100 transition-opacity border border-slate-100">
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
    <div className="h-[1px] w-full bg-gradient-to-r from-[#052144] to-[#86BB25] my-4 opacity-20"></div>
    <p className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase">
      <ChevronRight size={10} className="text-[#86BB25]" /> {desc}
    </p>
  </div>
);

export default SocioEnvironmentalDashboard;
