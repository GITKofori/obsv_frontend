'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppUser } from 'types/pmac';
import ThemeProvider from './ThemeToggle/theme-provider';
import { createBrowserSupabase } from '@/utils/supabase/client';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface ProvidersProps {
  children: React.ReactNode;
  user: User | null;
}

export default function Providers({
  children,
  user: initialUser
}: ProvidersProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabase();

  // Fetch app user role info when user is set
  useEffect(() => {
    async function fetchAppUser() {
      if (!user) {
        setAppUser(null);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/users/me`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        if (res.ok) {
          const data: AppUser = await res.json();
          setAppUser(data);
        }
      } catch {
        // Silently fail — appUser stays null
      }
    }
    fetchAppUser();
  }, [user, supabase]);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, appUser, loading }}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
