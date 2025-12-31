
import React, { useState } from 'react';
import { TollRecord, Employee } from '../types';
import { ALL_PLAZAS, LANES, PLAZAS_CONFIG } from '../constants';
import { Save, RefreshCcw, CreditCard, ShieldAlert, Leaf, Users, Activity, AlertTriangle } from 'lucide-react';

interface DataEntryProps {
  onAdd: (record: TollRecord) => void;
  employees?: Employee[];
}

type EntryTab = 'operational' | 'safety' | 'esg' | 'rh';

const DataEntry: React.FC<DataEntryProps> = ({ onAdd, employees = [] }) => {
  const [activeTab, setActiveTab] = useState<EntryTab>('operational');

  // Cores Temáticas
  const opColor = '#52C1DD';
  const safetyColor = '#009669';
  const esgColor = '#86BB25';
  const hrColor = '#762868';

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-8">
      
      {/* Navegação de Abas */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('operational')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'operational' 
              ? `bg-[${opColor}] text-[#052144] shadow-md` 
              : 'hover:bg-slate-50 text-slate-400'
          }`}
          style={{ backgroundColor: activeTab === 'operational' ? opColor : 'transparent' }}
        >
          <Activity size={18} /> Operacional
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'safety' 
              ? `bg-[${safetyColor}] text-white shadow-md` 
              : 'hover:bg-slate-50 text-slate-400'
          }`}
          style={{ backgroundColor: activeTab === 'safety' ? safetyColor : 'transparent' }}
        >
          <ShieldAlert size={18} /> Segurança
        </button>
        <button
          onClick={() => setActiveTab('esg')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'esg' 
              ? `bg-[${esgColor}] text-white shadow-md` 
              : 'hover:bg-slate-50 text-slate-400'
          }`}
          style={{ backgroundColor: activeTab === 'esg' ? esgColor : 'transparent' }}
        >
          <Leaf size={18} /> ESG
        </button>
        <button
          onClick={() => setActiveTab('rh')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'rh' 
              ? `bg-[${hrColor}] text-white shadow-md` 
              : 'hover:bg-slate-50 text-slate-400'
          }`}
          style={{ backgroundColor: activeTab === 'rh' ? hrColor : 'transparent' }}
        >
          <Users size={18} /> RH
        </button>
      </div>

      {/* Área de Conteúdo */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
        {activeTab === 'operational' && <OperationalForm onAdd={onAdd} color={opColor} />}
        {activeTab === 'safety' && <SafetyForm onAdd={onAdd} color={safetyColor} />}
        {activeTab === 'esg' && <ESGForm onAdd={onAdd} color={esgColor} />}
        {activeTab === 'rh' && <HRForm onAdd={onAdd} color={hrColor} employees={employees} />}
      </div>
    </div>
  );
};

