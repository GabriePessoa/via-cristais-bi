
import React, { useState, useRef } from 'react';
import { Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Briefcase, Calendar, MapPin, Upload, Download, Trash2, ChevronDown, Eye, EyeOff, Database } from 'lucide-react';

interface DatabaseViewProps {
  employees: Employee[];
  onImport?: (newEmployees: Employee[]) => void;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: Employee['status']) => void;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ employees, onImport, onDelete, onUpdateStatus }) => {
  const { logAction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlaza, setFilterPlaza] = useState('all');
  const [privacyMode, setPrivacyMode] = useState(true); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cor Azul VCR: R0 G68 B137 -> #004489
  const VCR_BLUE = '#004489';
  const DARK_BLUE = '#052144';

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.registrationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlaza = filterPlaza === 'all' || emp.plaza === filterPlaza;
    return matchesSearch && matchesPlaza;
  });

  const togglePrivacy = () => {
     if (privacyMode) {
        if (confirm('Atenção: Ao desativar o modo de privacidade, sua visualização de dados sensíveis será registrada nos logs de auditoria. Deseja continuar?')) {
           logAction('VIEW_SENSITIVE', 'Database: Visualizou nomes completos');
           setPrivacyMode(false);
        }
     } else {
        setPrivacyMode(true);
     }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/);
      const newEmployees: Employee[] = [];
      const separator = lines[0].includes(';') ? ';' : ',';
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 6) {
           newEmployees.push({
             id: `imp-${Date.now()}-${i}`,
             registrationId: cols[0], name: cols[1], role: cols[2], plaza: cols[3],
             gender: cols[4]?.toUpperCase() === 'F' ? 'F' : 'M', admissionDate: cols[5],
             status: (cols[6] as any) || 'Ativo'
           });
        }
      }
      if (newEmployees.length > 0 && onImport) onImport(newEmployees);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#E6E6E6] animate-in fade-in duration-500 p-8 space-y-6 max-w-[1600px] mx-auto w-full">
      
      {/* TOOLBAR UNIFICADA */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* GRUPO ESQUERDA: AÇÕES + FILTROS */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
            
            {/* Botão Importar */}
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-white text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 hover:brightness-110 w-full md:w-auto justify-center"
               style={{ backgroundColor: VCR_BLUE }}
            >
              <Upload size={18} /> Importar CSV
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />

            {/* Botão Privacidade */}
            <button 
                onClick={togglePrivacy}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all shadow-sm w-full md:w-auto justify-center ${privacyMode ? 'bg-[#52C1DD]/10 border-[#52C1DD] text-[#052144]' : 'bg-white border-slate-300 text-slate-500'}`}
            >
                {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="text-xs font-black uppercase tracking-widest">{privacyMode ? 'Privacidade ON' : 'Dados Expostos'}</span>
            </button>

            {/* Filtro Praça */}
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-slate-300 px-5 py-3 rounded-xl shadow-sm w-full md:w-auto">
               <Filter size={16} className="text-slate-400" />
               <select 
                 value={filterPlaza}
                 onChange={(e) => setFilterPlaza(e.target.value)}
                 className="bg-transparent outline-none text-xs font-black uppercase text-slate-700 cursor-pointer w-full"
               >
                 <option value="all">Todas as Praças</option>
                 {Array.from(new Set(employees.map(e => e.plaza))).map(p => (
                   <option key={p} value={p}>{p}</option>
                 ))}
               </select>
            </div>
        </div>

        {/* GRUPO DIREITA: BUSCA */}
        <div className="relative w-full xl:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#052144] transition-colors" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou matrícula..." 
            className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-300 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#052144] shadow-sm transition-all"
          />
        </div>
      </div>

      {/* LISTA INTEGRADA AO FUNDO */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[30px] border border-slate-300 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 uppercase tracking-widest font-black" style={{ color: DARK_BLUE, fontSize: '12px' }}>
                <th className="px-6 py-5">Matrícula</th>
                <th className="px-6 py-5">Colaborador</th>
                <th className="px-6 py-5">Cargo</th>
                <th className="px-6 py-5">Unidade</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-white transition-all group">
                  <td className="px-6 py-4">
                     <span className={`font-mono text-xs font-black text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg ${privacyMode ? 'blur-[4px] select-none' : ''}`}>{emp.registrationId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-md" style={{ backgroundColor: VCR_BLUE }}>
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-black text-[#052144] ${privacyMode ? 'blur-[5px] select-none' : ''}`}>{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase size={14} className="text-slate-300" />
                      <span className="text-xs font-bold uppercase">{emp.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="text-xs font-black uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{emp.plaza}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete?.(emp.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
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

export default DatabaseView;
