'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { ValidacaoPendentes, UserRole } from 'types/pmac';
import { PendentesList } from '@/features/validacao/components/pendentes-list';

export default function ValidacaoPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [pendentes, setPendentes] = useState<ValidacaoPendentes | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createBrowserSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          toast.error('Sessao expirada. Por favor faca login novamente.');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };

        // Check user role first
        const roleRes = await axios.get('/api/protected/dashboard-pmac/user-role', {
          headers,
        });
        const userRole: UserRole = roleRes.data;
        setRole(userRole);

        if (userRole.role !== 'cimat_admin') {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        // Fetch pending items
        const pendentesRes = await axios.get('/api/protected/validacao/pendentes', {
          headers,
        });
        setPendentes(pendentesRes.data);
      } catch (error) {
        console.error('Error fetching validacao data:', error);
        toast.error('Erro ao carregar dados de validacao.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-20'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='mt-4 text-sm text-muted-foreground'>
            A verificar permissoes...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (accessDenied) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-20'>
          <ShieldX className='h-16 w-16 text-red-400' />
          <h2 className='mt-4 text-xl font-bold'>Acesso Restrito</h2>
          <p className='mt-2 text-sm text-muted-foreground text-center max-w-md'>
            Esta pagina esta reservada a administradores CIMAT. O seu perfil
            atual ({role?.role ?? 'desconhecido'}) nao tem permissao para
            aceder a esta funcionalidade.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center gap-3'>
          <ShieldCheck className='h-6 w-6 text-primary' />
          <h2 className='text-2xl font-bold tracking-tight'>
            Validacao CIMAT
          </h2>
        </div>

        {pendentes ? (
          <PendentesList initialData={pendentes} />
        ) : (
          <div className='rounded-lg border border-dashed p-8 text-center'>
            <p className='text-sm text-muted-foreground'>
              Nao foi possivel carregar os dados pendentes.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
