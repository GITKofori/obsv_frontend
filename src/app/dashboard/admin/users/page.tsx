'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { useAuth } from '@/components/layout/providers';
import { UsersTable } from '@/features/users/components/users-table';
import { InviteUserSheet } from '@/features/users/components/invite-user-sheet';
import type { UserListItem, Municipio, PaginatedResponse } from 'types/pmac';

export default function AdminUsersPage() {
  const { appUser } = useAuth();
  const supabase = createBrowserSupabase();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [municipioFilter, setMunicipioFilter] = useState('all');

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const fetchUsers = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };

      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (estadoFilter !== 'all') params.set('estado', estadoFilter);
      if (municipioFilter !== 'all') params.set('municipio', municipioFilter);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users?${params}`,
        { headers }
      );
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: PaginatedResponse<UserListItem> = await res.json();
      setUsers(data.data);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  }, [supabase, page, limit, search, roleFilter, estadoFilter, municipioFilter]);

  const fetchMunicipios = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/municipios`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (res.ok) setMunicipios(await res.json());
    } catch { /* ignore */ }
  }, [supabase]);

  useEffect(() => {
    if (!appUser) return;
    fetchUsers();
    fetchMunicipios();
  }, [fetchUsers, fetchMunicipios, appUser]);

  if (appUser && appUser.role !== 'cimat_admin') {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-20'>
          <ShieldX className='h-16 w-16 text-red-400' />
          <h2 className='mt-4 text-xl font-bold'>Acesso Restrito</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Esta pagina esta reservada a administradores CIMAT.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Users className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-bold tracking-tight'>Utilizadores</h2>
          </div>
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Convidar
          </Button>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Input
            placeholder='Pesquisar por nome ou email...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-xs'
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Perfil' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os perfis</SelectItem>
              <SelectItem value='cimat_admin'>Admin CIMAT</SelectItem>
              <SelectItem value='tecnico_municipal'>Tecnico Municipal</SelectItem>
              <SelectItem value='parceiro_externo'>Parceiro Externo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os estados</SelectItem>
              <SelectItem value='ativo'>Ativo</SelectItem>
              <SelectItem value='convidado'>Convidado</SelectItem>
              <SelectItem value='desativado'>Desativado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={municipioFilter} onValueChange={setMunicipioFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Municipio' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os municipios</SelectItem>
              {municipios.filter((m) => m.id !== 7).map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        ) : (
          <UsersTable data={users} total={total} onRefresh={fetchUsers} />
        )}
      </div>

      <InviteUserSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={fetchUsers}
        municipios={municipios}
      />
    </PageContainer>
  );
}
