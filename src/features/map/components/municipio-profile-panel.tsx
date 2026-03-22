'use client';

import { useEffect, useState } from 'react';
import { X, TrendingDown, TrendingUp } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const REGION_BASELINE_2005 = 280000;

interface ProfileData {
  municipio: string;
  year: number;
  gee_tco2: number;
  energia_mwh: number;
  topSector: string | null;
  topSectorMwh: number;
  medidasTotal: number;
}

interface MunicipioProfilePanelProps {
  municipioName: string;
  municipioId: number | null;
  selectedYear: number;
  onClose: () => void;
}

export function MunicipioProfilePanel({
  municipioName,
  municipioId,
  selectedYear,
  onClose,
}: MunicipioProfilePanelProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createBrowserSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };

        const munParam = municipioId ? `municipio=${municipioId}` : '';
        const yearParam = `year=${selectedYear}`;
        const qs = [munParam, yearParam].filter(Boolean).join('&');

        const [summaryRes, mapRes] = await Promise.all([
          fetch(`${BACKEND}/api/protected/core/summary?${qs}`, { headers }),
          fetch(`${BACKEND}/api/protected/core/map?year=${selectedYear}`, { headers }),
        ]);

        const summary = await summaryRes.json();
        const mapRows: { municipio: string; energia_mwh: number; gee_tco2: number; medidas_count: number }[] = await mapRes.json();
        const munMapData = mapRows.find(r => r.municipio === municipioName);

        const topSectorEntry = summary.energyBySector?.[0];

        setData({
          municipio: municipioName,
          year: selectedYear,
          gee_tco2: summary.geeByVector?.total_tco2 ?? 0,
          energia_mwh: summary.energyByVector?.total_mwh ?? 0,
          topSector: topSectorEntry?.sector ?? null,
          topSectorMwh: topSectorEntry?.mwh ?? 0,
          medidasTotal: munMapData?.medidas_count ?? 0,
        });
      } catch (err) {
        console.error('Profile panel error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [municipioName, municipioId, selectedYear]);

  const geeDelta = data ? (((data.gee_tco2 - REGION_BASELINE_2005) / REGION_BASELINE_2005) * 100).toFixed(1) : null;
  const isImproving = geeDelta !== null && Number(geeDelta) < 0;

  return (
    <div className='absolute top-0 right-0 h-full w-80 bg-background border-l shadow-xl z-50 flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b'>
        <div>
          <p className='text-xs text-muted-foreground uppercase font-bold tracking-widest'>Perfil Territorial</p>
          <h3 className='text-lg font-black'>{municipioName}</h3>
        </div>
        <button onClick={onClose} className='text-muted-foreground hover:text-foreground'>
          <X className='h-5 w-5' />
        </button>
      </div>

      {loading ? (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>A carregar...</p>
        </div>
      ) : data ? (
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          <div className='rounded-lg border p-3 space-y-2'>
            <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Evolução Face a 2005</p>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-muted-foreground'>2005 (base)</p>
                <p className='text-sm font-bold'>{REGION_BASELINE_2005.toLocaleString('pt-PT')} t</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-black px-2 py-1 rounded ${
                isImproving ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-red-600 bg-red-50 dark:bg-red-950'
              }`}>
                {isImproving ? <TrendingDown className='h-3 w-3' /> : <TrendingUp className='h-3 w-3' />}
                {geeDelta}%
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>{data.year}</p>
                <p className='text-sm font-bold'>{data.gee_tco2.toLocaleString('pt-PT')} t</p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border p-3 space-y-2'>
            <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Setor com Maior Impacto</p>
            {data.topSector ? (
              <>
                <p className='font-bold'>{data.topSector}</p>
                <p className='text-xs text-muted-foreground'>{data.topSectorMwh.toLocaleString('pt-PT')} MWh</p>
                <div className='w-full bg-muted rounded-full h-1.5'>
                  <div
                    className='bg-blue-500 h-1.5 rounded-full'
                    style={{ width: `${data.energia_mwh > 0 ? Math.min(100, (data.topSectorMwh / data.energia_mwh) * 100) : 0}%` }}
                  />
                </div>
              </>
            ) : (
              <p className='text-sm text-muted-foreground'>Sem dados</p>
            )}
          </div>

          <div className='rounded-lg border p-3 space-y-2'>
            <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Execução PMAC Local</p>
            <p className='text-2xl font-black'>{data.medidasTotal}</p>
            <p className='text-xs text-muted-foreground'>medidas programadas</p>
          </div>

          <button
            onClick={() => window.print()}
            className='w-full mt-2 py-2 px-4 bg-primary text-primary-foreground rounded font-bold text-sm hover:bg-primary/90'
          >
            Exportar Relatório do Município
          </button>
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-sm text-destructive'>Erro ao carregar dados</p>
        </div>
      )}
    </div>
  );
}
