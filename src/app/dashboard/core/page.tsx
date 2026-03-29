'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyMixChart } from '@/features/core/components/energy-mix-chart';
import { SectorEmissionsChart } from '@/features/core/components/sector-emissions-chart';
import { HistoricalChart } from '@/features/core/components/historical-chart';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMunicipio } from '@/hooks/use-municipio';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface CoreSummary {
  latestYear: number | null;
  baseline2005_tco2: number;
  population: number | null;
  gee_per_capita: number | null;
  energy_per_capita: number | null;
  energyByVector: { electricity_mwh: number; gas_mwh: number; oil_mwh: number; total_mwh: number };
  geeByVector: { electricity_tco2: number; gas_tco2: number; oil_tco2: number; total_tco2: number };
  energyByYear: { year: number; electricity_mwh: number | null; gas_mwh: number | null; oil_mwh: number | null }[];
  energyBySector: { sector: string; mwh: number }[];
  lastSync: string | null;
}

export default function CorePage() {
  const { municipioId } = useMunicipio();
  const [data, setData] = useState<CoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const params = new URLSearchParams();
        if (municipioId) params.set('municipio', String(municipioId));
        if (selectedYear) params.set('year', String(selectedYear));
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await axios.get<CoreSummary>(
          `${BACKEND}/api/protected/core/summary${qs}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setData(res.data);
        if (selectedYear === null && res.data.latestYear) {
          setSelectedYear(res.data.latestYear);
        }
      } catch (err) {
        console.error('Error fetching CORE data:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [municipioId, selectedYear]);

  const ev = data?.energyByVector;
  const mixData = ev ? [
    { name: 'Eletricidade', value: ev.electricity_mwh },
    { name: 'Gás Natural',  value: ev.gas_mwh },
    { name: 'Petróleo',     value: ev.oil_mwh },
  ].filter(d => d.value > 0) : [];

  const geeTrend = data?.baseline2005_tco2 && data?.geeByVector?.total_tco2
    ? (((data.geeByVector.total_tco2 - data.baseline2005_tco2) / data.baseline2005_tco2) * 100).toFixed(1)
    : null;

  const earliestYear = data?.energyByYear?.[0];
  const latestYearData = data?.energyByYear?.at(-1);
  const energyTrend = earliestYear && latestYearData && earliestYear.year !== latestYearData.year
    ? (((
        (latestYearData.electricity_mwh ?? 0) + (latestYearData.gas_mwh ?? 0) + (latestYearData.oil_mwh ?? 0) -
        (earliestYear.electricity_mwh ?? 0) - (earliestYear.gas_mwh ?? 0) - (earliestYear.oil_mwh ?? 0)
      ) / ((earliestYear.electricity_mwh ?? 0) + (earliestYear.gas_mwh ?? 0) + (earliestYear.oil_mwh ?? 0))
    ) * 100).toFixed(1)
    : null;

  const kpis = [
    {
      label: 'Consumo Total de Energia',
      value: ev ? `${ev.total_mwh.toLocaleString('pt-PT')} MWh` : 'N/D',
      trend: energyTrend ? { value: energyTrend, label: `vs ${earliestYear?.year ?? '—'}` } : null,
      borderColor: 'border-b-blue-500',
    },
    {
      label: 'Emissões Totais de GEE',
      value: data?.geeByVector?.total_tco2
        ? `${data.geeByVector.total_tco2.toLocaleString('pt-PT')} tCO₂e`
        : 'N/D',
      trend: geeTrend ? { value: geeTrend, label: 'vs 2005' } : null,
      borderColor: 'border-b-emerald-500',
    },
    {
      label: 'Consumo de Energia per capita',
      value: data?.energy_per_capita != null
        ? `${data.energy_per_capita.toLocaleString('pt-PT')} MWh/hab`
        : 'N/D',
      trend: null,
      borderColor: 'border-b-amber-500',
    },
    {
      label: 'Emissões de GEE per capita',
      value: data?.gee_per_capita != null
        ? `${data.gee_per_capita.toLocaleString('pt-PT')} tCO₂e/hab`
        : 'N/D',
      trend: null,
      borderColor: 'border-b-violet-500',
    },
  ];

  const availableYears = data?.energyByYear?.map(p => p.year).reverse() ?? [];

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 items-center justify-center py-20'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className='flex flex-1 items-center justify-center py-20'>
          <p className='text-sm text-destructive'>{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight'>Perfil Climático</h2>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {kpis.map((kpi) => (
            <Card key={kpi.label} className={`border-b-4 ${kpi.borderColor}`}>
              <CardHeader className='pb-2'>
                <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>{kpi.label}</p>
              </CardHeader>
              <CardContent>
                <div className='flex items-end gap-2'>
                  <p className='text-2xl font-black'>{kpi.value}</p>
                  {kpi.trend && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mb-0.5 ${
                      Number(kpi.trend.value) <= 0
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                        : 'text-red-600 bg-red-50 dark:bg-red-950'
                    }`}>
                      {Number(kpi.trend.value) > 0 ? '+' : ''}{kpi.trend.value}% {kpi.trend.label}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {availableYears.length > 1 && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Ano:</span>
            <Select
              value={String(selectedYear ?? data?.latestYear ?? '')}
              onValueChange={v => setSelectedYear(Number(v))}
            >
              <SelectTrigger className='w-24'><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableYears.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Mix de Consumo Final de Energia por Fonte</CardTitle>
              <p className='text-sm text-muted-foreground'>Distribuição do consumo energético em MWh</p>
            </CardHeader>
            <CardContent>
              <EnergyMixChart data={mixData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Consumo por Setor / Tipo de Consumidor</CardTitle>
              <p className='text-sm text-muted-foreground'>Top 10 setores em MWh — {data?.latestYear}</p>
            </CardHeader>
            <CardContent>
              <SectorEmissionsChart data={data?.energyBySector ?? []} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Histórica de Consumo Final de Energia</CardTitle>
            <p className='text-sm text-muted-foreground'>{`MWh por vetor energético — ${data?.energyByYear?.[0]?.year ?? 2010}–${data?.energyByYear?.at(-1)?.year ?? new Date().getFullYear()}`}</p>
          </CardHeader>
          <CardContent>
            <HistoricalChart data={data?.energyByYear ?? []} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
