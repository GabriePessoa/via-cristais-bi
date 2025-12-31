
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, UserRole, AuditLog } from '../types';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string; requiresCode?: boolean }>;
  signUp: (name: string, email: string, password: string, acceptedTerms: boolean) => Promise<{ success: boolean; message: string }>;
  signOut: () => void;
  logAction: (action: AuditLog['action'], target: string) => void;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  usersList: User[];
  approveUser: (id: string, role: UserRole) => string;
  blockUser: (id: string) => void;
  deleteUser: (id: string) => void;
  auditLogs: AuditLog[];
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Dados Iniciais Mockados
const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@viacristais.com',
  name: 'Administrador Demo',
  role: 'admin',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  passwordHash: 'admin123'
};

const MOCK_OPERATOR: User = {
  id: 'op-1',
  email: 'operador@viacristais.com',
  name: 'Operador Padrão',
  role: 'operator',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  passwordHash: '123456'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<User[]>([MOCK_ADMIN, MOCK_OPERATOR]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Verificar persistência local ao carregar
    const storedUser = localStorage.getItem('via_cristais_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Carregar logs simulados
    const storedLogs = localStorage.getItem('via_cristais_logs');
    if (storedLogs) {
      setAuditLogs(JSON.parse(storedLogs));
    }

    setLoading(false);
  }, []);

  const logAction = (action: AuditLog['action'], target: string) => {
    if (!user) return;
    
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      action,
      target,
      timestamp: new Date().toISOString()
    };
    
    const newLogs = [newLog, ...auditLogs];
    setAuditLogs(newLogs);
    localStorage.setItem('via_cristais_logs', JSON.stringify(newLogs));
  };

  const signIn = async (email: string, password: string) => {
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    // Lógica Mock de Login
    const foundUser = usersList.find(u => u.email === email);

    if (foundUser) {
      // Senha hardcoded para demo: admin123 ou 123456 ou qualquer coisa em dev mode se preferir
      // Aqui vamos aceitar a senha se for 'admin123' para admin e '123456' para outros, ou se o usuário acabou de ser criado
      if (password === 'admin123' || password === '123456' || password === foundUser.passwordHash) {
         if (foundUser.status === 'BLOCKED') return { success: false, message: 'Usuário bloqueado.' };
         if (foundUser.status === 'PENDING') return { success: false, message: 'Cadastro pendente de aprovação.' };
         
         setUser(foundUser);
         localStorage.setItem('via_cristais_user', JSON.stringify(foundUser));
         logAction('LOGIN', 'Realizou login no sistema');
         return { success: true, message: 'Login realizado com sucesso!' };
      }
    }
    
    return { success: false, message: 'Credenciais inválidas. Tente admin@viacristais.com / admin123' };
  };

  const signUp = async (name: string, email: string, password: string, acceptedTerms: boolean) => {
    if (!acceptedTerms) return { success: false, message: 'Aceite os termos LGPD.' };
    await new Promise(resolve => setTimeout(resolve, 800));

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      passwordHash: password, // Inseguro apenas para demo frontend
      role: 'operator',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      acceptedTermsAt: new Date().toISOString()
    };

    setUsersList(prev => [...prev, newUser]);
    return { success: true, message: 'Solicitação enviada! Aguarde aprovação do admin.' };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('via_cristais_user');
  };

  const verifyCode = async (email: string, code: string) => {
    return code === '123456';
  };

  const approveUser = (id: string, role: UserRole) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: 'APPROVED', role, accessCode: code } : u));
    logAction('CREATE', `Aprovou usuário ${id} como ${role}`);
    return code;
  };

  const blockUser = (id: string) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: 'BLOCKED' } : u));
    logAction('UPDATE', `Bloqueou usuário ${id}`);
  };

  const deleteUser = (id: string) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
    logAction('DELETE', `Excluiu usuário ${id}`);
  };

  return (
    <AuthContext.Provider value={{ 
      user, isAuthenticated: !!user, signIn, signUp, signOut, logAction,
      verifyCode, usersList, approveUser, blockUser, deleteUser, auditLogs
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
