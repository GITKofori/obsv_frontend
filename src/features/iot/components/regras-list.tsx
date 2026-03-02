'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { RegraModal } from './regra-modal';
import { FIELD_META, PARCELA_LABELS, FUNCAO_LABELS } from '../constants';
import type { AlertaRegra } from 'types/pmac';

export function RegrasList() {
  const [regras, setRegras] = useState<AlertaRegra[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AlertaRegra | null>(null);

  const loadRegras = useCallback(async () => {
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/regras`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setRegras(res.data);
    } catch {
      toast.error('Erro ao carregar regras');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegras();
  }, [loadRegras]);

  async function toggleAtivo(regra: AlertaRegra) {
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/regras/${regra.id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setRegras((prev) =>
        prev.map((r) => (r.id === regra.id ? { ...r, ativo: !r.ativo } : r))
      );
    } catch {
      toast.error('Erro ao atualizar regra');
    }
  }

  async function deleteRegra(id: number) {
    if (!confirm('Eliminar esta regra?')) return;
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/regras/${id}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setRegras((prev) => prev.filter((r) => r.id !== id));
      toast.success('Regra eliminada');
    } catch {
      toast.error('Erro ao eliminar regra');
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(regra: AlertaRegra) {
    setEditing(regra);
    setModalOpen(true);
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {regras.length === 0
            ? 'Nenhuma regra definida.'
            : `${regras.filter((r) => r.ativo).length} de ${regras.length} regras ativas`}
        </p>
        <Button size='sm' onClick={openNew} className='gap-1.5'>
          <Plus className='h-4 w-4' />
          Nova Regra
        </Button>
      </div>

      {loading ? (
        <div className='flex justify-center py-8'>
          <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      ) : regras.length === 0 ? (
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            Crie a sua primeira regra de alerta para monitorizar parâmetros críticos.
          </p>
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ativa</TableHead>
                <TableHead className='w-20' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {regras.map((regra) => {
                const fieldLabel = FIELD_META[regra.campo]?.label ?? regra.campo;
                const unit = FIELD_META[regra.campo]?.unit;
                const condition = `${fieldLabel} ${regra.operador} ${regra.valor_threshold}${unit ? ` ${unit}` : ''}`;
                const agregacaoLabel =
                  regra.funcao_agregacao
                    ? `${FUNCAO_LABELS[regra.funcao_agregacao]} / ${regra.intervalo_minutos} min`
                    : null;

                return (
                  <TableRow key={regra.id}>
                    <TableCell className='font-medium'>{regra.nome}</TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {PARCELA_LABELS[regra.parcela] ?? regra.parcela}
                    </TableCell>
                    <TableCell className='text-sm'>
                      <div>{condition}</div>
                      {agregacaoLabel && (
                        <div className='text-xs text-muted-foreground'>{agregacaoLabel}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={regra.tipo === 'instant' ? 'default' : 'secondary'}>
                        {regra.tipo === 'instant' ? 'Instant.' : 'Agregado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={regra.ativo}
                        onCheckedChange={() => toggleAtivo(regra)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7'
                          onClick={() => openEdit(regra)}
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7 text-destructive hover:text-destructive'
                          onClick={() => deleteRegra(regra.id)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <RegraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadRegras}
        editing={editing}
      />
    </div>
  );
}