// --- FORMULÁRIO OPERACIONAL ---
export const OperationalForm = ({ onAdd, color }: { onAdd: (r: TollRecord) => void, color: string }) => {
  const initialState = {
    date: new Date().toISOString().split('T')[0],
    plazaName: ALL_PLAZAS[0],
    lane: LANES[0],
    lightVehicles: 0, heavyVehicles: 0, abnormalTransactions: 0,
    txCash: 0, txPix: 0, txCard: 0, txTag: 0,
    incidents: 0,
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onAdd({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        plaza_name: formData.plazaName,
        category: 'operational',
        segment: PLAZAS_CONFIG[formData.plazaName],
        light_vehicles: formData.lightVehicles,
        heavy_vehicles: formData.heavyVehicles,
        revenue_cash: formData.txCash * 12.50,
        revenue_electronic: (formData.txPix + formData.txCard + formData.txTag) * 12.50,
        revenueCash: formData.txCash * 12.50,
        revenueElectronic: (formData.txPix + formData.txCard + formData.txTag) * 12.50
      });
      setFormData(initialState);
      setIsSubmitting(false);
      alert('Dados operacionais inseridos!');
    }, 400);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'date' || name === 'plazaName' || name === 'lane') ? value : Number(value)
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 bg-[#E6E6E6] border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#52C1DD] font-bold text-[#052144]" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Praça (PP)</label>
            <select name="plazaName" value={formData.plazaName} onChange={handleChange} className="w-full px-4 py-3 bg-[#E6E6E6] border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#52C1DD] font-bold text-[#052144]">
              {ALL_PLAZAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pista</label>
            <select name="lane" value={formData.lane} onChange={handleChange} className="w-full px-4 py-3 bg-[#E6E6E6] border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#52C1DD] font-bold text-[#052144]">
              {LANES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest">Volume de Veículos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] text-slate-400 font-black uppercase">Leves</label><input type="number" name="lightVehicles" value={formData.lightVehicles} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD]" min="0" /></div>
              <div className="space-y-1"><label className="text-[10px] text-slate-400 font-black uppercase">Pesados</label><input type="number" name="heavyVehicles" value={formData.heavyVehicles} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD]" min="0" /></div>
            </div>
            <div className="space-y-1 border-t border-slate-200 pt-3">
                 <label className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-2"><AlertTriangle size={12} className="text-amber-500" /> Transações Anormais</label>
                 <input type="number" name="abnormalTransactions" value={formData.abnormalTransactions} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD] bg-amber-50" min="0" />
            </div>
          </div>
          <div className="bg-[#52C1DD]/10 p-6 rounded-2xl border border-[#52C1DD]/20 space-y-4">
            <h3 className="font-bold text-[#052144] flex items-center gap-2 uppercase text-xs tracking-widest"><CreditCard size={16} /> Meios de Pagamento</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1"><label className="text-[9px] text-slate-500 font-black">Dinheiro</label><input type="number" name="txCash" value={formData.txCash} onChange={handleChange} className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD]" /></div>
              <div className="space-y-1"><label className="text-[9px] text-slate-500 font-black">PIX</label><input type="number" name="txPix" value={formData.txPix} onChange={handleChange} className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD]" /></div>
              <div className="space-y-1"><label className="text-[9px] text-slate-500 font-black">Cartão</label><input type="number" name="txCard" value={formData.txCard} onChange={handleChange} className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD]" /></div>
              <div className="space-y-1"><label className="text-[9px] text-slate-500 font-black">TAG</label><input type="number" name="txTag" value={formData.txTag} onChange={handleChange} className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#52C1DD]" /></div>
            </div>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-[#052144] font-black uppercase tracking-widest transition-all bg-[#52C1DD] hover:brightness-110 shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? 'Salvando...' : <><Save size={20} /> Confirmar Lançamento</>}
        </button>
      </form>
    </>
  );
};

