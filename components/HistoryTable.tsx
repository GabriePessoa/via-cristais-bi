
import React, { useState } from 'react';
import { TollRecord } from '../types';
import { FileDown, Search, ShieldAlert, Activity, Leaf, Users, ArrowDown, ArrowUp, Filter, History as HistoryIcon } from 'lucide-react';

interface HistoryTableProps {
  data: TollRecord[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'operational' | 'safety' | 'esg' | 'rh'>('operational');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TollRecord; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Cores do sistema
  const VCR_BLUE = '#004489';
  const DARK_BLUE = '#052144';

  const colors = {
    operational: '#52C1DD',
    safety: '#009669',
    esg: '#86BB25',
    rh: '#762868'
  };

  const filteredHistory = data.filter(r => {
    let matchesTab = false;
    if (activeTab === 'operational') matchesTab = !r.isSafetyRecord && !r.isEnvironmentalRecord && !r.isHrRecord;
    else if (activeTab === 'safety') matchesTab = !!r.isSafetyRecord;
    else if (activeTab === 'esg') matchesTab = !!r.isEnvironmentalRecord;
    else if (activeTab === 'rh') matchesTab = !!r.isHrRecord;

    const matchesSearch = 
        (r.plazaName || r.plaza_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (r.observations || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.date.includes(searchTerm);

    return matchesTab && matchesSearch;
  });

  const sortedData = [...filteredHistory].sort((a, b) => {
    const valA = a[sortConfig.key] ?? '';
    const valB = b[sortConfig.key] ?? '';
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof TollRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    const headers = ['ID', 'Data', 'Praça', 'Categoria', 'Detalhes'];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(";") + "\n"
        + sortedData.map(r => `${r.id};${r.date};${r.plazaName || r.plaza_name};${activeTab};${r.observations || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_${activeTab}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#E6E6E6] animate-in fade-in duration-500 p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      
      {/* TOOLBAR UNIFICADA */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* GRUPO ESQUERDA: TABS + EXPORTAR */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            {/* TABS */}
            <div className="flex bg-slate-300/30 backdrop-blur-md p-1.5 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar gap-1.5 border border-slate-300/50 shadow-sm">
              <TabButton 
                 isActive={activeTab === 'operational'} 
                 onClick={() => setActiveTab('operational')} 
                 icon={<Activity size={16} />} 
                 label="OPERACIONAL" 
                 activeColor={colors.operational}
                 activeText="#052144"
              />
              <TabButton 
                 isActive={activeTab === 'safety'} 
                 onClick={() => setActiveTab('safety')} 
                 icon={<ShieldAlert size={16} />} 
                 label="SSO" 
                 activeColor={colors.safety}
                 activeText="white"
              />
              <TabButton 
                 isActive={activeTab === 'esg'} 
                 onClick={() => setActiveTab('esg')} 
                 icon={<Leaf size={16} />} 
                 label="ESG" 
                 activeColor={colors.esg}
                 activeText="white"
              />
              <TabButton 
                 isActive={activeTab === 'rh'} 
                 onClick={() => setActiveTab('rh')} 
                 icon={<Users size={16} />} 
                 label="RH" 
                 activeColor={colors.rh}
                 activeText="white"
              />
            </div>

            {/* BOTÃO EXPORTAR */}
            <button 
               onClick={exportCSV}
               className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-white text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 hover:brightness-110 whitespace-nowrap w-full md:w-auto justify-center"
               style={{ backgroundColor: VCR_BLUE }}
            >
              <FileDown size={18} /> Exportar CSV
            </button>
        </div>

        {/* GRUPO DIREITA: BUSCA */}
        <div className="relative w-full xl:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#052144] transition-colors" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar registros..." 
            className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#052144] shadow-sm transition-all"
          />
        </div>
      </div>
      
      {/* TABELA INTEGRADA AO FUNDO */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[30px] border border-slate-300 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 uppercase tracking-widest font-black" style={{ color: DARK_BLUE, fontSize: '12px' }}>
                <th className="px-6 py-5 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('date')}>
                  <div className="flex items-center gap-1">Data {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}</div>
                </th>
                <th className="px-6 py-5 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => requestSort('plazaName')}>
                  <div className="flex items-center gap-1">Praça {sortConfig.key === 'plazaName' && (sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}</div>
                </th>
                
                {activeTab === 'operational' && (
                  <>
                    <th className="px-6 py-5">Pista</th>
                    <th className="px-6 py-5 text-right">Volume</th>
                    <th className="px-6 py-5 text-right">Receita</th>
                  </>
                )}
                {activeTab === 'safety' && (
                  <>
                    <th className="px-6 py-5">Classificação</th>
                    <th className="px-6 py-5">Horário</th>
                    <th className="px-6 py-5">Observações</th>
                  </>
                )}
                {activeTab === 'esg' && (
                  <>
                    <th className="px-6 py-5 text-right">Água (m³)</th>
                    <th className="px-6 py-5 text-right">Energia (kWh)</th>
                    <th className="px-6 py-5 text-right">Resíduos (kg)</th>
                  </>
                )}
                {activeTab === 'rh' && (
                  <>
                    <th className="px-6 py-5">Tipo</th>
                    <th className="px-6 py-5">Dias</th>
                    <th className="px-6 py-5">Observações</th>
                  </>
                )}
                <th className="px-6 py-5 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedData.map((record) => (
                <tr key={record.id} className="hover:bg-white transition-all group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {new Date(record.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-[#052144] uppercase bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                      {record.plazaName || record.plaza_name}
                    </span>
                  </td>
                  
                  {activeTab === 'operational' && (
                    <>
                      <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">{record.lane || 'L01'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono text-right font-bold">
                        {((record.lightVehicles || 0) + (record.heavyVehicles || 0)).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-[#052144] font-mono text-right">
                        {((record.revenueCash || 0) + (record.revenueElectronic || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </>
                  )}

                  {activeTab === 'safety' && (
                    <>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${
                            ['ACAF', 'SAM'].includes(record.lane || '') ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                            {record.lane}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{record.incidentTime || '--:--'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">{record.observations}</td>
                    </>
                  )}

                  {activeTab === 'esg' && (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 text-right">{record.waterReading?.toLocaleString('pt-BR') || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-amber-600 text-right">{record.energyReading?.toLocaleString('pt-BR') || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">{record.wasteReading?.toLocaleString('pt-BR') || '-'}</td>
                    </>
                  )}

                  {activeTab === 'rh' && (
                    <>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {record.hrType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{record.hrDuration || '-'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">{record.observations}</td>
                    </>
                  )}

                  <td className="px-6 py-4 text-center">
                     <div className={`w-2 h-2 rounded-full mx-auto ${
                         (record.incidents && record.incidents > 0) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                     }`}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, icon, label, activeColor, activeText }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all border-2 ${
          isActive 
            ? `shadow-lg border-white scale-105` 
            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-white/50'
      }`}
      style={{ 
        backgroundColor: isActive ? activeColor : 'transparent',
        color: isActive ? activeText : undefined
      }}
    >
      {icon} {label}
    </button>
);

export default HistoryTable;
