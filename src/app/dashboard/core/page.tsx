'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EnergyMixChart } from '@/features/core/components/energy-mix-chart';
import { SectorEmissionsChart } from '@/features/core/components/sector-emissions-chart';
import { HistoricalChart } from '@/features/core/components/historical-chart';
import { Loader2 } from 'lucide-react';
import { useMunicipio } from '@/hooks/use-municipio';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';

interface DashboardData {
  lastSync: string | null;
  statistics: { type: string; count: number }[] | null;
  countByType: { name: string; value: number }[];
  averageYearType: { year: number; name: string; value: number }[];
  consumerTypeStats: { name: string; value: number; record_count: number }[];
}

export default function CorePage() {
  const { municipioId } = useMunicipio();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/dashboard${municipioId ? `?municipio=${municipioId}` : ''}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching CORE dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [municipioId]);

  const countByType = data?.countByType ?? [];
  const averageYearType = data?.averageYearType ?? [];
  const consumerTypeStats = data?.consumerTypeStats ?? [];

  const totalData = data?.statistics?.find((s) => s.type === 'total_data')?.count;
  const numConsumer = data?.statistics?.find((s) => s.type === 'number_consumer')?.count;
  const numEnergyTypes = countByType.length || null;
  const lastSync = data?.lastSync
    ? new Date(data.lastSync).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const kpis = [
    {
      label: 'Total de Registos',
      value: totalData != null ? Number(totalData).toLocaleString('pt-PT') : 'N/D',
      unit: 'pontos de dados',
      borderColor: 'border-b-blue-500',
    },
    {
      label: 'Setores de Consumo',
      value: numConsumer != null ? String(numConsumer) : 'N/D',
      unit: 'tipos de consumidor',
      borderColor: 'border-b-amber-500',
    },
    {
      label: 'Fontes de Energia',
      value: numEnergyTypes != null ? String(numEnergyTypes) : 'N/D',
      unit: 'tipos de energia',
      borderColor: 'border-b-emerald-500',
    },
    {
      label: 'Última Sincronização',
      value: lastSync ?? 'N/D',
      unit: '',
      borderColor: 'border-b-violet-500',
    },
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

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Monitorizacao CORE
        </h2>

        {/* KPI Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {kpis.map((kpi) => (
            <Card key={kpi.label} className={`border-b-4 ${kpi.borderColor}`}>
              <CardHeader className='pb-2'>
                <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                  {kpi.label}
                </p>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-black'>
                  {kpi.value}{' '}
                  {kpi.unit && (
                    <span className='text-xs font-normal text-muted-foreground'>
                      {kpi.unit}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row: Doughnut + Horizontal Bar */}
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Mix de Consumo Final de Energia por Fonte
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Distribuicao do consumo energetico por tipo de fonte
              </p>
            </CardHeader>
            <CardContent>
              {countByType.length > 0 ? (
                <EnergyMixChart data={countByType} />
              ) : (
                <p className='text-sm text-muted-foreground py-12 text-center'>
                  Sem dados disponiveis
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Consumo por Setor / Tipo de Consumidor
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Valor médio por setor de consumo
              </p>
            </CardHeader>
            <CardContent>
              <SectorEmissionsChart data={consumerTypeStats} />
            </CardContent>
          </Card>
        </div>

        {/* Full-width Historical Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              Evolucao Historica de Consumo Final de Energia
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Consumo por tipo de energia desde 2005
            </p>
          </CardHeader>
          <CardContent>
            {averageYearType.length > 0 ? (
              <HistoricalChart data={averageYearType} />
            ) : (
              <p className='text-sm text-muted-foreground py-12 text-center'>
                Sem dados disponiveis
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
