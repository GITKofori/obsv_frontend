'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, BellRing, BarChart3 } from 'lucide-react';

import { useIoTStream } from '@/hooks/use-iot-stream';
import { IoTStatus } from '@/features/iot/components/iot-status';
import { AlertBanner } from '@/features/iot/components/alert-banner';
import { ParcelaCard } from '@/features/iot/components/parcela-card';
import { RegrasList } from '@/features/iot/components/regras-list';
import { AlertasDisparadosList } from '@/features/iot/components/alertas-disparados-list';

export default function IoTPage() {
  const { state, alerts, sseConnected, clearAlerts } = useIoTStream();
  const [alertRefresh, setAlertRefresh] = useState(0);
  const lastAlertIdRef = useRef<number | null>(null);

  // Toast + refresh the alertas list when a new SSE alert arrives
  useEffect(() => {
    if (alerts.length === 0) return;
    const newest = alerts[0];
    if (newest.id === lastAlertIdRef.current) return;

    lastAlertIdRef.current = newest.id;
    toast.error(`Alerta: ${newest.regra.nome}`, {
      description: `${newest.campo} = ${newest.valor_medido.toFixed(2)} ${newest.operador} ${newest.valor_threshold}`,
    });
    setAlertRefresh((n) => n + 1);
  }, [alerts]);

  const unacknowledgedAlertCount = alerts.length;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between flex-wrap gap-3'>
          <div className='flex items-center gap-3'>
            <Radio className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-bold tracking-tight'>Riscos e IoT</h2>
          </div>
          <IoTStatus
            mqttConnected={state.connected}
            sseConnected={sseConnected}
            activeAlertsCount={unacknowledgedAlertCount}
          />
        </div>

        {/* Live alert banner */}
        <AlertBanner alerts={alerts} onClear={clearAlerts} />

        {/* Tabs */}
        <Tabs defaultValue='monitorizacao' className='flex-1'>
          <TabsList className='mb-4'>
            <TabsTrigger value='monitorizacao' className='gap-1.5'>
              <BarChart3 className='h-4 w-4' />
              Monitorização
            </TabsTrigger>
            <TabsTrigger value='regras' className='gap-1.5'>
              <BellRing className='h-4 w-4' />
              Regras de Alerta
            </TabsTrigger>
            <TabsTrigger value='alertas' className='relative gap-1.5'>
              <Radio className='h-4 w-4' />
              Histórico de Alertas
              {unacknowledgedAlertCount > 0 && (
                <span className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500' />
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Monitorização tab ─────────────────────────────────────── */}
          <TabsContent value='monitorizacao'>
            <div className='grid gap-4 lg:grid-cols-3'>
              <ParcelaCard
                label='Rio Torto'
                parcela='point1'
                state={state.point1}
                hasT1
              />
              <ParcelaCard
                label='Padrela'
                parcela='point2'
                state={state.point2}
                hasT1
              />
              <ParcelaCard
                label='Praia Fluvial de Rio Torto'
                parcela='point3'
                state={state.point3}
                isWater
              />
            </div>
          </TabsContent>

          {/* ── Regras tab ────────────────────────────────────────────── */}
          <TabsContent value='regras'>
            <RegrasList />
          </TabsContent>

          {/* ── Alertas tab ───────────────────────────────────────────── */}
          <TabsContent value='alertas'>
            <AlertasDisparadosList refreshTrigger={alertRefresh} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
