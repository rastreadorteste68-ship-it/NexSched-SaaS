
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Loader2, Briefcase, Settings } from 'lucide-react';
import { UserRole } from '../types';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  forcedRole?: UserRole; // If user enters via specific route
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', forcedRole }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(forcedRole || UserRole.CLIENT);
  
  // Registration specific: Company Name (if creating a company admin)
  const [companyName, setCompanyName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        // Redirect logic is handled by AppProvider onAuthStateChange, 
        // but we can force a check or navigation here if needed.
        // The AppProvider will detect the session change and route accordingly.

      } else {
        // REGISTER
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // Insert into Profiles
          // NOTE: In a real app, use a Database Trigger for security. 
          // Here we do client-side insertion as requested.
          
          const profileData = {
            id: data.user.id,
            email: email,
            name: name,
            role: role,
            company_id: role === UserRole.COMPANY_ADMIN ? `comp_${Date.now()}` : null // Generate a mock ID or handle company creation properly
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (profileError) {
             // Rollback or warn
             console.error("Profile creation failed", profileError);
             throw new Error("Erro ao criar perfil de usuário.");
          }

          if (role === UserRole.COMPANY_ADMIN) {
             // Create company entry if needed (Mocking this step for now as it usually requires a separate flow)
          }
        }
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
