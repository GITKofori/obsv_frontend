'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyMixChart } from '@/features/core/components/energy-mix-chart';
import { SectorEmissionsChart } from '@/features/core/components/sector-emissions-chart';
import { HistoricalChart } from '@/features/core/components/historical-chart';
import { Loader2 } from 'lucide-react';
import { useMunicipio } from '@/hooks/use-municipio';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

interface CoreSummary {
  latestYear: number | null;
  energyByVector: { electricity_mwh: number; gas_mwh: number; oil_mwh: number; total_mwh: number };
  energyByYear: { year: number; electricity_mwh: number | null; gas_mwh: number | null; oil_mwh: number | null }[];
  energyBySector: { sector: string; mwh: number }[];
  lastSync: string | null;
}

export default function CorePage() {
  const { municipioId } = useMunicipio();
  const [data, setData] = useState<CoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const munParam = municipioId ? `?municipio=${municipioId}` : '';
        const res = await axios.get<CoreSummary>(
          `${BACKEND}/api/protected/core/summary${munParam}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error('Error fetching CORE data:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [municipioId]);

  const ev = data?.energyByVector;
  const mixData = ev ? [
    { name: 'Eletricidade', value: ev.electricity_mwh },
    { name: 'Gás Natural',  value: ev.gas_mwh },
    { name: 'Petróleo',     value: ev.oil_mwh },
  ].filter(d => d.value > 0) : [];

  const lastSync = data?.lastSync
    ? new Date(data.lastSync).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/D';

  const kpis = [
    { label: 'Consumo Total', value: ev ? `${ev.total_mwh.toLocaleString('pt-PT')} MWh` : 'N/D', borderColor: 'border-b-blue-500' },
    { label: 'Ano de Referência', value: data?.latestYear ? String(data.latestYear) : 'N/D', borderColor: 'border-b-amber-500' },
    { label: 'Vetores Energéticos', value: mixData.length ? String(mixData.length) : 'N/D', borderColor: 'border-b-emerald-500' },
    { label: 'Última Sincronização', value: lastSync, borderColor: 'border-b-violet-500' },
  ];

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
        <h2 className='text-2xl font-bold tracking-tight'>Monitorizacao CORE</h2>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {kpis.map((kpi) => (
            <Card key={kpi.label} className={`border-b-4 ${kpi.borderColor}`}>
              <CardHeader className='pb-2'>
                <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>{kpi.label}</p>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-black'>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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
            <p className='text-sm text-muted-foreground'>MWh por vetor energético (2010–2024)</p>
          </CardHeader>
          <CardContent>
            <HistoricalChart data={data?.energyByYear ?? []} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
