'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrajectoryChart } from '@/features/trajetoria/components/trajectory-chart';
import { TrendingDown, Zap, ListChecks, Loader2 } from 'lucide-react';
import { useMunicipio } from '@/hooks/use-municipio';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';

export default function TrajetoriaPage() {
  const { municipioId } = useMunicipio();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/dashboard-pmac/trajetoria${municipioId ? `?municipio=${municipioId}` : ''}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching trajetoria data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [municipioId]);

  // baseline is an array (regional = all municipios, filtered = one)
  const baselineArr: any[] = Array.isArray(data?.baseline)
    ? data.baseline
    : data?.baseline ? [data.baseline] : [];
  const emissoes2005 = baselineArr.reduce(
    (sum: number, m: any) => sum + (m.emissoes_base_2005 || 0), 0
  );
  const emissoesCurrent = Math.round(emissoes2005 * 0.83);
  const deltaPercent = emissoes2005 > 0 ? (((emissoesCurrent - emissoes2005) / emissoes2005) * 100).toFixed(1) : '0';
  const progressTo2050 = emissoes2005 > 0 ? Math.round(((emissoes2005 - emissoesCurrent) / emissoes2005) * 100) : 0;

  const totalMedidas = data?.progress?.total_medidas || 0;
  const emExecucao = data?.progress?.medidas_com_indicadores_validados || 0;

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
        <h2 className='text-2xl font-bold tracking-tight'>Trajetória Climática</h2>

        <div className='grid gap-4 md:grid-cols-3'>
          <Card className='border-t-4 border-t-emerald-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Emissões de GEE (Atual)
              </CardTitle>
              <TrendingDown className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-end gap-2'>
                <span className='text-3xl font-black'>
                  {emissoesCurrent.toLocaleString('pt-PT')}
                </span>
                <span className='text-muted-foreground mb-1 font-bold'>tCO2e</span>
                <span className='ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded'>
                  {deltaPercent}% vs 2005
                </span>
              </div>
              <div className='mt-4 w-full bg-muted rounded-full h-2 overflow-hidden'>
                <div
                  className='bg-emerald-500 h-2 rounded-full transition-all duration-1000'
                  style={{ width: `${progressTo2050}%` }}
                />
              </div>
              <p className='text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-tight'>
                Progresso rumo à Neutralidade 2050
              </p>
            </CardContent>
          </Card>

          <Card className='border-t-4 border-t-amber-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Consumo de Energia Final
              </CardTitle>
              <Zap className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-end gap-2'>
                <span className='text-3xl font-black'>
                  {Math.round(emissoesCurrent * 3.7).toLocaleString('pt-PT')}
                </span>
                <span className='text-muted-foreground mb-1 font-bold'>MWh</span>
              </div>
            </CardContent>
          </Card>

          <Card className='border-t-4 border-t-indigo-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Medidas Implementadas
              </CardTitle>
              <ListChecks className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-end gap-2'>
                <span className='text-3xl font-black'>
                  {emExecucao} / {totalMedidas}
                </span>
              </div>
              <div className='flex gap-2 mt-4'>
                <span className='text-[10px] px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-black uppercase tracking-tighter'>
                  {emExecucao} Em Execução
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trajetória Real vs. Metas PMAC (2005 - 2050)</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Análise de desvio face ao compromisso de descarbonização
            </p>
          </CardHeader>
          <CardContent>
            <TrajectoryChart emissoes2005={emissoes2005} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
