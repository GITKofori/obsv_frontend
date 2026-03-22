'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const MAX_DGEG_YEAR = 2024; // last year with published DGEG municipality files
const CURRENT_YEAR = new Date().getFullYear();
const ALL_YEARS = Array.from({ length: MAX_DGEG_YEAR - 2007 }, (_, i) => 2008 + i).reverse();

const API = '/api/protected/admin/scrapers/dgeg-energy';

async function getHeaders() {
  const supabase = createBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    toast.error('Sessão expirada. Por favor faça login novamente.');
    return null;
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

interface DgegRun {
  id: number;
  ano: number | null;
  status: 'running' | 'completed' | 'failed';
  source: string;
  started_at: string;
  finished_at: string | null;
  stats: { total: number; ok: number; skipped: number; errors: number } | null;
}

export function DgegScraperTab() {
  const [yearFrom, setYearFrom] = useState(String(CURRENT_YEAR - 1));
  const [yearTo,   setYearTo]   = useState(String(CURRENT_YEAR - 1));
  const [electricityEnabled, setElectricityEnabled] = useState(true);
  const [gasEnabled, setGasEnabled] = useState(true);
  const [oilEnabled, setOilEnabled] = useState(true);
  const [running, setRunning] = useState(false);
  const [runId,   setRunId]   = useState<number | null>(null);
  const [status,  setStatus]  = useState<DgegRun | null>(null);
  const [runs,    setRuns]    = useState<DgegRun[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const headers = await getHeaders();
        if (!headers) return;
        const res = await axios.get<DgegRun[]>(`${API}/runs`, { headers });
        setRuns(res.data.slice(0, 10));
      } catch { /* silently ignore */ }
    })();
  }, []);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    pollRef.current = setInterval(async () => {
      try {
        const headers = await getHeaders();
        if (!headers || cancelled) return;
        const { data } = await axios.get<DgegRun>(`${API}/status/${runId}`, { headers });
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
    if (!gasEnabled && !oilEnabled && !electricityEnabled) {
      toast.error('Selecione pelo menos um tipo de energia.');
      return;
    }
    if (parseInt(yearFrom) > parseInt(yearTo)) {
      toast.error('Ano inicial não pode ser superior ao ano final.');
      return;
    }
    const types = [
      ...(electricityEnabled ? ['electricity'] : []),
      ...(gasEnabled ? ['gas'] : []),
      ...(oilEnabled ? ['oil'] : []),
    ];
    setRunning(true);
    setStatus(null);
    try {
      const headers = await getHeaders();
      if (!headers) { setRunning(false); return; }
      const { data } = await axios.post(
        `${API}/run`,
        { year_from: parseInt(yearFrom), year_to: parseInt(yearTo), types },
        { headers }
      );
      setRunId(data.runId);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? e.message);
      setRunning(false);
    }
  }

  return (
    <div className='space-y-6'>
      <p className='text-sm text-muted-foreground'>
        Importa dados de consumo de eletricidade (ECA), gás natural (GMA) e produtos petrolíferos (OMA)
        da DGEG para todos os municípios de Portugal.
      </p>

      <div className='flex flex-wrap items-end gap-4'>
        <div>
          <p className='text-sm font-medium mb-1'>Ano inicial</p>
          <Select value={yearFrom} onValueChange={setYearFrom}>
            <SelectTrigger className='w-28'><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_YEARS.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className='text-sm font-medium mb-1'>Ano final</p>
          <Select value={yearTo} onValueChange={setYearTo}>
            <SelectTrigger className='w-28'><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_YEARS.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium'>Tipos</p>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <Checkbox
                checked={electricityEnabled}
                onCheckedChange={(checked: boolean | 'indeterminate') => setElectricityEnabled(checked === true)}
              />
              <span className='text-sm'>Eletricidade (ECA)</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <Checkbox
                checked={gasEnabled}
                onCheckedChange={(checked: boolean | 'indeterminate') => setGasEnabled(checked === true)}
              />
              <span className='text-sm'>Gás Natural (GMA)</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <Checkbox
                checked={oilEnabled}
                onCheckedChange={(checked: boolean | 'indeterminate') => setOilEnabled(checked === true)}
              />
              <span className='text-sm'>Petróleo (OMA)</span>
            </label>
          </div>
        </div>

        <Button onClick={handleRun} disabled={running}>
          {running ? 'A importar…' : 'Importar'}
        </Button>
      </div>

      {status && status.status !== 'running' && (
        <div className='rounded-lg border p-4 space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>Run #{status.id}</span>
            <Badge variant={
              status.status === 'completed' ? 'default'
              : status.status === 'failed' ? 'destructive'
              : 'secondary'
            }>
              {status.status}
            </Badge>
          </div>
          {status.stats && (
            <p className='text-sm text-muted-foreground'>
              Total: {status.stats.total} · OK: {status.stats.ok} ·
              Skipped: {status.stats.skipped} · Errors: {status.stats.errors}
            </p>
          )}
        </div>
      )}

      <div>
        <p className='text-sm font-semibold mb-2'>Últimas importações DGEG</p>
        <div className='space-y-1'>
          {runs.length === 0 && (
            <p className='text-sm text-muted-foreground'>Nenhuma importação encontrada.</p>
          )}
          {runs.map(r => (
            <div key={r.id} className='flex items-center gap-3 text-sm border rounded px-3 py-2'>
              <span className='text-muted-foreground w-6'>#{r.id}</span>
              <span>{r.ano ?? '—'}</span>
              <Badge
                variant={
                  r.status === 'completed' ? 'default'
                  : r.status === 'failed' ? 'destructive'
                  : 'secondary'
                }
                className='text-xs'
              >
                {r.status}
              </Badge>
              {r.stats && (
                <span className='text-muted-foreground ml-auto'>
                  {r.stats.ok}/{r.stats.total} OK
                </span>
              )}
              <span className='text-muted-foreground text-xs'>
                {new Date(r.started_at).toLocaleString('pt-PT')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
