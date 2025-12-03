import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Calendar, CheckCircle, Clock, DollarSign, Users, Settings, 
  Menu, X, MessageCircle, BarChart, ChevronLeft, ChevronRight,
  Plus, Search, Briefcase, LayoutDashboard, LogOut, Copy, ExternalLink, Save,
  Moon, Sun, Trash2, Edit2, AlertCircle, Check, XCircle, Share2, Scissors,
  User as UserIcon, CalendarCheck, Home, Lock, Mail, Phone, Loader2, AlertTriangle, Lightbulb
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// REPLACED: OpenAI Service
import { generateWhatsAppMessage, analyzeFinancials } from './services/openaiService';
import { 
  UserRole, Company, User, Service, Appointment, AppointmentStatus, FinancialRecord, FormField,
  WeeklySchedule, DayException, TimeSlot, ClientUser 
} from './types';
import { MOCK_COMPANIES, MOCK_USERS, MOCK_SERVICES, MOCK_APPOINTMENTS, MOCK_FINANCIALS, MOCK_WEEKLY_SCHEDULE, MOCK_EXCEPTIONS, MOCK_CLIENT_USERS } from './constants';
import { AuthView } from './components/AuthView';

// --- GLOBAL STATE SIMULATION (CONTEXT) ---

interface AppState {
  companies: Company[];
  users: User[];
  services: Service[];
  appointments: Appointment[];
  financials: FinancialRecord[];
  
  // Availability State
  weeklySchedules: WeeklySchedule[];
  dayExceptions: DayException[];
  updateWeeklySchedule: (schedule: WeeklySchedule) => void;
  updateDayException: (exception: DayException) => void;

  currentUser: User | null;
  isLoadingAuth: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  addAppointment: (appt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  
  // Services Management
  addService: (service: Service) => void;
  deleteService: (id: string) => void;

  // Client Portal State
  clientUsers: ClientUser[];
  currentClient: ClientUser | null;
  clientLogout: () => void;
  updateClientProfile: (client: ClientUser) => void;
}

const AppContext = React.createContext<AppState | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [users, setUsers] = useState(MOCK_USERS);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [financials, setFinancials] = useState(MOCK_FINANCIALS);
  
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>(MOCK_WEEKLY_SCHEDULE);
  const [dayExceptions, setDayExceptions] = useState<DayException[]>(MOCK_EXCEPTIONS);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [clientUsers, setClientUsers] = useState<ClientUser[]>(MOCK_CLIENT_USERS);
  const [currentClient, setCurrentClient] = useState<ClientUser | null>(null);

