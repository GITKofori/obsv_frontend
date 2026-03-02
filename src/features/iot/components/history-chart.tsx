'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FIELD_META, FIELDS_BY_PARCELA_TOPICO } from '../constants';
import type { StatsPoint } from 'types/pmac';

interface HistoryChartProps {
  parcela: string;
  topico?: 't1' | 't2';
}

export function HistoryChart({ parcela, topico = 't2' }: HistoryChartProps) {
  const availableFields = FIELDS_BY_PARCELA_TOPICO[`${parcela}:${topico}`] ?? [];
  const [campo, setCampo] = useState(availableFields[0] ?? '');
  const [data, setData] = useState<StatsPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!campo) return;
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/sensores/stats`,
        {
          params: { parcela, campo, topico, periodo: '7d', granularidade: 'day' },
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      setData(res.data);
    } catch {
      // silent — chart just shows empty
    } finally {
      setLoading(false);
    }
  }, [parcela, campo, topico]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Update selected field if parcela changes
  useEffect(() => {
    const fields = FIELDS_BY_PARCELA_TOPICO[`${parcela}:${topico}`] ?? [];
    if (fields.length > 0 && !fields.includes(campo)) {
      setCampo(fields[0]);
    }
  }, [parcela, topico, campo]);

  const meta = FIELD_META[campo];
  const unit = meta?.unit ?? '';

  const chartData = data.map((p) => ({
    date: new Date(p.periodo).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
    media: p.media !== null ? parseFloat(Number(p.media).toFixed(meta?.decimals ?? 2)) : null,
    min: p.minimo !== null ? parseFloat(Number(p.minimo).toFixed(meta?.decimals ?? 2)) : null,
    max: p.maximo !== null ? parseFloat(Number(p.maximo).toFixed(meta?.decimals ?? 2)) : null,
  }));

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between px-1'>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          Histórico (7 dias)
        </p>
        <Select value={campo} onValueChange={setCampo}>
          <SelectTrigger className='h-7 w-48 text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableFields.map((f) => (
              <SelectItem key={f} value={f} className='text-xs'>
                {FIELD_META[f]?.label ?? f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className='flex h-32 items-center justify-center'>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      ) : chartData.length === 0 ? (
        <div className='flex h-32 items-center justify-center rounded-md border border-dashed'>
          <p className='text-xs text-muted-foreground'>Sem dados para este período</p>
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={140}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
            <XAxis dataKey='date' tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}${unit ? ` ${unit}` : ''}`}
            />
            <Tooltip
              formatter={(v: number) => [`${v}${unit ? ` ${unit}` : ''}`, '']}
              labelFormatter={(l) => `Dia ${l}`}
              contentStyle={{ fontSize: 11 }}
            />
            {meta?.alertHigh && (
              <ReferenceLine
                y={meta.alertHigh}
                stroke='#ef4444'
                strokeDasharray='4 2'
                label={{ value: 'Limite', fontSize: 9, fill: '#ef4444' }}
              />
            )}
            {meta?.alertLow && (
              <ReferenceLine
                y={meta.alertLow}
                stroke='#f59e0b'
                strokeDasharray='4 2'
                label={{ value: 'Mín', fontSize: 9, fill: '#f59e0b' }}
              />
            )}
            <Line type='monotone' dataKey='max' stroke='#f59e0b' strokeWidth={1} dot={false} name='Máx' />
            <Line type='monotone' dataKey='media' stroke='hsl(var(--primary))' strokeWidth={2} dot={false} name='Média' />
            <Line type='monotone' dataKey='min' stroke='#6366f1' strokeWidth={1} dot={false} name='Mín' />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
