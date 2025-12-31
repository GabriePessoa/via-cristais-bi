
import { TollRecord, Employee } from './types';

export const TRECHOS = ['Norte', 'Sul'] as const;

export const PLAZAS_CONFIG: Record<string, 'Norte' | 'Sul'> = {
  'PP1': 'Norte',
  'PP2': 'Norte',
  'PP3': 'Norte',
  'PP4': 'Norte',
  'PP5': 'Sul',
  'PP6': 'Sul',
  'PP7': 'Sul',
};

export const PLAZAS_BY_SEGMENT = {
  'Norte': ['PP1', 'PP2', 'PP3', 'PP4'],
  'Sul': ['PP5', 'PP6', 'PP7']
};

export const ALL_PLAZAS = Object.keys(PLAZAS_CONFIG);

// Função auxiliar para gerar dados fictícios coerentes
const generateMockData = (): TollRecord[] => {
  const records: TollRecord[] = [];
  const plazas = ALL_PLAZAS;
  
  const now = new Date();
  
  // 1. Gerar dados operacionais gerais (últimos 60 dias)
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    plazas.forEach(plaza => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseTraffic = isWeekend ? 2500 : 1500;
      const randomVar = Math.floor(Math.random() * 500);
      
      const lightVehicles = Math.floor((baseTraffic + randomVar) * 0.7);
      const heavyVehicles = Math.floor((baseTraffic + randomVar) * 0.3);
      const totalVehicles = lightVehicles + heavyVehicles;
      
      const txTag = Math.floor(totalVehicles * (0.5 + Math.random() * 0.15));
      const txCash = Math.floor(totalVehicles * (0.2 + Math.random() * 0.1));
      const txPix = Math.floor(totalVehicles * (0.1 + Math.random() * 0.05));
      const txCard = totalVehicles - txTag - txCash - txPix;

      // Fixed: Added plaza_name and category to match TollRecord requirement
      records.push({
        id: `mock-${i}-${plaza}`,
        date: dateStr,
        plaza_name: plaza,
        category: 'operational',
        incidentTime: undefined,
        segment: PLAZAS_CONFIG[plaza],
        plazaName: plaza,
        lane: 'L01',
        lightVehicles,
        heavyVehicles,
        abnormalTransactions: Math.floor(Math.random() * 15),
        txCash,
        txPix,
        txCard,
        txTag,
        revenueCash: txCash * 12.50,
        revenueElectronic: (txPix + txCard + txTag) * 12.50,
        incidents: 0
      });
    });
  }

  // 2. Gerar Ocorrências de Segurança Específicas para Dezembro 2025
  const safetyTypes = ['ASAF', 'ACAF', 'SAM', 'ACDM', 'QAC', 'TRAJETO'];
  
  // GARANTIA: Pelo menos 1 ocorrência para CADA praça em Dezembro
  // Isso popula o calendário sem poluir visualmente (distribuição espalhada)
  ALL_PLAZAS.forEach((plaza, index) => {
      // Espalhar os dias entre dia 1 e dia 28 para cobrir o mês
      const day = (index * 3) + 2; // Dias: 2, 5, 8, 11, 14, 17, 20...
      const dateStr = `2025-12-${String(day).padStart(2, '0')}`;
      
      const type = safetyTypes[index % safetyTypes.length];
      const h = Math.floor(8 + Math.random() * 10).toString().padStart(2, '0'); // Horário comercial

      records.push({
          id: `safety-guaranteed-${plaza}`,
          date: dateStr,
          plaza_name: plaza,
          plazaName: plaza,
          category: 'safety',
          segment: PLAZAS_CONFIG[plaza],
          lane: type,
          incidentTime: `${h}:30`,
          incidents: 1,
          isSafetyRecord: true,
          observations: `Registro Obrigatório: ${type} em ${plaza}`
      });
  });

  // Adicionar algumas aleatórias extras para dar volume (sem exagerar)
  for (let i = 0; i < 5; i++) {
      const day = Math.floor(Math.random() * 25) + 1;
      const dateStr = `2025-12-${String(day).padStart(2, '0')}`;
      const plaza = plazas[Math.floor(Math.random() * plazas.length)];
      const type = safetyTypes[Math.floor(Math.random() * safetyTypes.length)];
      
      records.push({
          id: `safety-random-${i}`,
          date: dateStr,
          plaza_name: plaza,
          plazaName: plaza,
          category: 'safety',
          segment: PLAZAS_CONFIG[plaza],
          lane: type,
          incidentTime: `14:00`,
          incidents: 1,
          isSafetyRecord: true,
          observations: `Ocorrência adicional ${type}`
      });
  }
  
  return records;
};

export const INITIAL_DATA: TollRecord[] = generateMockData();

export const LANES = ['N/A', 'L01', 'L02', 'L03', 'L04', 'L05', 'Automática 01', 'Automática 02'];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', registrationId: '2023001', name: 'Carlos Silva', role: 'Operador de Pedágio', plaza: 'PP1', gender: 'M', admissionDate: '2022-03-15', status: 'Ativo' },
  { id: '2', registrationId: '2023045', name: 'Mariana Santos', role: 'Supervisora', plaza: 'PP2', gender: 'F', admissionDate: '2021-06-10', status: 'Ativo' },
  { id: '3', registrationId: '2023099', name: 'Roberto Almeida', role: 'Manutenção', plaza: 'PP5', gender: 'M', admissionDate: '2023-01-20', status: 'Afastado' },
  { id: '4', registrationId: '2023112', name: 'Fernanda Lima', role: 'Operadora de Pedágio', plaza: 'PP3', gender: 'F', admissionDate: '2022-11-05', status: 'Ativo' },
  { id: '5', registrationId: '2020055', name: 'João Pereira', role: 'Segurança', plaza: 'PP1', gender: 'M', admissionDate: '2020-08-14', status: 'Inativo' },
];
