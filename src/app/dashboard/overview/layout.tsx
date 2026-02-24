import React from 'react';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Paperclip } from 'lucide-react';
import DashboardProvider from './DashboardProvider';
import { api } from '@/lib/axios';

interface DashboardData {
  lastSync: string;
  statistics: any[] | null;
  numberTypeSub: any[] | null;
  averageYearType: any[] | null;
  countByType: any[] | null;
  countByTypeByYear: any[] | null;
  valueEleByYear: any[] | null;
  dadosPetroliferos: any[] | null;
}

async function fetchDashboardData(): Promise<{
  data: DashboardData | null;
  error: string | null;
}> {
  try {
    const response = await api.get<DashboardData>('/protected/dashboard');
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to load data'
    };
  }
}

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { data, error } = await fetchDashboardData();
  return (
    <PageContainer>
      <DashboardProvider value={data}>
        <div className='flex flex-1 flex-col space-y-2'>
          <div className='flex items-center justify-between space-y-2'>
            <h2 className='text-2xl font-bold tracking-tight'>Bem-vindo 👋</h2>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total dados recolhidos
                </CardTitle>
                <Paperclip className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {data?.statistics?.[1]?.count || 0} pontos
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Tipo de dados de consumidores
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                  <circle cx='9' cy='7' r='4' />
                  <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {data?.statistics?.[0]?.count || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Última atualização
                </CardTitle>
                <Calendar className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {
                    new Date(data?.lastSync || Date.now())
                      .toISOString()
                      .split('T')[0]
                  }
                </div>
                <p className='text-xs text-muted-foreground'></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Utilizadores Ativos
                </CardTitle>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4 text-muted-foreground'
                >
                  <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                </svg>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {data?.statistics?.[2]?.count || 0}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <div className='col-span-4'>{bar_stats}</div>
            <div className='col-span-4 md:col-span-3'>{sales}</div>
            <div className='col-span-4'>{area_stats}</div>
            <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
          </div>
        </div>
      </DashboardProvider>
    </PageContainer>
  );
}