// --- FORMULÁRIO SEGURANÇA ---
export const SafetyForm = ({ onAdd, color }: { onAdd: (r: TollRecord) => void, color: string }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    plaza: ALL_PLAZAS[0],
    type: 'ASAF',
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `sso-${Date.now()}`,
      date: form.date,
      incidentTime: form.time,
      plaza_name: form.plaza,
      plazaName: form.plaza,
      category: 'safety',
      segment: PLAZAS_CONFIG[form.plaza],
      lane: form.type,
      light_vehicles: 0, heavy_vehicles: 0, 
      lightVehicles: 0, heavyVehicles: 0, abnormalTransactions: 0,
      txCash: 0, txPix: 0, txCard: 0, txTag: 0, revenueCash: 0, revenueElectronic: 0, incidents: 1,
      isSafetyRecord: true,
      observations: form.observations
    });
    alert('Ocorrência de Segurança registrada!');
    setForm({...form, observations: ''});
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Evento</label><input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none focus:ring-2" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</label><input type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none focus:ring-2" /></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Praça</label><select value={form.plaza} onChange={e => setForm({...form, plaza: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none focus:ring-2">{ALL_PLAZAS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classificação</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none focus:ring-2">
            <option value="ASAF">ASAF - S/ Afastamento</option><option value="ACAF">ACAF - C/ Afastamento</option><option value="SAM">SAM - Atend. Médico</option><option value="ACDM">ACDM - Danos Mat.</option><option value="QAC">QAC - Quase Acidente</option><option value="TRAJETO">TRAJETO</option>
          </select></div>
        </div>
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição do Ocorrido</label><textarea required value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 min-h-[100px]" placeholder="Detalhes..." /></div>
        <button type="submit" style={{ backgroundColor: color }} className="w-full h-14 rounded-xl text-white font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"><Save size={18} /> Registrar</button>
      </form>
    </>
  );
};

// --- FORMULÁRIO ESG ---
export const ESGForm = ({ onAdd, color }: { onAdd: (r: TollRecord) => void, color: string }) => {
  const [category, setCategory] = useState<'water' | 'energy' | 'waste'>('water');
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    plaza: ALL_PLAZAS[0],
    value: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: TollRecord = {
      id: `env-${Date.now()}`,
      date: form.date,
      plaza_name: form.plaza,
      plazaName: form.plaza,
      category: 'esg',
      segment: PLAZAS_CONFIG[form.plaza],
      lane: 'ENV', lightVehicles: 0, heavyVehicles: 0, abnormalTransactions: 0,
      txCash: 0, txPix: 0, txCard: 0, txTag: 0, revenueCash: 0, revenueElectronic: 0, incidents: 0,
      isEnvironmentalRecord: true,
      observations: `Lançamento ${category}: ${form.plaza}`
    };

    if (category === 'water') record.waterReading = Number(form.value);
    if (category === 'energy') record.energyReading = Number(form.value);
    if (category === 'waste') record.wasteReading = Number(form.value);

    onAdd(record);
    setForm({...form, value: ''});
    alert('Medição ESG registrada!');
  };

  return (
    <>
      <div className="p-8 space-y-6">
        <div className="flex gap-2">
          {(['water', 'energy', 'waste'] as const).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-slate-100 border-slate-300 text-slate-700 shadow-inner' : 'border-transparent text-slate-400'}`}>
              {cat === 'water' ? 'Água' : cat === 'energy' ? 'Energia' : 'Resíduos'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Praça</label><select value={form.plaza} onChange={e => setForm({...form, plaza: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl">{ALL_PLAZAS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor da Medição ({category === 'water' ? 'm³' : category === 'energy' ? 'kWh' : 'kg'})</label>
            <input type="number" required value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl" placeholder="0.00" />
          </div>
          <button type="submit" style={{ backgroundColor: color }} className="w-full h-14 rounded-xl text-white font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 mt-4"><Save size={18} /> Salvar Medição</button>
        </form>
      </div>
    </>
  );
};

// --- FORMULÁRIO RH ---
export const HRForm = ({ onAdd, color, employees }: { onAdd: (r: TollRecord) => void, color: string, employees: Employee[] }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    plaza: ALL_PLAZAS[0],
    type: 'falta',
    days: '1',
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `rh-${Date.now()}`,
      date: form.date,
      plaza_name: form.plaza,
      plazaName: form.plaza,
      category: 'rh',
      segment: PLAZAS_CONFIG[form.plaza],
      lane: 'RH', 
      lightVehicles: 0, heavyVehicles: 0, abnormalTransactions: 0,
      txCash: 0, txPix: 0, txCard: 0, txTag: 0, revenueCash: 0, revenueElectronic: 0, incidents: 0,
      isHrRecord: true,
      hrType: form.type as any,
      hrDuration: Number(form.days),
      observations: form.observations
    });
    alert('Registro de RH salvo!');
    setForm({...form, observations: '', days: '1'});
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Praça</label><select value={form.plaza} onChange={e => setForm({...form, plaza: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl">{ALL_PLAZAS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl">
              <option value="falta">Falta</option><option value="atestado">Atestado</option><option value="afastamento">Afastamento</option><option value="ferias">Férias</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração (Dias)</label>
            <input type="number" min="1" value={form.days} onChange={e => setForm({...form, days: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações (Colaborador / Detalhes)</label>
          <textarea value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl min-h-[80px]" placeholder="Ex: Matrícula 202301 - João Silva" />
        </div>
        <button type="submit" style={{ backgroundColor: color }} className="w-full h-14 rounded-xl text-white font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 mt-4"><Save size={18} /> Salvar Registro RH</button>
      </form>
    </>
  );
};

export default DataEntry;
