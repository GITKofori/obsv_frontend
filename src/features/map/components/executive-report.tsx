'use client';

import { Button } from '@/components/ui/button';

interface ExecutiveReportProps {
  municipioNome: string;
  emissoes2005: number | null;
  totalMedidas: number;
  medidasValidadas: number;
  setorProgress: { setor: string; total_medidas: number }[];
  onClose: () => void;
}

export function ExecutiveReport({
  municipioNome,
  emissoes2005,
  totalMedidas,
  medidasValidadas,
  setorProgress,
  onClose
}: ExecutiveReportProps) {
  const taxaExecucao =
    totalMedidas > 0 ? Math.round((medidasValidadas / totalMedidas) * 100) : 0;

  return (
    <>
      <style>{`
        @media print {
          body > * { visibility: hidden; }
          #report-view, #report-view * { visibility: visible; }
          #report-view { position: absolute; left: 0; top: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto"
        id="report-view"
      >
        {/* Top bar - hidden on print */}
        <div className="sticky top-0 bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
          <span className="font-bold uppercase tracking-widest text-sm">
            Reporte Executivo
          </span>
          <div className="flex gap-3">
            <Button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* A4 page */}
        <div className="max-w-3xl mx-auto my-8 bg-white shadow-xl p-12 min-h-[1000px] print:shadow-none print:my-0 print:max-w-full">
          {/* Header */}
          <header className="flex justify-between items-start border-b-4 border-slate-100 pb-8 mb-10">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-800">
                Ação Climática
              </h1>
              <p className="text-emerald-600 font-bold text-lg mt-1">
                {municipioNome}
              </p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Snapshot de Desempenho
              </p>
              <p className="font-bold mt-1">
                {new Date().toLocaleDateString('pt-PT', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </header>

          {/* Narrative */}
          <section className="bg-slate-50 border-l-4 border-blue-600 p-6 rounded-r-2xl mb-10">
            <p className="text-lg font-medium text-slate-700 italic leading-snug">
              &ldquo;O município de{' '}
              <strong className="text-blue-700">{municipioNome}</strong> conta
              com <strong className="text-blue-700">{totalMedidas}</strong>{' '}
              medidas PMAC registadas, das quais{' '}
              <strong className="text-blue-700">{medidasValidadas}</strong> têm
              indicadores validados, representando uma taxa de execução de{' '}
              <strong className="text-blue-700">{taxaExecucao}%</strong>.&rdquo;
            </p>
          </section>

          {/* KPIs grid */}
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h4 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 mb-4 tracking-widest">
                Métricas PMAC
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium">Total de Medidas</span>
                  <span className="font-bold">{totalMedidas}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-emerald-600">
                  <span className="text-sm font-medium">
                    Medidas com Indicadores Validados
                  </span>
                  <span className="font-bold">{medidasValidadas}</span>
                </div>
                {emissoes2005 != null && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm font-medium">
                      Emissões de Referência (2005)
                    </span>
                    <span className="font-bold">
                      {emissoes2005.toLocaleString('pt-PT')} tCO2e
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 mb-4 tracking-widest">
                Estado do PMAC
              </h4>
              <div className="text-5xl font-black text-blue-600 mb-2">
                {taxaExecucao}%
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${taxaExecucao}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Taxa de implementação com indicadores validados.
              </p>
            </div>
          </div>

          {/* Setor breakdown */}
          {setorProgress.length > 0 && (
            <div className="mb-10">
              <h4 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 mb-4 tracking-widest">
                Medidas por Setor
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {setorProgress.map((s) => (
                  <div
                    key={s.setor}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {s.setor}
                    </span>
                    <span className="font-bold text-slate-900">{s.total_medidas}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-16 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Observatório de Ação Climática — Alto Tâmega e Barroso
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
