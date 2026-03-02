'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCheck, RefreshCw } from 'lucide-react';
import { FIELD_META, PARCELA_LABELS } from '../constants';
import type { AlertaDisparado } from 'types/pmac';

interface AlertasDisparadosListProps {
  refreshTrigger?: number;
}

export function AlertasDisparadosList({ refreshTrigger = 0 }: AlertasDisparadosListProps) {
  const [alertas, setAlertas] = useState<AlertaDisparado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const loadAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/disparados`,
        {
          params: { limit: 100, reconhecido: showAll ? undefined : 'false' },
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      setAlertas(res.data);
    } catch {
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    loadAlertas();
  }, [loadAlertas, refreshTrigger]);

  async function acknowledgeOne(id: number) {
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/disparados/${id}/reconhecer`,
        {},
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setAlertas((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, reconhecido: true, reconhecido_em: new Date().toISOString() } : a
        )
      );
    } catch {
      toast.error('Erro ao reconhecer alerta');
    }
  }

  async function acknowledgeAll() {
    setAcknowledging(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/disparados/reconhecer-todos`,
        {},
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      toast.success('Todos os alertas reconhecidos');
      loadAlertas();
    } catch {
      toast.error('Erro ao reconhecer alertas');
    } finally {
      setAcknowledging(false);
    }
  }

  const unacknowledgedCount = alertas.filter((a) => !a.reconhecido).length;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-muted-foreground'>
            {loading
              ? 'A carregar...'
              : `${alertas.length} alerta${alertas.length !== 1 ? 's' : ''}`}
          </p>
          <button
            className='text-xs text-muted-foreground underline underline-offset-2'
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Mostrar apenas não reconhecidos' : 'Mostrar todos'}
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            className='gap-1.5'
            onClick={loadAlertas}
          >
            <RefreshCw className='h-3.5 w-3.5' />
            Atualizar
          </Button>
          {unacknowledgedCount > 0 && (
            <Button
              size='sm'
              className='gap-1.5'
              onClick={acknowledgeAll}
              disabled={acknowledging}
            >
              <CheckCheck className='h-4 w-4' />
              Reconhecer todos ({unacknowledgedCount})
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center py-8'>
          <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      ) : alertas.length === 0 ? (
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            {showAll ? 'Sem alertas registados.' : 'Nenhum alerta por reconhecer.'}
          </p>
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Regra</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Parâmetro</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className='w-12' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.map((alerta) => {
                const fieldLabel = FIELD_META[alerta.campo]?.label ?? alerta.campo;
                const unit = FIELD_META[alerta.campo]?.unit ?? '';
                const condition = `${Number(alerta.valor_medido).toFixed(2)}${unit ? ` ${unit}` : ''} ${alerta.operador} ${alerta.valor_threshold}${unit ? ` ${unit}` : ''}`;

                return (
                  <TableRow
                    key={alerta.id}
                    className={alerta.reconhecido ? 'opacity-60' : ''}
                  >
                    <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
                      {new Date(alerta.disparado_em).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className='font-medium text-sm'>
                      {alerta.regra_nome}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {PARCELA_LABELS[alerta.parcela] ?? alerta.parcela}
                    </TableCell>
                    <TableCell className='text-sm'>{fieldLabel}</TableCell>
                    <TableCell className='text-sm font-mono'>{condition}</TableCell>
                    <TableCell>
                      {alerta.reconhecido ? (
                        <Badge variant='secondary' className='text-xs'>
                          Reconhecido
                        </Badge>
                      ) : (
                        <Badge variant='destructive' className='text-xs'>
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!alerta.reconhecido && (
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7'
                          title='Reconhecer'
                          onClick={() => acknowledgeOne(alerta.id)}
                        >
                          <CheckCheck className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
