
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import { ShieldAlert, Copy, UserCheck, Trash2, Ban, Search } from 'lucide-react';

const AccessManagement: React.FC = () => {
  const { usersList, approveUser, blockUser, deleteUser, user: currentUser, auditLogs } = useAuth();
  const [generatedCode, setGeneratedCode] = useState<{ id: string, code: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
        <ShieldAlert size={64} className="mb-4 text-rose-300" />
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-500">Acesso Restrito</h2>
        <p className="text-sm">Apenas administradores podem gerenciar acessos.</p>
      </div>
    );
  }

  const handleApprove = (id: string, role: UserRole) => {
    if (window.confirm(`Confirmar aprovação como ${role.toUpperCase()}?`)) {
      const code = approveUser(id, role);
      setGeneratedCode({ id, code });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado para a área de transferência! Envie para o usuário.');
  };

  // Filtragem de Logs
  const filteredLogs = auditLogs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-8">
      
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#52C1DD] text-[#052144] shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
        >
          Usuários
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-[#052144] text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
        >
          Logs de Auditoria
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Aceite LGPD</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-xs text-slate-600">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {u.acceptedTermsAt ? new Date(u.acceptedTermsAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide ${
                      u.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' :
                      u.status === 'APPROVED' ? 'bg-blue-100 text-blue-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {u.status === 'PENDING' ? 'Pendente' : u.status === 'APPROVED' ? 'Aguardando Login' : u.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
                    </span>
                    {u.role === 'admin' && <span className="ml-2 text-[9px] font-bold text-slate-400 border border-slate-200 px-1 rounded">ADMIN</span>}
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'PENDING' ? (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleApprove(u.id, 'operator')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Aprovar Operador
                        </button>
                        <button 
                          onClick={() => handleApprove(u.id, 'admin')}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Aprovar Admin
                        </button>
                        <button 
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Rejeitar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : generatedCode?.id === u.id && u.status === 'APPROVED' ? (
                      <div className="flex items-center justify-center gap-2 bg-[#52C1DD]/10 p-2 rounded-lg border border-[#52C1DD]/30 animate-in zoom-in duration-300">
                        <span className="text-sm font-mono font-bold text-[#052144] tracking-widest">{generatedCode.code}</span>
                        <button 
                          onClick={() => copyToClipboard(generatedCode.code)}
                          className="text-[#052144] hover:text-[#52C1DD] transition-colors"
                          title="Copiar Código"
                        >
                          <Copy size={16} />
                        </button>
                        <span className="text-[9px] font-bold text-slate-400 ml-2 uppercase">Envie este código</span>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        {u.status !== 'BLOCKED' && u.email !== 'admin@viacristais.com' && (
                          <button onClick={() => blockUser(u.id)} className="text-rose-500 p-1 hover:bg-rose-50 rounded" title="Bloquear"><Ban size={16}/></button>
                        )}
                        {u.email !== 'admin@viacristais.com' && (
                          <button onClick={() => deleteUser(u.id)} className="text-slate-400 p-1 hover:bg-slate-100 rounded" title="Excluir"><Trash2 size={16}/></button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Pesquisar logs..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#052144]"
                />
             </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
             <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4">Data/Hora</th>
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">Ação</th>
                      <th className="px-6 py-4">Alvo/Detalhe</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-3 text-xs text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                         </td>
                         <td className="px-6 py-3 text-sm font-bold text-slate-700">
                            {log.userName}
                         </td>
                         <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wide ${
                               log.action === 'LOGIN' ? 'bg-blue-50 text-blue-600' :
                               log.action === 'DELETE' ? 'bg-rose-50 text-rose-600' :
                               log.action === 'VIEW_SENSITIVE' ? 'bg-amber-50 text-amber-600' :
                               'bg-emerald-50 text-emerald-600'
                            }`}>
                               {log.action}
                            </span>
                         </td>
                         <td className="px-6 py-3 text-xs text-slate-500">
                            {log.target}
                         </td>
                      </tr>
                   ))}
                   {filteredLogs.length === 0 && (
                      <tr>
                         <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Nenhum log encontrado.</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessManagement;
