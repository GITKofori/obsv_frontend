// components/layout/providers.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import ThemeProvider from './ThemeToggle/theme-provider';
import { createBrowserSupabase } from '@/utils/supabase/client';

// Contexto de autenticação Supabase
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

// Hook para usar o contexto de auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider combinado (Auth + Theme)
interface ProvidersProps {
  children: React.ReactNode;
  user: User | null; // Vem do layout server-side
}

export default function Providers({
  children,
  user: initialUser
}: ProvidersProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    // Listener para mudanças de autenticação
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
