'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Mail, KeyRound, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import type { UserListItem } from 'types/pmac';
import { EditUserSheet } from './edit-user-sheet';

interface UserActionsMenuProps {
  user: UserListItem;
  onRefresh: () => void;
}

export function UserActionsMenu({ user, onRefresh }: UserActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const supabase = createBrowserSupabase();

  async function getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session?.access_token}` };
  }

  async function handleResendInvite() {
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users/${user.id}/resend-invite`,
        { method: 'POST', headers }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success('Convite reenviado');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reenviar convite');
    }
  }

  async function handleResetPassword() {
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users/${user.id}/reset-password`,
        { method: 'POST', headers }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success('Email de recuperacao enviado');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar recuperacao');
    }
  }

  async function handleToggleActive() {
    const action = user.estado === 'desativado' ? 'reactivate' : 'deactivate';
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users/${user.id}/${action}`,
        {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success(action === 'deactivate' ? 'Utilizador desativado' : 'Utilizador reativado');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Erro na operacao');
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
          {user.estado === 'convidado' && (
            <DropdownMenuItem onClick={handleResendInvite}>
              <Mail className='mr-2 h-4 w-4' />
              Reenviar convite
            </DropdownMenuItem>
          )}
          {user.estado === 'ativo' && (
            <DropdownMenuItem onClick={handleResetPassword}>
              <KeyRound className='mr-2 h-4 w-4' />
              Reset password
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleActive}>
            {user.estado === 'desativado' ? (
              <>
                <UserCheck className='mr-2 h-4 w-4' />
                Reativar
              </>
            ) : (
              <>
                <UserX className='mr-2 h-4 w-4 text-destructive' />
                <span className='text-destructive'>Desativar</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserSheet
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
