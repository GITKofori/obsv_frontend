'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  FileText,
  Target,
  Loader2,
} from 'lucide-react';
import { ValidacaoPendentes } from 'types/pmac';
import { createBrowserSupabase } from '@/utils/supabase/client';

interface PendentesListProps {
  initialData: ValidacaoPendentes;
}

export function PendentesList({ initialData }: PendentesListProps) {
  const [execucoes, setExecucoes] = useState(initialData.execucoes_pendentes);
  const [metas, setMetas] = useState(initialData.metas_pendentes);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function getHeaders() {
    const supabase = createBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error('Sessao expirada. Por favor faca login novamente.');
      return null;
    }
    return { Authorization: `Bearer ${session.access_token}` };
  }

  async function handleExecucaoAction(id: number, action: 'aprovar' | 'rejeitar') {
    const actionKey = `exec-${id}-${action}`;
    setLoadingId(actionKey);
    try {
      const headers = await getHeaders();
      if (!headers) return;

      await axios.put(
        `/api/protected/validacao/${id}/${action}?tipo=execucao`,
        {},
        { headers }
      );

      // Optimistic remove
      setExecucoes((prev) => prev.filter((e) => e.id !== id));
      toast.success(
        action === 'aprovar'
          ? 'Execucao validada com sucesso.'
          : 'Execucao recusada.'
      );
    } catch (error) {
      console.error(`Error ${action} execucao:`, error);
      toast.error(`Erro ao ${action === 'aprovar' ? 'validar' : 'recusar'} execucao.`);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleMetaAction(id: number, action: 'aprovar' | 'rejeitar') {
    const actionKey = `meta-${id}-${action}`;
    setLoadingId(actionKey);
    try {
      const headers = await getHeaders();
      if (!headers) return;

      await axios.put(
        `/api/protected/validacao/${id}/${action}?tipo=indicador`,
        {},
        { headers }
      );

      // Optimistic remove
      setMetas((prev) => prev.filter((m) => m.id !== id));
      toast.success(
        action === 'aprovar'
          ? 'Meta validada com sucesso.'
          : 'Meta recusada.'
      );
    } catch (error) {
      console.error(`Error ${action} meta:`, error);
      toast.error(`Erro ao ${action === 'aprovar' ? 'validar' : 'recusar'} meta.`);
    } finally {
      setLoadingId(null);
    }
  }

  const isEmpty = execucoes.length === 0 && metas.length === 0;

  if (isEmpty) {
    return (
      <div className='rounded-lg border border-dashed p-12 text-center'>
        <CheckCircle className='mx-auto h-10 w-10 text-emerald-500' />
        <p className='mt-3 text-sm font-medium text-muted-foreground'>
          Nao existem itens pendentes de validacao.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Pending Execution Records */}
      {execucoes.length > 0 && (
        <section className='space-y-3'>
          <div className='flex items-center gap-2'>
            <FileText className='h-4 w-4 text-primary' />
            <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
              Execucoes Pendentes ({execucoes.length})
            </h3>
          </div>

          <div className='space-y-3'>
            {execucoes.map((exec) => {
              const isLoading =
                loadingId === `exec-${exec.id}-aprovar` ||
                loadingId === `exec-${exec.id}-rejeitar`;

              return (
                <Card
                  key={exec.id}
                  className='border-l-4 border-l-blue-500 transition-all hover:shadow-md'
                >
                  <CardContent className='flex items-center gap-4 p-4'>
                    <div className='flex-1 min-w-0 space-y-1'>
                      <div className='flex items-center gap-2'>
                        <code className='font-mono text-xs font-semibold text-blue-600 dark:text-blue-400'>
                          {exec.medida_id}
                        </code>
                        <Badge
                          variant='secondary'
                          className='text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        >
                          {exec.setor}
                        </Badge>
                      </div>
                      <p className='text-sm font-medium truncate'>
                        {exec.indicador_nome}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {exec.medida_designacao}
                      </p>
                      <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                        <span>
                          Municipio:{' '}
                          <span className='font-medium text-foreground'>
                            {exec.municipio_nome}
                          </span>
                        </span>
                        <span>
                          Valor:{' '}
                          <span className='font-medium text-foreground'>
                            {exec.valor_executado}
                          </span>
                        </span>
                        <span>
                          Ano:{' '}
                          <span className='font-medium text-foreground'>
                            {exec.ano_referencia}
                          </span>
                        </span>
                        <span>
                          Data:{' '}
                          <span className='font-medium text-foreground'>
                            {new Date(exec.data_insercao).toLocaleDateString(
                              'pt-PT'
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className='flex shrink-0 gap-2'>
                      <Button
                        size='sm'
                        className='bg-emerald-600 hover:bg-emerald-700 text-white'
                        disabled={isLoading}
                        onClick={() => handleExecucaoAction(exec.id, 'aprovar')}
                      >
                        {loadingId === `exec-${exec.id}-aprovar` ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <>
                            <CheckCircle className='mr-1 h-3.5 w-3.5' />
                            Validar
                          </>
                        )}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950'
                        disabled={isLoading}
                        onClick={() =>
                          handleExecucaoAction(exec.id, 'rejeitar')
                        }
                      >
                        {loadingId === `exec-${exec.id}-rejeitar` ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <>
                            <XCircle className='mr-1 h-3.5 w-3.5' />
                            Recusar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending Target Proposals */}
      {metas.length > 0 && (
        <section className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Target className='h-4 w-4 text-primary' />
            <h3 className='text-sm font-semibold uppercase tracking-tight text-muted-foreground'>
              Metas Pendentes ({metas.length})
            </h3>
          </div>

          <div className='space-y-3'>
            {metas.map((meta) => {
              const isLoading =
                loadingId === `meta-${meta.id}-aprovar` ||
                loadingId === `meta-${meta.id}-rejeitar`;

              return (
                <Card
                  key={meta.id}
                  className='border-l-4 border-l-amber-500 transition-all hover:shadow-md'
                >
                  <CardContent className='flex items-center gap-4 p-4'>
                    <div className='flex-1 min-w-0 space-y-1'>
                      <div className='flex items-center gap-2'>
                        <code className='font-mono text-xs font-semibold text-blue-600 dark:text-blue-400'>
                          {meta.medida_id}
                        </code>
                      </div>
                      <p className='text-sm font-medium truncate'>
                        {meta.nome}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {meta.medida_designacao}
                      </p>
                      <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                        <span>
                          Municipio:{' '}
                          <span className='font-medium text-foreground'>
                            {meta.municipio_nome}
                          </span>
                        </span>
                        <span>
                          Meta Proposta:{' '}
                          <span className='font-medium text-foreground'>
                            {meta.meta_alvo ?? 'N/A'}
                            {meta.unidade ? ` ${meta.unidade}` : ''}
                          </span>
                        </span>
                        <span>
                          Tipo:{' '}
                          <span className='font-medium text-foreground'>
                            {meta.tipo_meta}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className='flex shrink-0 gap-2'>
                      <Button
                        size='sm'
                        className='bg-emerald-600 hover:bg-emerald-700 text-white'
                        disabled={isLoading}
                        onClick={() => handleMetaAction(meta.id, 'aprovar')}
                      >
                        {loadingId === `meta-${meta.id}-aprovar` ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <>
                            <CheckCircle className='mr-1 h-3.5 w-3.5' />
                            Validar Meta
                          </>
                        )}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950'
                        disabled={isLoading}
                        onClick={() => handleMetaAction(meta.id, 'rejeitar')}
                      >
                        {loadingId === `meta-${meta.id}-rejeitar` ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <>
                            <XCircle className='mr-1 h-3.5 w-3.5' />
                            Recusar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
