'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Radio } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { SensorIoT } from 'types/pmac';
import { AlertBanner } from '@/features/iot/components/alert-banner';
import { SensorGauge } from '@/features/iot/components/sensor-gauge';
import { IoTStatus } from '@/features/iot/components/iot-status';

export default function IoTPage() {
  const [sensores, setSensores] = useState<SensorIoT[]>([]);
  const [alertas, setAlertas] = useState<SensorIoT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createBrowserSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          toast.error('Sessao expirada. Por favor faca login novamente.');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${session.access_token}` };

        const [sensoresRes, alertasRes] = await Promise.all([
          axios.get('/api/protected/sensores/?municipio=regional', { headers }),
          axios.get('/api/protected/sensores/alertas', { headers }),
        ]);

        setSensores(sensoresRes.data);
        setAlertas(alertasRes.data);
      } catch (error) {
        console.error('Error fetching IoT data:', error);
        toast.error('Erro ao carregar dados dos sensores.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-20'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='mt-4 text-sm text-muted-foreground'>
            A carregar sensores...
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center gap-3'>
          <Radio className='h-6 w-6 text-primary' />
          <h2 className='text-2xl font-bold tracking-tight'>
            Riscos e IoT
          </h2>
        </div>

        {/* Alert banner */}
        <AlertBanner alertas={alertas} />

        {/* Sensor gauge cards */}
        {sensores.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-3'>
            {sensores.map((sensor) => (
              <SensorGauge key={sensor.id} sensor={sensor} />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border border-dashed p-8 text-center'>
            <p className='text-sm text-muted-foreground'>
              Nenhum sensor registado para esta regiao.
            </p>
          </div>
        )}

        {/* IoT network status */}
        <IoTStatus sensores={sensores} alertas={alertas} />
      </div>
    </PageContainer>
  );
}
