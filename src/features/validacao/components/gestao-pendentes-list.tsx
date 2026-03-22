'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface PendingRecord {
  id: number;
  fk_indicador: number;
  ano_referencia: number;
  valor_executado: number;
  url_evidencia: string | null;
  observacoes: string | null;
  data_insercao: string;
  estado_validacao: string;
  indicador_nome: string;
  unidade: string;
  medida_id: string;
  medida_designacao: string;
  setor: string;
  tipo_resposta: string;
  municipio_nome: string;
  municipio_id: number;
}

const ALL_SECTORS = ['Energia', 'Transportes', 'Resíduos', 'Água', 'Agroflorestal', 'Saúde', 'Proteção Civil'];

export function GestaoPendentesList() {
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSetor, setFilterSetor] = useState('all');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  async function getHeaders() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return { Authorization: `Bearer ${session.access_token}` };
  }

  async function fetchPending() {
    setLoading(true);
    try {
      const headers = await getHeaders();
      if (!headers) return;
      const params = new URLSearchParams();
      if (filterSetor !== 'all') params.set('setor', filterSetor);
      const { data } = await axios.get<PendingRecord[]>(
        `${BACKEND}/api/protected/gestao/pending?${params}`,
        { headers }
      );
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPending(); }, [filterSetor]);

  async function handleValidate(id: number) {
    const headers = await getHeaders();
    if (!headers) return;
    await axios.post(`${BACKEND}/api/protected/gestao/${id}/validate`, {}, { headers });
    fetchPending();
  }

  async function handleReject(id: number) {
    if (!rejectNote.trim()) return;
    const headers = await getHeaders();
    if (!headers) return;
    await axios.post(`${BACKEND}/api/protected/gestao/${id}/reject`, { note: rejectNote }, { headers });
    setRejectingId(null);
    setRejectNote('');
    fetchPending();
  }

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex gap-3'>
          <Select value={filterSetor} onValueChange={setFilterSetor}>
            <SelectTrigger className='w-40'><SelectValue placeholder='Setor' /></SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os setores</SelectItem>
              {ALL_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <span className='text-sm text-muted-foreground'>{records.length} pendentes</span>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <CheckCircle className='mx-auto h-10 w-10 text-emerald-500' />
            <p className='mt-3 text-sm font-medium text-muted-foreground'>
              Sem registos pendentes de validação.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {records.map(r => (
            <Card key={r.id} className='border-l-4 border-l-blue-500'>
              <CardContent className='pt-4 pb-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Badge variant='outline' className='text-[10px]'>{r.municipio_nome}</Badge>
                      <Badge variant='outline' className='text-[10px]'>{r.setor}</Badge>
                      <Badge variant='outline' className='text-[10px]'>{r.tipo_resposta}</Badge>
                    </div>
                    <p className='font-semibold text-sm truncate'>{r.medida_designacao}</p>
                    <p className='text-xs text-muted-foreground'>{r.indicador_nome}</p>
                    <div className='flex items-center gap-4 mt-2 text-sm'>
                      <span className='font-bold'>{r.valor_executado?.toLocaleString('pt-PT')} {r.unidade}</span>
                      <span className='text-muted-foreground'>{r.ano_referencia}</span>
                      {r.url_evidencia && (
                        <a href={r.url_evidencia} target='_blank' rel='noopener noreferrer'
                           className='flex items-center gap-1 text-xs text-blue-600 hover:underline'>
                          <ExternalLink className='h-3 w-3' />Evidência
                        </a>
                      )}
                    </div>
                    {r.observacoes && (
                      <p className='text-xs text-muted-foreground mt-1 italic'>&quot;{r.observacoes}&quot;</p>
                    )}
                    <p className='text-[10px] text-muted-foreground mt-1'>
                      Submetido: {new Date(r.data_insercao).toLocaleDateString('pt-PT')}
                    </p>

                    {rejectingId === r.id && (
                      <div className='mt-3 space-y-2'>
                        <textarea
                          className='w-full text-sm border rounded p-2 min-h-[60px] bg-background'
                          placeholder='Nota de rejeição (obrigatório)...'
                          value={rejectNote}
                          onChange={e => setRejectNote(e.target.value)}
                        />
                        <div className='flex gap-2'>
                          <Button size='sm' variant='destructive' onClick={() => handleReject(r.id)}>
                            Confirmar Rejeição
                          </Button>
                          <Button size='sm' variant='outline' onClick={() => { setRejectingId(null); setRejectNote(''); }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {rejectingId !== r.id && (
                    <div className='flex gap-2 shrink-0'>
                      <Button size='sm' onClick={() => handleValidate(r.id)}
                              className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                        <CheckCircle className='h-4 w-4 mr-1' />Validar
                      </Button>
                      <Button size='sm' variant='destructive' onClick={() => setRejectingId(r.id)}>
                        <XCircle className='h-4 w-4 mr-1' />Recusar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