  useEffect(() => {
    // Simulate checking local session on load
    const storedUser = localStorage.getItem('nexsched_user');
    const storedClient = localStorage.getItem('nexsched_client');

    if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
    } else if (storedClient) {
        setCurrentClient(JSON.parse(storedClient));
    }
    setIsLoadingAuth(false);
  }, []);

  const login = (email: string, role: UserRole) => {
     setIsLoadingAuth(true);
     // Find in mocks or create dummy session
     if (role === UserRole.CLIENT) {
        const client = clientUsers.find(c => c.email === email) || {
             id: `cli_${Date.now()}`,
             name: email.split('@')[0],
             email,
             phone: '',
             passwordHash: '',
             createdAt: new Date().toISOString()
        };
        setCurrentClient(client);
        localStorage.setItem('nexsched_client', JSON.stringify(client));
     } else {
        const user = users.find(u => u.email === email) || {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0],
            email,
            phone: '',
            role,
            companyId: role === UserRole.COMPANY_ADMIN ? 'c1' : undefined // Assign demo company
        };
        setCurrentUser(user);
        localStorage.setItem('nexsched_user', JSON.stringify(user));
     }
     setIsLoadingAuth(false);
  };

  const logout = () => {
    localStorage.removeItem('nexsched_user');
    setCurrentUser(null);
    setCurrentClient(null);
    window.location.href = "/";
  };

  const clientLogout = () => {
    localStorage.removeItem('nexsched_client');
    setCurrentClient(null);
    logout();
  };

  const addAppointment = (appt: Appointment) => {
    setAppointments(prev => [...prev, appt]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateWeeklySchedule = (newSchedule: WeeklySchedule) => {
    setWeeklySchedules(prev => {
        const idx = prev.findIndex(s => s.providerId === newSchedule.providerId);
        if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = newSchedule;
            return updated;
        }
        return [...prev, newSchedule];
    });
  };

  const updateDayException = (exception: DayException) => {
    setDayExceptions(prev => {
        const idx = prev.findIndex(e => e.providerId === exception.providerId && e.date === exception.date);
        if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = exception;
            return updated;
        }
        return [...prev, exception];
    });
  };

  const addService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const updateClientProfile = (updatedClient: ClientUser) => {
      setClientUsers(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      setCurrentClient(updatedClient);
      localStorage.setItem('nexsched_client', JSON.stringify(updatedClient));
  }

  return (
    <AppContext.Provider value={{ 
      companies, users, services, appointments, financials, 
      weeklySchedules, dayExceptions, updateWeeklySchedule, updateDayException,
      currentUser, isLoadingAuth, login, logout, addAppointment, updateAppointmentStatus,
      addService, deleteService,
      clientUsers, currentClient, clientLogout, updateClientProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const translateStatus = (status: AppointmentStatus) => {
  const map: Record<string, string> = {
    [AppointmentStatus.PENDING]: 'Pendente',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.EN_ROUTE]: 'A Caminho',
    [AppointmentStatus.IN_PROGRESS]: 'Em Andamento',
    [AppointmentStatus.COMPLETED]: 'Concluído',
    [AppointmentStatus.CANCELLED]: 'Cancelado'
  };
  return map[status] || status;
};

// --- COMPONENTS ---

const Layout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { currentUser, logout, companies } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentCompany = companies.find(c => c.id === currentUser?.companyId);
  const appTitle = currentUser?.role === UserRole.MASTER_ADMIN ? "NexSched Master" : (currentCompany?.name || "NexSched");

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <Link 
      to={to} 
      className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg mb-1"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800">
             <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-lg">N</span>
                </div>
                {currentUser?.role === UserRole.MASTER_ADMIN ? 'MASTER' : 'SAAS'}
             </h1>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {currentUser?.role === UserRole.MASTER_ADMIN ? (
              <>
                <NavItem to="/master" icon={LayoutDashboard} label="Visão Geral" />
                <NavItem to="/master/companies" icon={Briefcase} label="Empresas" />
                <NavItem to="/master/finance" icon={DollarSign} label="Financeiro Global" />
              </>
            ) : (
              <>
                <NavItem to="/admin" icon={LayoutDashboard} label="Painel" />
                <NavItem to="/admin/calendar" icon={Calendar} label="Disponibilidade" />
                <NavItem to="/admin/appointments" icon={CheckCircle} label="Agendamentos" />
                <NavItem to="/admin/services" icon={Scissors} label="Serviços" />
                <NavItem to="/admin/clients" icon={Users} label="Clientes" />
                <NavItem to="/admin/share" icon={Share2} label="Link Agendamento" />
                <NavItem to="/admin/finance" icon={DollarSign} label="Financeiro" />
                <NavItem to="/admin/settings" icon={Settings} label="Configurações" />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser?.role === UserRole.MASTER_ADMIN ? 'Admin Master' : 'Admin Empresa'}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center space-x-2 text-slate-400 hover:text-white w-full">
              <LogOut size={16} />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
           <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
           <h2 className="text-xl font-semibold text-slate-800 ml-2 md:ml-0">{title || appTitle}</h2>
           <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                 <Settings size={16} />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const ClientLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
    const { currentClient, clientLogout } = useApp();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
    const NavItem = ({ to, icon: Icon, label }: any) => (
      <Link 
        to={to} 
        className="flex items-center space-x-3 px-4 py-3 text-green-100 hover:bg-green-800 hover:text-white transition-colors rounded-lg mb-1"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-white transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-green-800">
               <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
                  <div className="w-8 h-8 bg-white text-green-900 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-lg">C</span>
                  </div>
                  Área do Cliente
               </h1>
            </div>
  
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <NavItem to="/client/panel" icon={LayoutDashboard} label="Painel" />
                <NavItem to="/client/agendar" icon={Calendar} label="Novo Agendamento" />
                <NavItem to="/client/agendamentos" icon={CalendarCheck} label="Meus Agendamentos" />
                <NavItem to="/client/meus-dados" icon={UserIcon} label="Meus Dados" />
            </nav>
  
            <div className="p-4 border-t border-green-800">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold">
                  {currentClient?.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{currentClient?.name}</p>
                  <p className="text-xs text-green-300">Cliente</p>
                </div>
              </div>
              <button onClick={() => { clientLogout(); navigate('/'); }} className="flex items-center space-x-2 text-green-300 hover:text-white w-full">
                <LogOut size={16} />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </aside>
  
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
             <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               {isMobileMenuOpen ? <X /> : <Menu />}
             </button>
             <h2 className="text-xl font-semibold text-slate-800 ml-2 md:ml-0">{title || "Painel do Cliente"}</h2>
             <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                   <UserIcon size={16} />
                </div>
             </div>
          </header>
  
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  };

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {trend && <p className="text-xs text-green-600 mt-4 flex items-center">↑ {trend} desde o mês passado</p>}
  </div>
);

const CompanyDashboard: React.FC = () => {
  const { appointments, financials, currentUser } = useApp();
  const navigate = useNavigate();
  
  const myAppts = appointments.filter(a => a.companyId === currentUser?.companyId);
  const myFin = financials.filter(f => f.companyId === currentUser?.companyId);
  
  const pendingCount = myAppts.filter(a => a.status === AppointmentStatus.PENDING).length;
  const revenue = myFin.filter(f => f.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Agendamentos" value={myAppts.length} icon={Calendar} color="bg-blue-500" trend="12%" />
        <StatCard title="Solicitações Pendentes" value={pendingCount} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Receita Total" value={`R$ ${revenue}`} icon={DollarSign} color="bg-green-500" trend="8%" />
        <StatCard title="Novos Clientes" value="14" icon={Users} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Visão Geral de Receita</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={[
                {name: 'Seg', amt: 400}, {name: 'Ter', amt: 300}, {name: 'Qua', amt: 550},
                {name: 'Qui', amt: 450}, {name: 'Sex', amt: 700}, {name: 'Sáb', amt: 800},
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ReTooltip />
                <Bar dataKey="amt" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-semibold mb-4 text-slate-800">Ações Rápidas</h3>
           <div className="space-y-3">
             <button onClick={() => navigate('/admin/appointments')} className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center justify-center">
               <Plus size={16} className="mr-2"/> Novo Agendamento
             </button>
             <button className="w-full py-2 px-4 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm flex items-center justify-center">
               Criar Evento
             </button>
             <button onClick={() => navigate('/admin/services')} className="w-full py-2 px-4 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm flex items-center justify-center">
               Gerenciar Serviços
             </button>
           </div>
           
           <h3 className="text-lg font-semibold mt-8 mb-4 text-slate-800">Atividade Recente</h3>
           <ul className="space-y-4">
             {myAppts.slice(0, 3).map(appt => (
               <li key={appt.id} className="flex items-center text-sm">
                 <div className={`w-2 h-2 rounded-full mr-3 ${appt.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                 <div className="flex-1">
                   <p className="font-medium text-slate-700">{appt.clientName}</p>
                   <p className="text-slate-400 text-xs">{new Date(appt.start).toLocaleDateString('pt-BR')}</p>
                 </div>
                 <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-500">{translateStatus(appt.status)}</span>
               </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
    const { appointments, currentClient } = useApp();
    const navigate = useNavigate();

    const myAppts = appointments.filter(a => a.clientId === currentClient?.id);
    const upcoming = myAppts.filter(a => new Date(a.start) > new Date()).length;
    
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-3xl font-bold mb-2">Olá, {currentClient?.name}!</h2>
                <p className="opacity-90">Bem-vindo ao seu painel pessoal.</p>
                <div className="mt-6 flex space-x-4">
                    <button onClick={() => navigate('/client/agendar')} className="bg-white text-green-700 px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-green-50">
                        Agendar Horário
                    </button>
                    <button onClick={() => navigate('/client/agendamentos')} className="bg-green-700 bg-opacity-40 text-white px-6 py-2 rounded-lg font-bold border border-white border-opacity-20 hover:bg-opacity-60">
                        Meus Agendamentos
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <CalendarCheck size={20} className="mr-2 text-green-500"/>
                        Resumo
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg text-center">
                            <span className="block text-2xl font-bold text-slate-800">{upcoming}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold">Próximos</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg text-center">
                            <span className="block text-2xl font-bold text-slate-800">{myAppts.length}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold">Total (Histórico)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-4">Próximo Compromisso</h3>
                     {upcoming > 0 ? (
                         (() => {
                            const next = myAppts.filter(a => new Date(a.start) > new Date()).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];
                            return (
                                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                    <p className="font-bold text-green-900">{new Date(next.start).toLocaleDateString('pt-BR')} às {new Date(next.start).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                                    <p className="text-green-700 text-sm mt-1">{next.serviceId} (Nome do serviço aqui)</p>
                                    <span className="inline-block mt-3 px-2 py-1 bg-green-200 text-green-800 text-xs rounded font-bold">{translateStatus(next.status)}</span>
                                </div>
                            );
                         })()
                     ) : (
                         <div className="text-slate-400 text-center py-4">Nenhum agendamento futuro.</div>
                     )}
                </div>
            </div>
        </div>
    );
};

const ClientAppointmentsView: React.FC = () => {
    const { appointments, currentClient, services, companies } = useApp();
    const myAppts = appointments.filter(a => a.clientId === currentClient?.id).sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    const getServiceName = (id: string) => services.find(s => s.id === id)?.name || id;
    const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || id;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                 <h3 className="font-bold text-slate-800">Meus Agendamentos</h3>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Empresa</th>
                        <th className="px-6 py-4">Serviço</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {myAppts.length > 0 ? myAppts.map(appt => (
                        <tr key={appt.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">
                                {new Date(appt.start).toLocaleDateString('pt-BR')} <br/>
                                <span className="text-slate-400 font-normal">{new Date(appt.start).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{getCompanyName(appt.companyId)}</td>
                            <td className="px-6 py-4 text-slate-600">{getServiceName(appt.serviceId)}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold 
                                    ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                                    appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {translateStatus(appt.status)}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Você ainda não possui agendamentos.</td></tr>
                    )}
                </tbody>
             </table>
        </div>
    );
};

const ClientProfile: React.FC = () => {
    const { currentClient, updateClientProfile } = useApp();
    const [formData, setFormData] = useState({
        name: currentClient?.name || '',
        email: currentClient?.email || '',
        phone: currentClient?.phone || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentClient) {
            updateClientProfile({
                ...currentClient,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            alert("Dados atualizados com sucesso!");
        }
    }

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Meus Dados</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border rounded-lg p-2.5"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full border rounded-lg p-2.5 bg-slate-50"
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full border rounded-lg p-2.5"
                    />
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
};

const ServicesView: React.FC = () => {
    const { services, currentUser, addService, deleteService } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newService, setNewService] = useState({
        name: '',
        durationMinutes: 30,
        price: 0
    });

    const myServices = services.filter(s => s.companyId === currentUser?.companyId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.companyId) return;

        const service: Service = {
            id: `srv_${Date.now()}`,
            companyId: currentUser.companyId,
            name: newService.name,
            durationMinutes: Number(newService.durationMinutes),
            price: Number(newService.price),
            color: '#3b82f6'
        };

        addService(service);
        setIsModalOpen(false);
        setNewService({ name: '', durationMinutes: 30, price: 0 });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Meus Serviços</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm"
                >
                    <Plus size={16} className="mr-2"/> Adicionar Serviço
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myServices.map(service => (
                    <div key={service.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600`}>
                                    <Scissors size={20} />
                                </div>
                                <button onClick={() => deleteService(service.id)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{service.name}</h3>
                            <p className="text-slate-500 text-sm flex items-center">
                                <Clock size={14} className="mr-1"/> {service.durationMinutes} minutos
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Preço</span>
                            <span className="text-lg font-bold text-slate-800">R$ {service.price}</span>
                        </div>
                    </div>
                ))}
                
                {myServices.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-500">Nenhum serviço cadastrado ainda.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-medium mt-2 hover:underline">
                            Cadastrar primeiro serviço
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Novo Serviço</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Corte de Cabelo"
                                    value={newService.name}
                                    onChange={e => setNewService({...newService, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="30"
                                        value={newService.durationMinutes}
                                        onChange={e => setNewService({...newService, durationMinutes: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="0.00"
                                        value={newService.price}
                                        onChange={e => setNewService({...newService, price: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                                    Salvar Serviço
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarView: React.FC = () => {
    return (
        <div className="text-center p-8 bg-white rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-700">Disponibilidade</h3>
            <p className="text-slate-500 mt-2">Visualize e gerencie seus horários aqui.</p>
            <div className="mt-6 border rounded-lg p-4 bg-slate-50">
               <p className="text-sm text-slate-400">Calendário interativo (Mock)</p>
            </div>
        </div>
    );
};

const AppointmentsView: React.FC = () => {
  const { appointments, updateAppointmentStatus, currentUser, companies } = useApp();
  const myAppts = appointments.filter(a => a.companyId === currentUser?.companyId);

  const handleStatus = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
  };
  
  const generateMessage = async (appt: Appointment) => {
      const company = companies.find(c => c.id === appt.companyId);
      if(company) {
          const msg = await generateWhatsAppMessage(appt, company.name);
          alert(msg);
      }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Agendamentos</h3>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
                <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Serviço/Data</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {myAppts.map(appt => (
                    <tr key={appt.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">{appt.clientName}</p>
                            <p className="text-slate-400 text-xs">{appt.clientPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-slate-800">{appt.serviceId}</p>
                            <p className="text-slate-400 text-xs">{new Date(appt.start).toLocaleString('pt-BR')}</p>
                        </td>
                        <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded text-xs font-semibold 
                                ${appt.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 
                                appt.status === AppointmentStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                {translateStatus(appt.status)}
                            </span>
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                             <button onClick={() => handleStatus(appt.id, AppointmentStatus.CONFIRMED)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirmar"><Check size={18}/></button>
                             <button onClick={() => handleStatus(appt.id, AppointmentStatus.CANCELLED)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancelar"><X size={18}/></button>
                             <button onClick={() => generateMessage(appt)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Gerar Msg WhatsApp (OpenAI)"><MessageCircle size={18}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

const FinanceView: React.FC = () => {
  const { financials, currentUser } = useApp();
  const myFin = financials.filter(f => f.companyId === currentUser?.companyId);
  const [analysis, setAnalysis] = useState('');
  
  const handleAnalyze = async () => {
      setAnalysis("Analisando com OpenAI (gpt-4o-mini)...");
      const result = await analyzeFinancials(myFin);
      setAnalysis(result);
  }

  return (
      <div className="space-y-6">
          <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-800">Financeiro</h2>
               <button onClick={handleAnalyze} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                   <Lightbulb size={16} className="mr-2"/> Analisar com IA
               </button>
          </div>
          {analysis && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-purple-900 text-sm whitespace-pre-wrap">
                  {analysis}
              </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                      <tr>
                          <th className="px-6 py-4">Descrição</th>
                          <th className="px-6 py-4">Data</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {myFin.map(rec => (
                          <tr key={rec.id}>
                              <td className="px-6 py-4 font-medium text-slate-700">{rec.description}</td>
                              <td className="px-6 py-4 text-slate-500">{new Date(rec.date).toLocaleDateString('pt-BR')}</td>
                              <td className={`px-6 py-4 text-right font-bold ${rec.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                  {rec.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(rec.amount).toFixed(2)}
                              </td>
                          </tr>
                      ))}
                  </tbody>
               </table>
          </div>
      </div>
  );
};

const ClientsView: React.FC = () => {
    return <div className="p-8 text-center text-slate-500">Gestão de Clientes (Em Breve)</div>;
}

const SettingsView: React.FC = () => {
    return <div className="p-8 text-center text-slate-500">Configurações da Empresa (Em Breve)</div>;
}

const ShareLinkView: React.FC = () => {
    const { currentUser, companies } = useApp();
    const company = companies.find(c => c.id === currentUser?.companyId);
    const link = `${window.location.origin}/#/schedule/${company?.slug}`;

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Link de Agendamento</h2>
            <p className="text-slate-500 mb-6">Compartilhe este link com seus clientes.</p>
            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input readOnly value={link} className="flex-1 bg-transparent outline-none text-slate-600 text-sm"/>
                <button onClick={() => navigator.clipboard.writeText(link)} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                    <Copy size={18}/>
                </button>
                <a href={link} target="_blank" rel="noreferrer" className="p-2 text-slate-600 hover:bg-slate-200 rounded">
                    <ExternalLink size={18}/>
                </a>
            </div>
        </div>
    );
}

const PublicBooking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { companies, services, addAppointment } = useApp();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [step, setStep] = useState(1);

  const company = companies.find(c => c.slug === slug);
  const companyServices = services.filter(s => s.companyId === company?.id);

  if (!company) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Empresa não encontrada.</div>;
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const newAppt: Appointment = {
      id: `apt_${Date.now()}`,
      companyId: company.id,
      serviceId: selectedService.id,
      providerId: 'u3', // Mock
      clientId: 'guest',
      clientName,
      clientPhone,
      start: new Date(selectedDate).toISOString(),
      end: new Date(new Date(selectedDate).getTime() + selectedService.durationMinutes * 60000).toISOString(),
      status: AppointmentStatus.PENDING
    };

    addAppointment(newAppt);
    setStep(3);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4`}>
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
        <div className={`p-6 text-white text-center bg-${company.themeColor === 'blue' ? 'blue-600' : 'slate-800'}`}>
           <h1 className="text-2xl font-bold">{company.name}</h1>
           <p className="opacity-90 text-sm mt-1">Agendamento Online</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Selecione um Serviço</h2>
              {companyServices.map(service => (
                <button 
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition group"
                >
                   <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700 group-hover:text-blue-700">{service.name}</span>
                      <span className="font-semibold text-slate-900">R$ {service.price}</span>
                   </div>
                   <span className="text-xs text-slate-500">{service.durationMinutes} min</span>
                </button>
              ))}
              {companyServices.length === 0 && <p className="text-slate-500 text-center">Nenhum serviço disponível.</p>}
            </div>
          )}

          {step === 2 && selectedService && (
             <form onSubmit={handleBooking} className="space-y-4">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-800 mb-2 flex items-center">
                  <ChevronLeft size={16}/> Voltar
                </button>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                   <p className="font-bold text-slate-800">{selectedService.name}</p>
                   <p className="text-xs text-slate-500">{selectedService.durationMinutes} min • R$ {selectedService.price}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data e Hora</label>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full border rounded-lg p-2"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome</label>
                   <input required type="text" className="w-full border rounded-lg p-2" value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Seu Telefone</label>
                   <input required type="tel" className="w-full border rounded-lg p-2" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                </div>

                <button type="submit" className={`w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:opacity-90`}>
                   Confirmar Agendamento
                </button>
             </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Check size={32} />
               </div>
               <h2 className="text-xl font-bold text-slate-800 mb-2">Agendamento Solicitado!</h2>
               <p className="text-slate-600 text-sm">A empresa entrará em contato para confirmar.</p>
               <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-medium hover:underline">
                 Fazer novo agendamento
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthGuard: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
    const { currentUser, currentClient, isLoadingAuth } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoadingAuth) {
            if (!currentUser && !currentClient) {
                navigate('/auth');
                return;
            }
            
            if (allowedRoles && currentUser) {
                if (!allowedRoles.includes(currentUser.role)) {
                    if (currentUser.role === UserRole.MASTER_ADMIN) navigate('/master');
                    else if (currentUser.role === UserRole.COMPANY_ADMIN) navigate('/admin');
                }
            }
        }
    }, [currentUser, currentClient, isLoadingAuth, allowedRoles, navigate]);

    if (isLoadingAuth) {
        return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;
    }

    return <>{children}</>;
};

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="z-10 text-center max-w-2xl px-4">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-8 shadow-2xl">
                    <Calendar size={48} className="text-white" />
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">NexSched</h1>
                <p className="text-slate-400 text-xl mb-12">A Plataforma Definitiva de Agendamento Multiempresa com IA (OpenAI Powered)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mx-auto">
                    <button 
                        onClick={() => navigate('/auth', { state: { role: UserRole.COMPANY_ADMIN } })}
                        className="group relative p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition border border-slate-700 hover:border-blue-500 text-left"
                    >
                        <Briefcase className="text-blue-500 mb-3" size={24}/>
                        <h3 className="text-lg font-bold text-white mb-1">Login Empresa</h3>
                        <p className="text-xs text-slate-400">Gerencie seu negócio.</p>
                    </button>
                    
                    <button 
                         onClick={() => navigate('/auth', { state: { role: UserRole.MASTER_ADMIN } })}
                         className="group relative p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition border border-slate-700 hover:border-purple-500 text-left"
                    >
                        <Settings className="text-purple-500 mb-3" size={24}/>
                        <h3 className="text-lg font-bold text-white mb-1">Admin Master</h3>
                        <p className="text-xs text-slate-400">Controle da plataforma.</p>
                    </button>

                    <Link 
                        to="/auth" 
                        state={{ role: UserRole.CLIENT }}
                        className="group relative p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition border border-slate-700 hover:border-green-500 text-left block"
                    >
                        <UserIcon className="text-green-500 mb-3" size={24}/>
                        <h3 className="text-lg font-bold text-white mb-1">SOU CLIENTE</h3>
                        <p className="text-xs text-slate-400">Acessar agendamentos.</p>
                    </Link>
                </div>

                <div className="mt-12 text-sm text-slate-500">
                    <p className="mb-2">Links de Demonstração (Público):</p>
                    <Link to="/schedule/tech-health" className="text-blue-400 hover:underline mx-2">Agendar na Clínica TechHealth</Link>
                    <Link to="/schedule/elite-barber" className="text-blue-400 hover:underline mx-2">Agendar na Barbearia Elite</Link>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppProvider>
        <AuthRedirectHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/auth" element={<AuthPageWrapper />} />
          <Route path="/login" element={<AuthPageWrapper />} />
          <Route path="/client/login" element={<AuthPageWrapper mode="login" role={UserRole.CLIENT} />} />
          
          <Route path="/schedule/:slug" element={<PublicBooking />} />

          <Route path="/admin" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Painel"><CompanyDashboard /></Layout></AuthGuard>} />
          <Route path="/admin/calendar" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Disponibilidade"><CalendarView /></Layout></AuthGuard>} />
          <Route path="/admin/appointments" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Agendamentos"><AppointmentsView /></Layout></AuthGuard>} />
          <Route path="/admin/services" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Serviços"><ServicesView /></Layout></AuthGuard>} />
          <Route path="/admin/clients" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Clientes"><ClientsView /></Layout></AuthGuard>} />
          <Route path="/admin/share" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Link Público"><ShareLinkView /></Layout></AuthGuard>} />
          <Route path="/admin/finance" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Financeiro"><FinanceView /></Layout></AuthGuard>} />
          <Route path="/admin/settings" element={<AuthGuard allowedRoles={[UserRole.COMPANY_ADMIN]}><Layout title="Configurações"><SettingsView /></Layout></AuthGuard>} />
          
          <Route path="/master" element={<AuthGuard allowedRoles={[UserRole.MASTER_ADMIN]}><Layout title="Visão Geral Master"><div className="p-8 text-center text-slate-500">Painel Master em Desenvolvimento</div></Layout></AuthGuard>} />
          <Route path="/master/companies" element={<AuthGuard allowedRoles={[UserRole.MASTER_ADMIN]}><Layout title="Empresas"><div className="p-8 text-center text-slate-500">Gestão de Empresas</div></Layout></AuthGuard>} />
          <Route path="/master/finance" element={<AuthGuard allowedRoles={[UserRole.MASTER_ADMIN]}><Layout title="Financeiro Global"><div className="p-8 text-center text-slate-500">Financeiro Global</div></Layout></AuthGuard>} />
        
          <Route path="/client/panel" element={<AuthGuard allowedRoles={[UserRole.CLIENT]}><ClientLayout><ClientDashboard /></ClientLayout></AuthGuard>} />
          <Route path="/client/agendamentos" element={<AuthGuard allowedRoles={[UserRole.CLIENT]}><ClientLayout><ClientAppointmentsView /></ClientLayout></AuthGuard>} />
          <Route path="/client/meus-dados" element={<AuthGuard allowedRoles={[UserRole.CLIENT]}><ClientLayout><ClientProfile /></ClientLayout></AuthGuard>} />
          <Route path="/client/agendar" element={<AuthGuard allowedRoles={[UserRole.CLIENT]}><ClientLayout><div className="text-center p-8">Selecione uma empresa através do link público dela para agendar.</div></ClientLayout></AuthGuard>} />
        </Routes>
      </AppProvider>
    </HashRouter>
  );
};

const AuthRedirectHandler = () => {
    const { currentUser, currentClient, isLoadingAuth } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoadingAuth && (location.pathname === '/auth' || location.pathname === '/login')) {
            if (currentUser) {
                if (currentUser.role === UserRole.MASTER_ADMIN) navigate('/master');
                else navigate('/admin');
            } else if (currentClient) {
                navigate('/client/panel');
            }
        }
    }, [currentUser, currentClient, isLoadingAuth, navigate, location]);

    return null;
};

const AuthPageWrapper = ({ mode, role }: { mode?: 'login'|'register', role?: UserRole }) => {
    const location = useLocation();
    const stateRole = location.state?.role;
    const { login } = useApp();
    
    return <AuthView 
              initialMode={mode || 'login'} 
              forcedRole={role || stateRole} 
              onLoginSuccess={(email, role) => login(email, role)}
           />;
};

export default App;