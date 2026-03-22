'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, TrendingDown, TrendingUp, Printer } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const REGION_BASELINE_2005 = 280000;

function openPrintReport(data: ProfileData, geeDelta: string | null, isImproving: boolean) {
  const sectorPct = data.energia_mwh > 0
    ? Math.min(100, Math.round((data.topSectorMwh / data.energia_mwh) * 100))
    : 0;

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8">
<title>Relatório — ${data.municipio}</title>
<style>
  @page { size: A4; margin: 24mm 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; line-height: 1.5; padding: 0; }
  .header { border-bottom: 3px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
  .header .subtitle { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
  .header .date { font-size: 11px; color: #999; text-align: right; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
  .card-full { grid-column: 1 / -1; }
  .card-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 12px; }
  .card-value { font-size: 32px; font-weight: 900; }
  .card-unit { font-size: 13px; color: #666; margin-top: 2px; }
  .trend { display: inline-block; font-size: 13px; font-weight: 800; padding: 3px 10px; border-radius: 4px; margin-left: 8px; }
  .trend-good { background: #d1fae5; color: #065f46; }
  .trend-bad { background: #fee2e2; color: #991b1b; }
  .evolution { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .evolution .year-block { text-align: center; }
  .evolution .year-label { font-size: 11px; color: #888; }
  .evolution .year-value { font-size: 20px; font-weight: 800; }
  .bar-track { width: 100%; height: 8px; background: #f0f0f0; border-radius: 4px; margin-top: 8px; }
  .bar-fill { height: 8px; background: #3b82f6; border-radius: 4px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 10px; color: #999; }
  .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
  .summary-row:last-child { border-bottom: none; }
  .summary-label { font-size: 13px; color: #666; }
  .summary-value { font-size: 13px; font-weight: 700; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="subtitle">Observatório do Clima — Alto Tâmega e Barroso</div>
      <h1>${data.municipio}</h1>
    </div>
    <div class="date">
      Relatório Territorial<br>
      Ano de referência: ${data.year}<br>
      Gerado: ${new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Emissões GEE</div>
      <div class="card-value">${data.gee_tco2.toLocaleString('pt-PT')}</div>
      <div class="card-unit">tCO₂e (${data.year})</div>
    </div>
    <div class="card">
      <div class="card-label">Consumo Energético</div>
      <div class="card-value">${data.energia_mwh.toLocaleString('pt-PT')}</div>
      <div class="card-unit">MWh (${data.year})</div>
    </div>
  </div>

  <div class="grid">
    <div class="card card-full">
      <div class="card-label">Evolução Face a 2005</div>
      <div class="evolution">
        <div class="year-block">
          <div class="year-label">2005 (base)</div>
          <div class="year-value">${REGION_BASELINE_2005.toLocaleString('pt-PT')} t</div>
        </div>
        <div>
          <span class="trend ${isImproving ? 'trend-good' : 'trend-bad'}">
            ${geeDelta != null ? (Number(geeDelta) > 0 ? '+' : '') + geeDelta + '%' : 'N/D'}
          </span>
        </div>
        <div class="year-block">
          <div class="year-label">${data.year}</div>
          <div class="year-value">${data.gee_tco2.toLocaleString('pt-PT')} t</div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Setor com Maior Impacto</div>
      ${data.topSector ? `
        <div style="font-size:16px;font-weight:700;margin-bottom:4px;">${data.topSector}</div>
        <div class="card-unit">${data.topSectorMwh.toLocaleString('pt-PT')} MWh (${sectorPct}% do total)</div>
        <div class="bar-track"><div class="bar-fill" style="width:${sectorPct}%"></div></div>
      ` : '<div class="card-unit">Sem dados disponíveis</div>'}
    </div>
    <div class="card">
      <div class="card-label">Execução PMAC Local</div>
      <div class="card-value">${data.medidasTotal}</div>
      <div class="card-unit">medidas programadas</div>
    </div>
  </div>

  <div class="card" style="margin-top:20px">
    <div class="card-label">Resumo de Indicadores</div>
    <div class="summary-row">
      <span class="summary-label">Emissões GEE totais</span>
      <span class="summary-value">${data.gee_tco2.toLocaleString('pt-PT')} tCO₂e</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Consumo energético total</span>
      <span class="summary-value">${data.energia_mwh.toLocaleString('pt-PT')} MWh</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Setor dominante</span>
      <span class="summary-value">${data.topSector ?? 'N/D'}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Medidas PMAC programadas</span>
      <span class="summary-value">${data.medidasTotal}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Variação emissões vs 2005</span>
      <span class="summary-value">${geeDelta != null ? (Number(geeDelta) > 0 ? '+' : '') + geeDelta + '%' : 'N/D'}</span>
    </div>
  </div>

  <div class="footer">
    <span>Observatório do Clima — Alto Tâmega e Barroso — CIMAT</span>
    <span>Dados: DGEG, INE, PMAC</span>
  </div>

  <script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

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
            onClick={() => openPrintReport(data, geeDelta, isImproving)}
            className='w-full mt-2 py-2 px-4 bg-primary text-primary-foreground rounded font-bold text-sm hover:bg-primary/90 flex items-center justify-center gap-2'
          >
            <Printer className='h-4 w-4' />
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
