'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createBrowserSupabase } from '@/utils/supabase/client';

interface TerritorialProfileSheetProps {
  municipioId: number;
  municipioNome: string;
  emissoes2005: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportReport: (data: {
    totalMedidas: number;
    medidasValidadas: number;
    setorProgress: { setor: string; total_medidas: number }[];
  }) => void;
}

interface PmacSummary {
  medidas: Array<{
    id: number;
    indicadores?: Array<{ is_validada: boolean }>;
  }>;
  setor_progress: Array<{ setor: string; total_medidas: number }>;
}

export function TerritorialProfileSheet({
  municipioId,
  municipioNome,
  emissoes2005,
  open,
  onOpenChange,
  onExportReport
}: TerritorialProfileSheetProps) {
  const [summary, setSummary] = useState<PmacSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !municipioId) return;

    (async () => {
      setLoading(true);
      setError(null);
      setSummary(null);

      try {
        const supabase = createBrowserSupabase();
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('No authentication token available');
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const base = process.env.NEXT_PUBLIC_BACKEND_URL;

        const res = await fetch(
          `${base}/api/protected/dashboard-pmac/pmac-summary?municipio=${municipioId}`,
          { headers }
        );

        if (!res.ok) throw new Error('Erro ao carregar dados do PMAC');

        const data: PmacSummary = await res.json();
        setSummary(data);
      } catch (err) {
        setError('Não foi possível carregar o perfil do município.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, municipioId]);

  const totalMedidas = summary?.medidas?.length ?? 0;
  const medidasValidadas =
    summary?.medidas?.filter((m) =>
      m.indicadores?.some((i) => i.is_validada)
    ).length ?? 0;
  const progressPct =
    totalMedidas > 0 ? Math.round((medidasValidadas / totalMedidas) * 100) : 0;
  const setorProgress = summary?.setor_progress ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[440px] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">{municipioNome}</SheetTitle>
          <SheetDescription>Perfil Territorial e PMAC</SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            A carregar dados...
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Emissões */}
            <div className="rounded-lg border p-4 space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Emissões de Referência (2005)
              </p>
              <p className="text-2xl font-black text-foreground">
                {emissoes2005 != null
                  ? `${emissoes2005.toLocaleString('pt-PT')} tCO2e`
                  : 'N/D'}
              </p>
            </div>

            {/* PMAC section */}
            <div className="rounded-lg border p-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Plano Municipal de Ação Climática
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-foreground">
                    {totalMedidas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de Medidas
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-emerald-600">
                    {medidasValidadas}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Com Indicadores Validados
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de validação</span>
                  <span className="font-bold">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>
            </div>

            {/* Setor breakdown */}
            {setorProgress.length > 0 && (
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Medidas por Setor
                </p>
                <div className="space-y-2">
                  {setorProgress.map((s) => (
                    <div
                      key={s.setor}
                      className="flex justify-between items-center py-1 border-b last:border-0"
                    >
                      <span className="text-sm font-medium">{s.setor}</span>
                      <span className="font-bold text-sm">{s.total_medidas}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export button */}
            <Button
              className="w-full"
              onClick={() =>
                onExportReport({ totalMedidas, medidasValidadas, setorProgress })
              }
              disabled={!summary}
            >
              Exportar Relatório
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
