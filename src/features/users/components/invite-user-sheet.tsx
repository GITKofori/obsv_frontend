'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import type { Municipio } from 'types/pmac';

interface InviteUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  municipios: Municipio[];
  lockedMunicipio?: number | null;
}

export function InviteUserSheet({
  open,
  onOpenChange,
  onSuccess,
  municipios,
  lockedMunicipio,
}: InviteUserSheetProps) {
  const { appUser } = useAuth();
  const supabase = createBrowserSupabase();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<string>('');
  const [fkMunicipio, setFkMunicipio] = useState<string>(lockedMunicipio ? String(lockedMunicipio) : '');

  useEffect(() => {
    if (lockedMunicipio) setFkMunicipio(String(lockedMunicipio));
  }, [lockedMunicipio]);

  const availableRoles = appUser?.role === 'cimat_admin'
    ? [
        { value: 'cimat_admin', label: 'Admin CIMAT' },
        { value: 'tecnico_municipal', label: 'Tecnico Municipal' },
        { value: 'parceiro_externo', label: 'Parceiro Externo' },
      ]
    : [
        { value: 'tecnico_municipal', label: 'Tecnico Municipal' },
        { value: 'parceiro_externo', label: 'Parceiro Externo' },
      ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !role) {
      toast.error('Email e perfil sao obrigatorios');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/admin/users/invite`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            nome,
            role,
            fk_municipio: role === 'cimat_admin' ? null : parseInt(fkMunicipio, 10),
            medidas_atribuidas: [],
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success('Convite enviado com sucesso');
      setEmail('');
      setNome('');
      setRole('');
      if (!lockedMunicipio) setFkMunicipio('');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Convidar Utilizador</SheetTitle>
          <SheetDescription>
            O utilizador recebera um email com um link para ativar a conta.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='utilizador@exemplo.pt'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='nome'>Nome</Label>
            <Input
              id='nome'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder='Nome completo'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='role'>Perfil</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder='Selecionar perfil' />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role && role !== 'cimat_admin' && (
            <div className='space-y-2'>
              <Label htmlFor='municipio'>Municipio</Label>
              <Select
                value={fkMunicipio}
                onValueChange={setFkMunicipio}
                disabled={!!lockedMunicipio}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecionar municipio' />
                </SelectTrigger>
                <SelectContent>
                  {municipios
                    .filter((m) => m.id !== 7)
                    .map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'A enviar...' : 'Enviar Convite'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
