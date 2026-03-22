'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ManualImportModal } from './manual-import-modal';

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

async function getHeaders() {
  const supabase = createBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    toast.error('Sessao expirada. Por favor faca login novamente.');
    return null;
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

const API = 'http://localhost:8080/api/protected/admin/scrapers';

interface ScraperRun {
  id: number;
  ano: number;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  finished_at: string | null;
  stats: { total: number; ok: number; skipped: number; errors: number } | null;
}

export function ScraperTab() {
  const [ano, setAno] = useState(String(new Date().getFullYear() - 1));
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<number | null>(null);
  const [status, setStatus] = useState<ScraperRun | null>(null);
  const [runs, setRuns] = useState<ScraperRun[]>([]);
  const [showManual, setShowManual] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const headers = await getHeaders();
        if (!headers) return;
        const res = await axios.get<ScraperRun[]>(`${API}/runs`, { headers });
        setRuns(res.data.slice(0, 10));
      } catch {
        // Silently ignore initial load errors — runs list will be empty
      }
    })();
  }, []);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    pollRef.current = setInterval(async () => {
      try {
        const headers = await getHeaders();
        if (!headers || cancelled) return;
        const { data } = await axios.get<ScraperRun>(`${API}/status/${runId}`, { headers });
        if (cancelled) return;
        setStatus(data);
        if (data.status !== 'running') {
          clearInterval(pollRef.current!);
          setRunning(false);
          setRuns(prev => [data, ...prev.filter(r => r.id !== data.id)].slice(0, 10));
        }
      } catch {
        clearInterval(pollRef.current!);
        setRunning(false);
        toast.error('Erro ao verificar estado do scraper.');
      }
    }, 3000);
    return () => { cancelled = true; clearInterval(pollRef.current!); };
  }, [runId]);

  async function handleRun() {
    setRunning(true);
    setStatus(null);
    try {
      const headers = await getHeaders();
      if (!headers) { setRunning(false); return; }
      const { data } = await axios.post(`${API}/run`, { ano: parseInt(ano) }, { headers });
      setRunId(data.runId);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? e.message);
      setRunning(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-end gap-3'>
        <div>
          <p className='text-sm font-medium mb-1'>Ano</p>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className='w-32'><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleRun} disabled={running}>
          {running ? 'A executar…' : 'Executar Scrapers'}
        </Button>
        <Button variant='outline' onClick={() => setShowManual(true)}>
          Importar Manual
        </Button>
      </div>

      {status && status.status !== 'running' && (
        <div className='rounded-lg border p-4 space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>Run #{status.id}</span>
            <Badge variant={status.status === 'completed' ? 'default' : status.status === 'failed' ? 'destructive' : 'secondary'}>
              {status.status}
            </Badge>
          </div>
          {status.stats && (
            <p className='text-sm text-muted-foreground'>
              Total: {status.stats.total} · OK: {status.stats.ok} · Skipped: {status.stats.skipped} · Errors: {status.stats.errors}
            </p>
          )}
        </div>
      )}

      <div>
        <p className='text-sm font-semibold mb-2'>Últimas execuções</p>
        <div className='space-y-1'>
          {runs.length === 0 && (
            <p className='text-sm text-muted-foreground'>Nenhuma execucao encontrada.</p>
          )}
          {runs.map(r => (
            <div key={r.id} className='flex items-center gap-3 text-sm border rounded px-3 py-2'>
              <span className='text-muted-foreground w-6'>#{r.id}</span>
              <span>{r.ano}</span>
              <Badge variant={r.status === 'completed' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'} className='text-xs'>
                {r.status}
              </Badge>
              {r.stats && <span className='text-muted-foreground ml-auto'>{r.stats.ok}/{r.stats.total} OK</span>}
              <span className='text-muted-foreground text-xs'>{new Date(r.started_at).toLocaleString('pt-PT')}</span>
            </div>
          ))}
        </div>
      </div>

      <ManualImportModal open={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
}
