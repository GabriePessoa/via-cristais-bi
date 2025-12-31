import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TollRecord, ViewType } from '../types';
import { TrendingUp, CarFront, DollarSign, AlertTriangle, ShieldCheck, Leaf, Users, ArrowUpRight, Calendar, ArrowRight } from 'lucide-react';

interface DashboardProps {
  data: TollRecord[];
  setView?: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, setView }) => {
  const stats = useMemo(() => {
    // Totais Operacionais
    const totalRevenue = data.reduce((acc, r) => acc + (r.revenueCash || 0) + (r.revenueElectronic || 0), 0);
    const totalVehicles = data.reduce((acc, r) => acc + (r.lightVehicles || 0) + (r.heavyVehicles || 0), 0);
    
    // Totais SSO
    const safetyIncidents = data.filter(r => r.isSafetyRecord && r.incidents > 0).length;
    
    // Dias sem acidentes (Simulado)
    const lastIncident = data
        .filter(r => r.isSafetyRecord && r.incidents > 0)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    let daysWithout = 0;
    if (lastIncident) {
        const diff = new Date().getTime() - new Date(lastIncident.date).getTime();
        daysWithout = Math.floor(diff / (1000 * 60 * 60 * 24));
    } else {
        daysWithout = 365; 
    }

    // Totais ESG
    const totalWater = data.filter(r => r.isEnvironmentalRecord).reduce((acc, r) => acc + (r.waterReading || 0), 0);
    
    // Totais RH
    const hrAbsences = data.filter(r => r.isHrRecord && r.hrType === 'falta').length;

    // Gráfico de Tendência (Últimos 14 dias)
    const trafficMap: Record<string, number> = {};
    data.forEach(curr => {
       if (!curr.isSafetyRecord && !curr.isEnvironmentalRecord && !curr.isHrRecord) {
           trafficMap[curr.date] = (trafficMap[curr.date] || 0) + (curr.lightVehicles || 0) + (curr.heavyVehicles || 0);
       }
    });
    const trendData = Object.keys(trafficMap)
        .sort()
        .slice(-14)
        .map(date => ({
            date: date.split('-').slice(1).join('/'),
            value: trafficMap[date]
        }));

    return { totalRevenue, totalVehicles, safetyIncidents, daysWithout, totalWater, hrAbsences, trendData };
  }, [data]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 px-8">
      
      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ExecCard 
            title="Receita Acumulada" 
            value={`R$ ${(stats.totalRevenue / 1000000).toFixed(2)} M`} 
            subtitle="Total Consolidado"
            icon={<DollarSign />} 
            color="#52C1DD" 
            trend="+12% VS META"
            onClick={() => setView?.('operational')}
         />
         <ExecCard 
            title="Tráfego Total" 
            value={stats.totalVehicles.toLocaleString()} 
            subtitle="Veículos Passageiros + Comerciais"
            icon={<CarFront />} 
            color="#052144" 
            trend="+5% VS MÊS ANT."
            onClick={() => setView?.('operational')}
         />
         <ExecCard 
            title="Segurança (SSO)" 
            value={`${stats.daysWithout} Dias`} 
            subtitle="Sem Acidentes com Afastamento"
            icon={<ShieldCheck />} 
            color="#009669" 
            trend="META ATINGIDA"
            isPositive
            onClick={() => setView?.('safety')}
         />
         <ExecCard 
            title="Sustentabilidade" 
            value={`${stats.totalWater} m³`} 
            subtitle="Água Reutilizada"
            icon={<Leaf />} 
            color="#86BB25" 
            trend="ECOEFICIÊNCIA"
            onClick={() => setView?.('socioenvironmental')}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Gráfico de Tendência de Tráfego */}
         <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[400px]">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-[#052144] font-black text-lg uppercase tracking-tight flex items-center gap-2">
                     <TrendingUp className="text-[#52C1DD]" size={20} />
                     Tendência de Tráfego
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Últimos 14 Dias de Operação</p>
               </div>
            </div>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trendData}>
                     <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#52C1DD" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#52C1DD" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                     <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="value" stroke="#52C1DD" strokeWidth={4} fill="url(#colorTrend)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Painel de Alertas e Notificações */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[400px]">
             <h3 className="text-[#052144] font-black text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                Centro de Alertas
             </h3>
             
             <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {stats.hrAbsences > 0 && (
                   <AlertItem 
                      type="rh" 
                      title="RH: Absenteísmo" 
                      desc={`${stats.hrAbsences} faltas registradas este mês.`} 
                      color="bg-rose-50 text-rose-600 border-rose-100"
                      icon={<Users size={16} />}
                   />
                )}
                {stats.safetyIncidents > 0 && (
                   <AlertItem 
                      type="safety" 
                      title="SSO: Incidente" 
                      desc={`${stats.safetyIncidents} ocorrências recentes.`} 
                      color="bg-amber-50 text-amber-600 border-amber-100"
                      icon={<ShieldCheck size={16} />}
                   />
                )}
                
                {stats.hrAbsences === 0 && stats.safetyIncidents === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 opacity-60">
                        <ShieldCheck size={48} className="mb-2 text-emerald-400" />
                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum Alerta Crítico</p>
                    </div>
                )}

                <AlertItem 
                   type="info" 
                   title="Fechamento Mensal" 
                   desc="O fechamento contábil está previsto para o dia 28." 
                   color="bg-blue-50 text-blue-600 border-blue-100"
                   icon={<Calendar size={16} />}
                />
             </div>
             
             <button onClick={() => setView?.('entry')} className="w-full mt-4 py-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                Novo Lançamento <ArrowRight size={14} />
             </button>
         </div>

      </div>
    </div>
  );
};

const ExecCard = ({ title, value, subtitle, icon, color, trend, isPositive, onClick }: any) => (
   <div 
     onClick={onClick}
     className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer group hover:scale-[1.02] transition-all hover:shadow-xl relative overflow-hidden"
   >
      <div className="flex justify-between items-start mb-4 relative z-10">
         <div className={`p-3 rounded-2xl text-white shadow-lg transform group-hover:rotate-12 transition-transform`} style={{ backgroundColor: color }}>
            {React.cloneElement(icon, { size: 24 })}
         </div>
         <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${isPositive || trend.includes('+') || trend.includes('META') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
            {trend} <ArrowUpRight size={10} />
         </div>
      </div>
      
      <div className="relative z-10">
         <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h3>
         <p className="text-2xl font-black text-[#052144] tracking-tight">{value}</p>
         <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-slate-300"></span> {subtitle}
         </p>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none" style={{ color: color }}>
         {React.cloneElement(icon, { size: 100 })}
      </div>
   </div>
);

const AlertItem = ({ title, desc, color, icon }: any) => (
   <div className={`p-4 rounded-xl border flex items-start gap-3 ${color}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
         <h4 className="text-xs font-black uppercase tracking-wide mb-0.5">{title}</h4>
         <p className="text-[10px] font-medium opacity-80 leading-relaxed">{desc}</p>
      </div>
   </div>
);

export default Dashboard;
