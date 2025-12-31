
export type RecordCategory = 'operational' | 'safety' | 'esg' | 'rh';

// Added UserRole type
export type UserRole = 'admin' | 'operator';

// Added User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'BLOCKED';
  createdAt: string;
  passwordHash: string;
  acceptedTermsAt?: string;
  accessCode?: string;
}

// Added AuditLog interface
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'CREATE' | 'DELETE' | 'VIEW_SENSITIVE' | 'EXPORT' | 'UPDATE';
  target: string;
  timestamp: string;
}

// Added Employee interface
export interface Employee {
  id: string;
  registrationId: string;
  name: string;
  role: string;
  plaza: string;
  gender: 'M' | 'F';
  admissionDate: string;
  status: 'Ativo' | 'Inativo' | 'Afastado';
}

export interface TollRecord {
  id?: string;
  created_at?: string;
  date: string;
  plaza_name: string; // Required for Supabase integration
  category: RecordCategory;
  
  // Operational fields (Supabase snake_case)
  light_vehicles?: number;
  heavy_vehicles?: number;
  revenue_cash?: number;
  revenue_electronic?: number;
  
  // Frontend CamelCase fields and additional metadata used across components
  plazaName?: string; 
  lightVehicles?: number;
  heavyVehicles?: number;
  revenueCash?: number;
  revenueElectronic?: number;
  incidents?: number;
  abnormalTransactions?: number;
  txCash?: number;
  txPix?: number;
  txCard?: number;
  txTag?: number;
  incidentTime?: string;
  
  // Specific flags/metrics for different departments
  isSafetyRecord?: boolean;
  isEnvironmentalRecord?: boolean;
  isHrRecord?: boolean;
  
  waterReading?: number;
  energyReading?: number;
  wasteReading?: number;
  
  hrType?: 'falta' | 'atestado' | 'afastamento' | 'ferias';
  hrDuration?: number;
  hrGender?: 'M' | 'F';
  
  segment?: 'Norte' | 'Sul';
  lane?: string;

  // Flexible fields (generic storage)
  type_label?: string; 
  value_metric?: number;
  observations?: string;
  metadata?: any;
}

// Expanded ViewType to include all navigation views used in the app
export type ViewType = 
  | 'dashboard' 
  | 'operational' 
  | 'safety' 
  | 'esg' 
  | 'rh' 
  | 'history' 
  | 'insights' 
  | 'access_control' 
  | 'database' 
  | 'entry' 
  | 'socioenvironmental';
