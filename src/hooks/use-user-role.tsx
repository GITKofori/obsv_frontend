'use client';

import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import type { UserRole } from '../../types/pmac';

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const result = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/dashboard-pmac/user-role`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setUserRole(result.data.role ? result.data : null);
      } catch (err) {
        console.error('Failed to fetch user role:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, []);

  return {
    userRole,
    loading,
    isCimatAdmin: userRole?.role === 'cimat_admin',
    isTecnico: userRole?.role === 'tecnico_municipal',
    isParceiro: userRole?.role === 'parceiro_externo',
  };
}
