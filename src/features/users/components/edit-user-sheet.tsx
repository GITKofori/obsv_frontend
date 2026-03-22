'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { useAuth } from '@/components/layout/providers';
import type { UserListItem } from 'types/pmac';

interface EditUserSheetProps {
  user: UserListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserSheet({ user, open, onOpenChange, onSuccess }: EditUserSheetProps) {
  const { appUser } = useAuth();
  const supabase = createBrowserSupabase();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState(user.nome || '');
  const [role, setRole] = useState(user.role);
  const [fkMunicipio, setFkMunicipio] = useState(user.fk_municipio ? String(user.fk_municipio) : '');
  const [municipios, setMunicipios] = useState<{ id: number; nome: string }[]>([]);

  const isAdmin = appUser?.role === 'cimat_admin';

  useEffect(() => {
    if (!open || !isAdmin) return;
    async function fetch_m() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/municipios`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        if (res.ok) setMunicipios(await res.json());
      } catch { /* ignore */ }
    }
    fetch_m();
  }, [open, isAdmin, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const body: Record<string, any> = { nome, role };
      if (isAdmin) {
        body.fk_municipio = role === 'cimat_admin' ? null : parseInt(fkMunicipio, 10);
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success('Utilizador atualizado');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Utilizador</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <div className='space-y-2'>
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-nome'>Nome</Label>
            <Input
              id='edit-nome'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          {isAdmin && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='edit-role'>Perfil</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='cimat_admin'>Admin CIMAT</SelectItem>
                    <SelectItem value='tecnico_municipal'>Tecnico Municipal</SelectItem>
                    <SelectItem value='parceiro_externo'>Parceiro Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role !== 'cimat_admin' && (
                <div className='space-y-2'>
                  <Label htmlFor='edit-municipio'>Municipio</Label>
                  <Select value={fkMunicipio} onValueChange={setFkMunicipio}>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecionar municipio' />
                    </SelectTrigger>
                    <SelectContent>
                      {municipios.filter((m) => m.id !== 7).map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'A guardar...' : 'Guardar'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
