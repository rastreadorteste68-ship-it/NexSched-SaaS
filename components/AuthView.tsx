import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Loader2, Briefcase } from 'lucide-react';
import { UserRole } from '../types';
import { MOCK_USERS, MOCK_CLIENT_USERS } from '../constants';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  forcedRole?: UserRole; // If user enters via specific route
  onLoginSuccess: (email: string, role: UserRole) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', forcedRole, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(forcedRole || UserRole.CLIENT);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (mode === 'login') {
        // MOCK LOGIN LOGIC
        // In a real app with OpenAI backend, this would call your API Route
        
        let userFound = MOCK_USERS.find(u => u.email === email);
        let clientFound = MOCK_CLIENT_USERS.find(u => u.email === email);

        if (userFound) {
           // Password check skipped for mock (accept any password for demo)
           onLoginSuccess(userFound.email, userFound.role);
        } else if (clientFound) {
           onLoginSuccess(clientFound.email, UserRole.CLIENT);
        } else {
           // For demo purposes, if user doesn't exist in mock constants, we allow login if it looks like a valid format
           // treating it as a new session
           if (email.includes('@')) {
              onLoginSuccess(email, role); 
           } else {
              throw new Error("Usuário não encontrado.");
           }
        }

      } else {
        // MOCK REGISTER LOGIC
        onLoginSuccess(email, role);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10">
          <div className="p-8 pb-0 text-center">
             <h2 className="text-3xl font-bold text-slate-800 mb-2">
               {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
             </h2>
             <p className="text-slate-500">
               {mode === 'login' ? 'Acesse sua conta para continuar' : 'Comece a usar o NexSched hoje'}
             </p>
          </div>

          <form onSubmit={handleAuth} className="p-8 space-y-4">
             {error && (
               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
                 {error}
               </div>
             )}

             {mode === 'register' && (
                <div className="space-y-4">
                   <div className="relative">
                      <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Nome Completo"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                   </div>

                   {/* Role Selection (Only show if not forced) */}
                   {!forcedRole && (
                     <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => setRole(UserRole.CLIENT)}
                          className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 ${role === UserRole.CLIENT ? 'bg-green-50 border-green-500 text-green-700' : 'border-slate-200 text-slate-500'}`}
                        >
                          <UserIcon size={16}/> Cliente
                        </button>
                        <button 
                          type="button"
                          onClick={() => setRole(UserRole.COMPANY_ADMIN)}
                          className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 ${role === UserRole.COMPANY_ADMIN ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                        >
                          <Briefcase size={16}/> Empresa
                        </button>
                     </div>
                   )}
                </div>
             )}

             <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  required
                  type="email" 
                  placeholder="Seu e-mail"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
             </div>

             <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  required
                  type="password" 
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition flex items-center justify-center"
             >
               {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
             </button>
          </form>

          <div className="bg-slate-50 p-4 text-center text-sm border-t border-slate-100">
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <button onClick={() => setMode('register')} className="text-blue-600 font-bold hover:underline">
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button onClick={() => setMode('login')} className="text-blue-600 font-bold hover:underline">
                  Faça Login
                </button>
              </>
            )}
          </div>
       </div>
    </div>
  );
};