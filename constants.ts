
import { Company, User, UserRole, Service, Appointment, AppointmentStatus, FinancialRecord, WeeklySchedule, DayException, ClientUser } from './types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Clínica TechHealth',
    slug: 'tech-health',
    themeColor: 'blue',
    isActive: true,
    subscriptionPlan: 'PRO',
    customFormFields: [
      { id: 'f1', label: 'Alergias', type: 'text', required: false },
      { id: 'f2', label: 'Convênio Médico', type: 'select', options: ['Unimed', 'Bradesco Saúde', 'Particular'], required: true }
    ]
  },
  {
    id: 'c2',
    name: 'Barbearia Elite',
    slug: 'elite-barber',
    themeColor: 'slate',
    isActive: true,
    subscriptionPlan: 'BASIC',
    customFormFields: [
      { id: 'f3', label: 'Estilo Preferido', type: 'text', required: true }
    ]
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Administrador Geral', email: 'master@nexsched.com', phone: '000', role: UserRole.MASTER_ADMIN },
  { id: 'u2', name: 'Dra. Sarah Silva', email: 'sarah@techhealth.com', phone: '11999990000', role: UserRole.COMPANY_ADMIN, companyId: 'c1' },
  { id: 'u3', name: 'João Santos', email: 'joao@techhealth.com', phone: '11999991111', role: UserRole.PROVIDER, companyId: 'c1', specialty: 'Clínico Geral' },
  { id: 'u4', name: 'Mike Tesoura', email: 'mike@elitebarber.com', phone: '11999992222', role: UserRole.COMPANY_ADMIN, companyId: 'c2', specialty: 'Barbeiro Sênior' },
];

export const MOCK_CLIENT_USERS: ClientUser[] = [
  { 
    id: 'cli1', 
    name: 'Alice Ferreira', 
    email: 'alice@email.com', 
    phone: '5511987654321', 
    passwordHash: '123456', 
    createdAt: '2023-01-15T10:00:00Z' 
  },
  { 
    id: 'cli2', 
    name: 'Roberto Oliveira', 
    email: 'roberto@email.com', 
    phone: '5511912345678', 
    passwordHash: '123456', 
    createdAt: '2023-02-20T14:30:00Z' 
  }
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', companyId: 'c1', name: 'Consulta Geral', durationMinutes: 30, price: 200, color: '#3b82f6' },
  { id: 's2', companyId: 'c1', name: 'Limpeza Dental', durationMinutes: 60, price: 350, color: '#10b981' },
  { id: 's3', companyId: 'c2', name: 'Corte & Barba', durationMinutes: 45, price: 80, color: '#64748b' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    companyId: 'c1',
    serviceId: 's1',
    providerId: 'u3',
    clientId: 'cli1',
    clientName: 'Alice Ferreira',
    clientPhone: '5511987654321',
    start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    notes: 'Primeira visita',
    customFormData: { 'Alergias': 'Amendoim' }
  },
  {
    id: 'a2',
    companyId: 'c1',
    serviceId: 's2',
    providerId: 'u3',
    clientId: 'cli2',
    clientName: 'Roberto Oliveira',
    clientPhone: '5511912345678',
    start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.PENDING,
  }
];

export const MOCK_FINANCIALS: FinancialRecord[] = [
  { id: 'fin1', companyId: 'c1', amount: 200, type: 'INCOME', date: '2023-10-25', description: 'Taxa de Consulta' },
  { id: 'fin2', companyId: 'c1', amount: 350, type: 'INCOME', date: '2023-10-26', description: 'Procedimento Dental' },
  { id: 'fin3', companyId: 'c1', amount: -500, type: 'EXPENSE', date: '2023-10-20', description: 'Materiais Médicos' },
  { id: 'fin4', companyId: 'c2', amount: 80, type: 'INCOME', date: '2023-10-25', description: 'Corte de Cabelo' },
];

// Initial mock for provider u3 (João Santos)
export const MOCK_WEEKLY_SCHEDULE: WeeklySchedule[] = [
  {
    providerId: 'u3',
    schedule: {
      0: { isOpen: false, slots: [] }, // Sun
      1: { isOpen: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] }, // Mon
      2: { isOpen: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] }, // Tue
      3: { isOpen: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] }, // Wed
      4: { isOpen: true, slots: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] }, // Thu
      5: { isOpen: true, slots: [{ start: '09:00', end: '13:00' }] }, // Fri
      6: { isOpen: false, slots: [] }, // Sat
    }
  }
];

export const MOCK_EXCEPTIONS: DayException[] = [
  {
    id: 'exc1',
    providerId: 'u3',
    date: '2023-12-25', // Christmas
    isOpen: false,
    slots: []
  }
];
