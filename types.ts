
export enum UserRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  PROVIDER = 'PROVIDER',
  CLIENT = 'CLIENT'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EN_ROUTE = 'EN_ROUTE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Company {
  id: string;
  name: string;
  slug: string; // for public url
  logoUrl?: string;
  themeColor: string;
  isActive: boolean;
  subscriptionPlan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  customFormFields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'file';
  options?: string[]; // for select
  required: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId?: string; // Null for Master Admin
  avatarUrl?: string;
  specialty?: string; // For providers
}

// NEW: Client User Interface
export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string; // Mock password
  createdAt: string;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  durationMinutes: number;
  price: number;
  color: string;
}

export interface Appointment {
  id: string;
  companyId: string;
  serviceId: string;
  providerId: string;
  clientId: string; // Links to ClientUser.id OR a guest ID
  clientName: string;
  clientPhone: string;
  start: string; // ISO String
  end: string; // ISO String
  status: AppointmentStatus;
  notes?: string;
  customFormData?: Record<string, any>;
}

export interface FinancialRecord {
  id: string;
  companyId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
}

// --- AVAILABILITY TYPES ---

export interface TimeSlot {
  start: string; // "08:00"
  end: string;   // "12:00"
}

export interface WeeklySchedule {
  providerId: string;
  schedule: {
    [key: number]: { // 0 (Sun) to 6 (Sat)
      isOpen: boolean;
      slots: TimeSlot[];
    }
  }
}

export interface DayException {
  id: string;
  providerId: string;
  date: string; // "YYYY-MM-DD"
  isOpen: boolean; // Override status
  slots: TimeSlot[]; // Override slots
}
