
import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Mock client to prevent application crash if keys are missing
// This allows the app to fallback to local mock data logic in App.tsx
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: { message: "Supabase não configurado (Modo Demo). Configure VITE_SUPABASE_URL." } }),
    signUp: async () => ({ data: null, error: { message: "Supabase não configurado (Modo Demo)." } }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: { message: "Not configured", code: "NOT_CONFIGURED" } }),
        maybeSingle: async () => ({ data: null, error: null }),
      })
    }),
    insert: async (data: any) => ({ data: null, error: { message: "Modo Demo: Dados não persistem no banco.", code: "NOT_CONFIGURED" } }),
    update: async (data: any) => ({ eq: () => ({ data: null, error: { message: "Modo Demo: Dados não persistem.", code: "NOT_CONFIGURED" } }) }),
  })
};

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase keys missing. App running in Demo Mode with Mock Data.");
}

// Cast mock to any to bypass strict type checks for the full Supabase client surface area
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (mockSupabase as any);
