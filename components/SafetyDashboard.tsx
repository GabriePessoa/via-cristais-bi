
import React, { useMemo, useState } from 'react';
import { TollRecord } from '../types';
import { ShieldCheck, UserCheck, Heart, ClipboardCheck, Calendar, MapPin, Layers, ChevronRight, Pin, PinOff, Trash2, PlusCircle, MinusCircle, AlertTriangle, Sun, Moon, Clock, Info, MessageSquare, PenTool, TrendingUp, Trophy, Medal, FilePlus, X, Save, History as HistoryIcon, RotateCcw } from 'lucide-react';
import { ALL_PLAZAS } from '../constants';
import { SafetyForm } from './DataEntry';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SafetyDashboardProps {
  data: TollRecord[];
  selectedMonth: string;
  selectedYear: string;
  onFilterChange: (month: string, year: string) => void;
  onAdd?: (record: TollRecord) => void;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ data, selectedMonth, selectedYear, onFilterChange, onAdd }) => {
  const [selectedSegment, setSelectedSegment] = useState<'Consolidado' | 'Norte' | 'Sul'>('Consolidado');
  const [selectedPlazas, setSelectedPlazas] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'night'>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Modal State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  
  const [hoveredDayInfo, setHoveredDayInfo] = useState<any | null>(null);
  
  // Chart Filter State
  const allTypes = ['ASAF', 'ACAF', 'SAM', 'ACDM', 'QAC', 'TRAJETO'];
  const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(allTypes);
  
  const brandGreen = '#009669';
  const vibrantGreen = '#22C55E';
  const darkBlue = '#052144';
  const customPink = '#FA527E'; // R250 G82 B126

  const handleClearFilters = () => {
    setSelectedSegment('Consolidado');
    setSelectedPlazas([]);
    const now = new Date();
    onFilterChange(String(now.getMonth() + 1).padStart(2, '0'), String(now.getFullYear()));
  };

  const togglePlaza = (plaza: string) => {
    if (plaza === 'all') {
      setSelectedPlazas([]);
      return;
    }
    setSelectedPlazas(prev => {
      if (prev.includes(plaza)) {
        return prev.filter(p => p !== plaza);
      } else {
        return [...prev, plaza];
      }
    });
  };

  const toggleChartType = (type: string) => {
      setSelectedChartTypes(prev => {
          if (prev.includes(type)) return prev.filter(t => t !== type);
          return [...prev, type];
      });
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const result = ['2025'];
    if (currentYear > 2025) {
      for (let y = 2026; y <= currentYear; y++) result.push(String(y));
    }
    return result.sort((a,b) => Number(a) - Number(b));
  }, []);

  const availablePlazas = useMemo(() => {
    if (selectedSegment === 'Norte') return ['PP1', 'PP2', 'PP3', 'PP4'];
    if (selectedSegment === 'Sul') return ['PP5', 'PP6', 'PP7'];
    return ALL_PLAZAS;
  }, [selectedSegment]);

  // --- DSS TOPICS GENERATOR (Fixed 5 items) ---
  const dssTopics = [
      { id: '01', title: 'Uso Correto de EPIs', desc: 'Conscientização' },
      { id: '02', title: 'Trabalho em Altura', desc: 'NR-35' },
      { id: '03', title: 'Sinalização de Pista', desc: 'Procedimentos' },
      { id: '04', title: 'Direção Defensiva', desc: 'Prevenção' },
      { id: '05', title: 'Riscos Elétricos', desc: 'NR-10' },
  ];

  // --- LOGIC: INCIDENT COLORS ---
  const getIncidentColor = (type?: string) => {
    switch (type) {
        case 'QAC': return '#000000'; // Preto
        case 'ACAF': return '#ef4444'; // Vermelho
        case 'TRAJETO': return '#9333ea'; // Roxo
        case 'SAM': return '#2563eb'; // Azul
        case 'ACDM': return '#38bdf8'; // Azul Claro
        case 'ASAF': return '#f97316'; // Laranja
        default: return vibrantGreen; // Verde Vivo (OK)
    }
  };

  // --- LOGIC: CURRENT STREAK (DAYS WITHOUT ACCIDENTS) ---
  const currentDaysWithoutAccidents = useMemo(() => {
    const relevantRecords = data.filter(r => 
        r.isSafetyRecord && r.incidents && r.incidents > 0 &&
        (selectedSegment === 'Consolidado' || 
         (selectedSegment === 'Norte' && ['PP1','PP2','PP3','PP4'].includes(r.plazaName || '')) ||
         (selectedSegment === 'Sul' && ['PP5','PP6','PP7'].includes(r.plazaName || ''))) &&
        (selectedPlazas.length === 0 || selectedPlazas.includes(r.plazaName || ''))
    );

    if (relevantRecords.length === 0) return 365; // Default if no accidents found in history

    // Sort descending (newest first)
    const sorted = relevantRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastIncidentDate = new Date(sorted[0].date).getTime();
    const today = new Date().getTime();
    const diff = Math.floor((today - lastIncidentDate) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diff);
  }, [data, selectedSegment, selectedPlazas]);

  // --- LOGIC: RECORD DAYS WITHOUT ACCIDENTS (Calculated from filtered data) ---
  const recordDaysWithoutAccidents = useMemo(() => {
    const relevantRecords = data.filter(r => 
        r.isSafetyRecord && r.incidents && r.incidents > 0 &&
        (selectedSegment === 'Consolidado' || 
         (selectedSegment === 'Norte' && ['PP1','PP2','PP3','PP4'].includes(r.plazaName || '')) ||
         (selectedSegment === 'Sul' && ['PP5','PP6','PP7'].includes(r.plazaName || ''))) &&
        (selectedPlazas.length === 0 || selectedPlazas.includes(r.plazaName || ''))
    );

    if (relevantRecords.length === 0) return 365;

    // Sort ascending for gap calculation
    const sortedAsc = [...relevantRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let maxStreak = 0;
    
    // Gaps between consecutive accidents
    for (let i = 0; i < sortedAsc.length - 1; i++) {
        const d1 = new Date(sortedAsc[i].date).getTime();
        const d2 = new Date(sortedAsc[i+1].date).getTime();
        const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diffDays > maxStreak) maxStreak = diffDays;
    }

    // Gap between last accident and today
    const lastIncidentDate = new Date(sortedAsc[sortedAsc.length - 1].date).getTime();
    const today = new Date().getTime();
    const currentStreak = Math.floor((today - lastIncidentDate) / (1000 * 60 * 60 * 24));
    
    // The record is the maximum of any historical gap or the current streak
    return Math.max(maxStreak, currentStreak);
  }, [data, selectedSegment, selectedPlazas]);

  // --- LOGIC: MONTHLY OCCURRENCES COUNT ---
  const monthlyOccurrencesCount = useMemo(() => {
    return data.filter(r => 
        r.isSafetyRecord && 
        r.date.startsWith(`${selectedYear}-${selectedMonth}`) &&
        (selectedSegment === 'Consolidado' || 
         (selectedSegment === 'Norte' && ['PP1','PP2','PP3','PP4'].includes(r.plazaName || '')) ||
         (selectedSegment === 'Sul' && ['PP5','PP6','PP7'].includes(r.plazaName || ''))) &&
        (selectedPlazas.length === 0 || selectedPlazas.includes(r.plazaName || ''))
    ).length;
  }, [data, selectedMonth, selectedYear, selectedSegment, selectedPlazas]);

  // --- LOGIC: TOP 3 SAFEST PLAZAS (Filtered) ---
  const topSafePlazas = useMemo(() => {
      // 1. Determine eligible plazas based on Segment/Plaza filters
      let candidates = ALL_PLAZAS;

      if (selectedSegment === 'Norte') {
          candidates = candidates.filter(p => ['PP1','PP2','PP3','PP4'].includes(p));
      } else if (selectedSegment === 'Sul') {
          candidates = candidates.filter(p => ['PP5','PP6','PP7'].includes(p));
      }

      if (selectedPlazas.length > 0) {
          candidates = candidates.filter(p => selectedPlazas.includes(p));
      }

      const result = candidates.map(plaza => {
          const plazaRecords = data.filter(r => r.plazaName === plaza && r.isSafetyRecord && r.incidents > 0);
          
          let days = 365; // Default if no accidents found in history
          if (plazaRecords.length > 0) {
             plazaRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             const lastDate = new Date(plazaRecords[0].date);
             const diff = Math.abs(new Date().getTime() - lastDate.getTime());
             days = Math.floor(diff / (1000 * 60 * 60 * 24));
          }
          return { name: plaza, days };
      });
      // Sort by days desc (more days = safer)
      return result.sort((a,b) => b.days - a.days).slice(0, 3);
  }, [data, selectedSegment, selectedPlazas]);

  // --- LOGIC: RECENT HISTORY (Filtered) ---
  const recentHistory = useMemo(() => {
      // Filter based on Dashboard Filters
      const filtered = data.filter(r => 
        r.isSafetyRecord && 
        r.date.startsWith(`${selectedYear}-${selectedMonth}`) &&
        (selectedSegment === 'Consolidado' || 
         (selectedSegment === 'Norte' && ['PP1','PP2','PP3','PP4'].includes(r.plazaName || '')) ||
         (selectedSegment === 'Sul' && ['PP5','PP6','PP7'].includes(r.plazaName || ''))) &&
        (selectedPlazas.length === 0 || selectedPlazas.includes(r.plazaName || ''))
      );

      // Sort descending by date + time
      return filtered
          .sort((a, b) => {
             const timeA = a.incidentTime || '00:00';
             const timeB = b.incidentTime || '00:00';
             return new Date(`${b.date}T${timeB}`).getTime() - new Date(`${a.date}T${timeA}`).getTime();
          })
          .slice(0, 5); // Take top 5
  }, [data, selectedMonth, selectedYear, selectedSegment, selectedPlazas]);

  // --- LOGIC: DAILY MULTI-LINE CHART ---
  const dailyStats = useMemo(() => {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth) - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const stats = [];

      const relevantRecords = data.filter(r => 
        r.isSafetyRecord && 
        r.date.startsWith(`${selectedYear}-${selectedMonth}`) &&
        (selectedSegment === 'Consolidado' || 
         (selectedSegment === 'Norte' && ['PP1','PP2','PP3','PP4'].includes(r.plazaName || '')) ||
         (selectedSegment === 'Sul' && ['PP5','PP6','PP7'].includes(r.plazaName || ''))) &&
        (selectedPlazas.length === 0 || selectedPlazas.includes(r.plazaName || ''))
      );

      for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${selectedYear}-${selectedMonth}-${String(i).padStart(2, '0')}`;
          const dayRecords = relevantRecords.filter(r => r.date === dateStr);
          
          const dayStat: any = { day: i };
          // Count each type
          allTypes.forEach(type => {
              dayStat[type] = dayRecords.filter(r => r.lane === type).length;
          });
          
          stats.push(dayStat);
      }
      return stats;
  }, [data, selectedMonth, selectedYear, selectedSegment, selectedPlazas]);

  // --- CALENDAR LOGIC PREP ---
  const getPriority = (type?: string) => {
      const p: Record<string, number> = { 'QAC': 6, 'ACAF': 5, 'TRAJETO': 4, 'SAM': 3, 'ACDM': 2, 'ASAF': 1 };
      return p[type || ''] || 0;
  };

  const startDayIndex = useMemo(() => {
      return new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).getDay();
  }, [selectedYear, selectedMonth]);

  const calendarDays = useMemo(() => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYearVal = today.getFullYear();
    const currentDay = today.getDate();

    const relevantRecords = data.filter(r => 
        r.isSafetyRecord && 
        r.date.startsWith(`${selectedYear}-${selectedMonth}`) &&
        (selectedSegment === 'Consolidado' || 
         (selectedSegment === 'Norte' && ['PP1','PP2','PP3','PP4'].includes(r.plazaName || '')) ||
         (selectedSegment === 'Sul' && ['PP5','PP6','PP7'].includes(r.plazaName || ''))) &&
        (selectedPlazas.length === 0 || selectedPlazas.includes(r.plazaName || ''))
    );

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${selectedYear}-${selectedMonth}-${String(i).padStart(2, '0')}`;
        const isFuture = (year > currentYearVal) || 
                         (year === currentYearVal && month > currentMonth) || 
                         (year === currentYearVal && month === currentMonth && i > currentDay);
        
        const isToday = year === currentYearVal && month === currentMonth && i === currentDay;

        const dayRecords = relevantRecords.filter(r => r.date === dateStr);

        const dayShiftRecords = dayRecords.filter(r => {
            if (!r.incidentTime) return true; 
            const hour = parseInt(r.incidentTime.split(':')[0]);
            return hour >= 6 && hour <= 18;
        });

        const nightShiftRecords = dayRecords.filter(r => {
            if (!r.incidentTime) return false;
            const hour = parseInt(r.incidentTime.split(':')[0]);
            return hour < 6 || hour > 18;
        });

        let dayType = 'OK';
        let maxDayPrio = -1;
        if (dayShiftRecords.length > 0) {
            dayShiftRecords.forEach(r => {
                const p = getPriority(r.lane);
                if (p > maxDayPrio) { maxDayPrio = p; dayType = r.lane || 'OK'; }
            });
        }

        let nightType = 'OK';
        let maxNightPrio = -1;
        if (nightShiftRecords.length > 0) {
            nightShiftRecords.forEach(r => {
                const p = getPriority(r.lane);
                if (p > maxNightPrio) { maxNightPrio = p; nightType = r.lane || 'OK'; }
            });
        }

        daysArray.push({ 
            day: i, 
            date: dateStr, 
            isFuture, 
            isToday,
            dayType,
            nightType,
            dayColor: getIncidentColor(dayType),
            nightColor: getIncidentColor(nightType),
            records: dayRecords
        });
    }
    return daysArray;
  }, [data, selectedMonth, selectedYear, selectedSegment, selectedPlazas]);

  const isVisible = isPinned || isHovered;

  return (
    <div className="flex flex-col min-h-full relative bg-[#E6E6E6]">
      
      {/* TOOLBAR */}
      <div 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
        className="sticky top-0 z-40 w-full"
      >
        <div className={`bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 shadow-sm transition-all duration-300 ease-out flex items-center justify-between overflow-hidden ${isVisible ? 'h-14 opacity-100 translate-y-0' : 'h-2 opacity-0 -translate-y-2'}`}>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar flex-1">
            {/* TEMPO */}
            <div className="flex items-center gap-3 shrink-0">
              <Calendar size={18} color={darkBlue} strokeWidth={2.5} />
              <div className="flex items-center gap-1">
                 {years.map(y => (
                   <button 
                    key={y} 
                    onClick={() => onFilterChange(selectedMonth, y)}
                    className={`px-2 py-1 rounded-md text-xs font-black transition-all ${selectedYear === y ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    style={{ backgroundColor: selectedYear === y ? brandGreen : 'transparent' }}
                   >
                     {y}
                   </button>
                 ))}
              </div>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <select 
                value={selectedMonth} 
                onChange={e => onFilterChange(e.target.value, selectedYear)}
                className="bg-transparent text-[13px] font-black uppercase text-[#052144] outline-none cursor-pointer hover:text-[#52C1DD] transition-colors"
              >
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                  <option key={m} value={m}>{new Date(2025, parseInt(m)-1).toLocaleString('pt-BR', {month: 'long'})}</option>
                ))}
              </select>
            </div>
            <div className="h-6 w-px bg-slate-100 shrink-0"></div>
            {/* GEOGRAFIA */}
            <div className="flex items-center gap-3 shrink-0">
              <Layers size={18} color={darkBlue} strokeWidth={2.5} />
              <div className="flex gap-1">
                {['Consolidado', 'Norte', 'Sul'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSegment(s as any); setSelectedPlazas([]); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${selectedSegment === s ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    style={{ backgroundColor: selectedSegment === s ? brandGreen : 'transparent' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-100 shrink-0"></div>
            {/* PRAÇAS */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px] overflow-hidden">
               <MapPin size={18} color={darkBlue} strokeWidth={2.5} className="shrink-0" />
               <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-linear-fade">
                 {selectedPlazas.length > 0 && (
                    <button
                      onClick={() => setSelectedPlazas([])}
                      className="px-2 py-1 rounded-md text-[11px] font-black uppercase text-slate-400 hover:text-rose-500 whitespace-nowrap mr-1"
                    >
                      Limpar
                    </button>
                 )}
                 {availablePlazas.map(p => {
                   const isActive = selectedPlazas.includes(p);
                   return (
                     <button
                        key={p}
                        onClick={() => togglePlaza(p)}
                        className={`w-8 h-7 rounded-lg text-[11px] font-black flex items-center justify-center transition-all ${isActive ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        style={{ backgroundColor: isActive ? brandGreen : 'transparent' }}
                     >
                       {p}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100 shrink-0">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-full transition-all ${isPinned ? 'text-white' : 'text-slate-300 hover:text-slate-500'}`}
              style={{ backgroundColor: isPinned ? brandGreen : 'transparent' }}
              title={isPinned ? "Desafixar" : "Fixar"}
            >
              {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
            </button>
            <button 
              onClick={handleClearFilters}
              className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {!isVisible && <div className="h-4 w-full bg-transparent absolute top-0 left-0 cursor-pointer" />}
      </div>

      <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full relative">
         
         {/* ROW 1: TOP STATS */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SafetyStatCard 
                title="DIAS SEM ACIDENTES" 
                value={currentDaysWithoutAccidents.toString()} 
                icon={<ShieldCheck />} 
                color="text-emerald-600" 
                accentColor={brandGreen} 
                variant="box"
                secondaryInfo={
                    <div className="flex items-center gap-2">
                         <Trophy size={14} className="text-amber-500" />
                         <span className="text-xs font-bold text-slate-500 uppercase">Recorde: <span className="text-slate-700">{recordDaysWithoutAccidents} Dias</span></span>
                    </div>
                }
            />
            <SafetyStatCard 
                title="Treinamentos (h)" 
                value="7.8k" 
                icon={<UserCheck />} 
                color="text-[#052144]" 
                accentColor={brandGreen} 
                variant="gradient"
                desc="Realizados no período" 
            />
            <SafetyStatCard 
                title="Exames Saúde" 
                value="3.1k" 
                icon={<Heart />} 
                color="text-[#052144]" 
                accentColor={brandGreen} 
                variant="gradient"
                desc="ASO / Periódicos" 
            />
            <SafetyStatCard 
                title="Inspeções Pista" 
                value="735" 
                icon={<ClipboardCheck />} 
                color="text-[#052144]" 
                accentColor={brandGreen} 
                variant="gradient"
                desc="Auditadas em campo" 
            />
         </div>

         {/* ROW 2: MAIN GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
             
             {/* LEFT: CALENDAR */}
             <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm relative flex flex-col h-full">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Ocorrências de Segurança</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-400 font-bold mt-1">Monitoramento Diário</p>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-600 mt-1 border border-slate-200">
                                    {monthlyOccurrencesCount} {monthlyOccurrencesCount === 1 ? 'Registro' : 'Registros'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-[#E6E6E6] p-1 rounded-xl h-12">
                        <button onClick={() => setTimeFilter('all')} className={`h-full px-3 rounded-lg flex items-center justify-center transition-all ${timeFilter === 'all' ? 'bg-white text-[#052144] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Todos"><Clock size={16} /></button>
                        <button onClick={() => setTimeFilter('day')} className={`h-full px-3 rounded-lg flex items-center justify-center transition-all ${timeFilter === 'day' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Diurno"><Sun size={16} /></button>
                        <button onClick={() => setTimeFilter('night')} className={`h-full px-3 rounded-lg flex items-center justify-center transition-all ${timeFilter === 'night' ? 'bg-white text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Noturno"><Moon size={16} /></button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-7 gap-y-3 gap-x-2 flex-1 content-center justify-items-center">
                     {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                         <div key={i} className={`text-center text-sm font-black uppercase ${i === 0 ? 'text-rose-500' : 'text-[#009669]'}`}>{d}</div>
                     ))}
                     
                     {Array.from({ length: startDayIndex }).map((_, i) => (
                         <div key={`blank-${i}`} />
                     ))}

                     {calendarDays.map((dayObj) => {
                         let backgroundStyle = {};
                         if (!dayObj.isFuture) {
                             if (timeFilter === 'day') {
                                 backgroundStyle = { background: dayObj.dayColor };
                             } else if (timeFilter === 'night') {
                                 backgroundStyle = { background: dayObj.nightColor };
                             } else {
                                 backgroundStyle = { background: `linear-gradient(135deg, ${dayObj.dayColor} 50%, ${dayObj.nightColor} 50%)` };
                             }
                         }

                         return (
                             <div 
                                key={dayObj.day} 
                                className="flex flex-col items-center justify-center relative group"
                                onMouseEnter={() => !dayObj.isFuture && setHoveredDayInfo(dayObj)}
                                onMouseLeave={() => setHoveredDayInfo(null)}
                             >
                                 {/* BLINKING RING SEPARATE FROM NUMBER */}
                                 {dayObj.isToday && (
                                     <div className="absolute inset-[-5px] rounded-full border-4 border-[#FA527E] animate-pulse pointer-events-none z-0"></div>
                                 )}

                                 <div 
                                    className={`w-[52px] h-[52px] max-w-[52px] max-h-[52px] rounded-full flex items-center justify-center shadow-md transition-all duration-300 text-base font-black relative z-10
                                        ${dayObj.isFuture ? 'bg-slate-100 text-slate-300' : 'text-white hover:scale-110 hover:shadow-xl cursor-pointer'}
                                    `}
                                    style={!dayObj.isFuture ? backgroundStyle : {}}
                                 >
                                    {dayObj.day}
                                 </div>
                                 {hoveredDayInfo?.day === dayObj.day && dayObj.records.length > 0 && (
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in zoom-in-95 duration-200 pointer-events-none">
                                         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                                             <div className="bg-[#009669] text-white text-xs font-bold px-2 py-0.5 rounded">{dayObj.date.split('-').reverse().join('/')}</div>
                                             <span className="text-xs font-black text-slate-400 uppercase">{dayObj.records.length} Ocorrência(s)</span>
                                         </div>
                                         <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                             {dayObj.records.map((r: any, idx: number) => {
                                                 const isDay = parseInt(r.incidentTime?.split(':')[0] || '12') >= 6 && parseInt(r.incidentTime?.split(':')[0] || '12') <= 18;
                                                 return (
                                                     <div key={idx} className="flex items-start gap-2 text-left">
                                                         {isDay ? <Sun size={12} className="text-orange-500 mt-0.5 shrink-0" /> : <Moon size={12} className="text-indigo-500 mt-0.5 shrink-0" />}
                                                         <div>
                                                             <p className="text-xs font-black text-slate-700 uppercase leading-none">{r.lane} <span className="text-slate-400 font-medium ml-1">({r.incidentTime || '??:??'})</span></p>
                                                             <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{r.observations || 'Sem detalhes.'}</p>
                                                         </div>
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                         <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                 </div>

                 {/* FOOTER: Legend + Entry Button */}
                 <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2 justify-start max-w-[70%]">
                        <LegendItem color={vibrantGreen} label="OK" />
                        <LegendItem color="#f97316" label="ASAF" />
                        <LegendItem color="#ef4444" label="ACAF" />
                        <LegendItem color="#2563eb" label="SAM" />
                        <LegendItem color="#38bdf8" label="ACDM" />
                        <LegendItem color="#000000" label="QAC" />
                        <LegendItem color="#9333ea" label="TRJ" />
                    </div>
                    
                    <button 
                        onClick={() => setIsEntryModalOpen(true)}
                        style={{ backgroundColor: customPink }}
                        className="text-white px-6 py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                        title="Registrar Nova Ocorrência"
                    >
                        <FilePlus size={18} />
                        Nova Ocorrência
                    </button>
                 </div>
             </div>

             {/* RIGHT: CHART (Top) + HISTORY (Bottom) */}
             <div className="flex flex-col gap-6 h-full">
                 
                 {/* 1. EVOLUTION CHART (Top Half) */}
                 <div className="flex-1 bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col min-h-0">
                     <div className="flex justify-between items-center mb-2">
                         <div className="flex items-center gap-3">
                             <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                 <TrendingUp size={28} />
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Evolução por Tipo</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5">Tendência de Ocorrências (Mensal)</p>
                             </div>
                         </div>
                         
                         <button 
                             onClick={() => setSelectedChartTypes([])}
                             className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                             title="Limpar Filtros"
                         >
                             <RotateCcw size={16} />
                         </button>
                     </div>
                     
                     {/* CHART BODY */}
                     <div className="flex-1 w-full min-h-0 mb-2">
                         <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={dailyStats} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis 
                                    dataKey="day" 
                                    fontSize={10} 
                                    fontWeight="900" 
                                    stroke="#94a3b8" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    padding={{ left: 30, right: 30 }}
                                    tickMargin={10}
                                    interval="preserveStartEnd"
                                 />
                                 <YAxis 
                                    fontSize={10} 
                                    fontWeight="900" 
                                    stroke="#94a3b8" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    allowDecimals={false} 
                                    width={25}
                                 />
                                 <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                 />
                                 {/* LEGEND REMOVED */}
                                 
                                 {allTypes.map(type => (
                                     selectedChartTypes.includes(type) && (
                                         <Line 
                                            key={type}
                                            type="monotone" 
                                            dataKey={type} 
                                            stroke={getIncidentColor(type)} 
                                            strokeWidth={3} 
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                         />
                                     )
                                 ))}
                             </LineChart>
                         </ResponsiveContainer>
                     </div>

                     {/* CHART FILTERS (IN PLACE OF LEGEND) */}
                     <div className="flex flex-wrap gap-1.5 justify-start pt-2 border-t border-slate-50 pl-2">
                         {allTypes.map(type => (
                             <button
                                 key={type}
                                 onClick={() => toggleChartType(type)}
                                 className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border transition-all ${
                                     selectedChartTypes.includes(type) 
                                         ? 'border-transparent text-white shadow-sm' 
                                         : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                                 }`}
                                 style={{ backgroundColor: selectedChartTypes.includes(type) ? getIncidentColor(type) : undefined }}
                             >
                                 {type}
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* 2. RECENT HISTORY (Bottom Half) */}
                 <div className="flex-1 bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col min-h-0 relative overflow-hidden">
                     <div className="flex items-center gap-3 mb-4 shrink-0">
                         <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                             <HistoryIcon size={28} />
                         </div>
                         <div>
                             <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Histórico Recente</h3>
                             <p className="text-xs text-slate-400 font-bold mt-0.5">Últimas 5 Ocorrências (Filtrado)</p>
                         </div>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                         {recentHistory.map((r, idx) => {
                             const isDay = parseInt(r.incidentTime?.split(':')[0] || '12') >= 6 && parseInt(r.incidentTime?.split(':')[0] || '12') <= 18;
                             return (
                                 <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDay ? 'bg-orange-100 text-orange-500' : 'bg-indigo-100 text-indigo-500'}`}>
                                         {isDay ? <Sun size={14} /> : <Moon size={14} />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="flex justify-between items-center mb-1">
                                             <div className="flex items-center gap-2">
                                                 <span className="text-xs font-black text-[#052144] uppercase">{r.plazaName}</span>
                                                 <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide text-white`} style={{ backgroundColor: getIncidentColor(r.lane) }}>{r.lane}</span>
                                             </div>
                                             <span className="text-[11px] font-bold text-slate-400">{r.date.split('-').reverse().join('/')} • {r.incidentTime}</span>
                                         </div>
                                         <p className="text-[11px] text-slate-500 leading-tight line-clamp-2 group-hover:text-slate-700">{r.observations}</p>
                                     </div>
                                 </div>
                             )
                         })}
                         {recentHistory.length === 0 && (
                             <div className="flex items-center justify-center h-full text-xs text-slate-400 italic">Sem registros neste período.</div>
                         )}
                     </div>
                     <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl"></div>
                 </div>
             </div>
         </div>

         {/* ROW 3: DSS TOPICS & TOP 3 PLAZAS (Organized) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* DSS TOPICS (2/3) */}
             <div className="lg:col-span-2 bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                        <MessageSquare size={28} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-black text-[#052144] uppercase tracking-widest">Diálogo Diário (DSS)</h3>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">Temas obrigatórios da semana</p>
                    </div>
                    <button className="h-9 px-4 bg-[#009669] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <PenTool size={14} /> Assinar Digitalmente
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {dssTopics.map((item) => (
                        <div key={item.id} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-center cursor-pointer h-full">
                            <div className="w-8 h-8 rounded-full bg-white text-emerald-600 border border-slate-200 flex items-center justify-center text-[10px] font-black mb-2 shadow-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors">
                                {item.id}
                            </div>
                            <span className="text-[10px] font-bold text-[#052144] uppercase leading-tight">{item.title}</span>
                            <span className="text-[9px] text-slate-400 mt-1">{item.desc}</span>
                        </div>
                    ))}
                </div>
             </div>

             {/* TOP 3 PLAZAS SEGURAS (1/3) - GOLDEN THEME */}
             <div className="bg-gradient-to-br from-amber-50/50 to-white p-6 rounded-[30px] border border-amber-100 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 shadow-sm border border-white/50">
                        <Trophy size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest">Praças Mais Seguras</h3>
                        <p className="text-xs text-amber-700/70 font-bold mt-0.5">Ranking de dias sem acidentes</p>
                    </div>
                </div>
                
                <div className="flex-1 space-y-3 relative z-10">
                    {topSafePlazas.map((plaza, idx) => (
                        <div key={plaza.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-white/50 shadow-sm backdrop-blur-sm">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${idx === 0 ? 'bg-amber-400 text-amber-900' : idx === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-300 text-orange-900'}`}>
                                {idx + 1}º
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-black text-amber-900 uppercase">{plaza.name}</p>
                                <div className="w-full bg-amber-200/50 h-1.5 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((plaza.days / 365) * 100, 100)}%` }}></div>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-sm font-black text-amber-700">{plaza.days}</span>
                                <p className="text-[9px] font-bold text-amber-600/60 uppercase">Dias</p>
                             </div>
                        </div>
                    ))}
                    {topSafePlazas.length === 0 && (
                        <div className="text-center text-xs text-amber-700/50 font-bold py-4">Nenhuma praça no filtro selecionado.</div>
                    )}
                </div>

                <div className="absolute -right-12 -bottom-8 opacity-10 pointer-events-none text-amber-600">
                    <Trophy size={240} />
                </div>
             </div>
         </div>

      </div>

      {/* ENTRY MODAL */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#052144]/60 backdrop-blur-sm" onClick={() => setIsEntryModalOpen(false)}></div>
           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] relative z-10 flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 border-4 border-slate-100">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <FilePlus size={20} />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-widest text-base text-[#052144]">Novo Lançamento</h2>
                        <p className="text-xs text-slate-400 font-bold">Ocorrência de Segurança</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEntryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar bg-white">
                 {onAdd && (
                     <SafetyForm 
                        onAdd={(record) => {
                            if (onAdd) onAdd(record);
                            setIsEntryModalOpen(false);
                        }} 
                        color={brandGreen} 
                     />
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-wide shadow-sm" style={{ backgroundColor: color }}>
        {label}
    </div>
);

const SafetyStatCard = ({ title, value, icon, color, accentColor, desc, variant = 'normal', secondaryInfo }: any) => (
  <div className="bg-white p-6 rounded-[30px] border border-slate-300 shadow-sm hover:translate-y-[-4px] transition-all group overflow-hidden relative text-left flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="flex flex-col">
        <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{title}</span>
        
        {variant === 'box' ? (
            <div className="bg-[#005f43] px-3 py-1 rounded-md w-fit mt-1">
                <p className="text-4xl font-black text-white">{value}</p>
            </div>
        ) : variant === 'gradient' ? (
            <p className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#052144] to-[#009669] tracking-tighter">
                {value}
            </p>
        ) : (
            <p className={`text-4xl font-black ${color}`}>{value}</p>
        )}
      </div>
      <div className="p-4 rounded-xl text-white shadow-lg transform group-hover:rotate-6 transition-transform" style={{backgroundColor: accentColor}}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
    
    <div className="h-[1px] w-full bg-gradient-to-r from-[#052144] to-[#009669] my-4 opacity-50"></div>

    <div className="relative z-10">
      {secondaryInfo ? (
          secondaryInfo
      ) : (
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
            <ChevronRight size={12} className="text-[#009669]" /> {desc}
          </p>
      )}
    </div>
  </div>
);

export default SafetyDashboard;
