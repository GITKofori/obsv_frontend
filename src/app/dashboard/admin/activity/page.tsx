'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Activity, ShieldX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { useAuth } from '@/components/layout/providers';
import { format } from 'date-fns';

interface AuditEntry {
  id: number;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  'user.invited': 'Utilizador convidado',
  'user.activated': 'Conta ativada',
  'user.edited': 'Utilizador editado',
  'user.deactivated': 'Utilizador desativado',
  'user.reactivated': 'Utilizador reativado',
  'user.invite_resent': 'Convite reenviado',
  'user.password_reset': 'Reset de password',
  'execucao.submitted': 'Execucao submetida',
  'execucao.approved': 'Execucao aprovada',
  'execucao.rejected': 'Execucao rejeitada',
};

export default function ActivityPage() {
  const { appUser } = useAuth();
  const supabase = createBrowserSupabase();
  const searchParams = useSearchParams();

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 50;

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users/activity?${params}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch activity');
      const data = await res.json();
      setEntries(data.data);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar atividade');
    } finally {
      setLoading(false);
    }
  }, [supabase, page, from, to]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  if (appUser && !['cimat_admin', 'tecnico_municipal'].includes(appUser.role)) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-20'>
          <ShieldX className='h-16 w-16 text-red-400' />
          <h2 className='mt-4 text-xl font-bold'>Acesso Restrito</h2>
        </div>
      </PageContainer>
    );
  }

  const pageCount = Math.ceil(total / limit);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center gap-3'>
          <Activity className='h-6 w-6 text-primary' />
          <h2 className='text-2xl font-bold tracking-tight'>Registo de Atividade</h2>
        </div>

        <div className='flex flex-wrap gap-4'>
          <div className='space-y-1'>
            <Label htmlFor='from'>De</Label>
            <Input
              id='from'
              type='date'
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className='w-[160px]'
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='to'>Ate</Label>
            <Input
              id='to'
              type='date'
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className='w-[160px]'
            />
          </div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        ) : (
          <>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ator</TableHead>
                    <TableHead>Acao</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='h-24 text-center'>
                        Sem registos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className='whitespace-nowrap'>
                          {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>{entry.actor_email}</TableCell>
                        <TableCell>
                          {actionLabels[entry.action] ?? entry.action}
                        </TableCell>
                        <TableCell className='max-w-xs truncate text-xs text-muted-foreground'>
                          {entry.details ? JSON.stringify(entry.details) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className='flex items-center justify-end gap-2 py-2'>
              <span className='text-sm text-muted-foreground'>
                Pagina {page} de {pageCount || 1}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => window.location.search = `?page=${page - 1}`}
              >
                <ChevronLeftIcon className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= pageCount}
                onClick={() => window.location.search = `?page=${page + 1}`}
              >
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
