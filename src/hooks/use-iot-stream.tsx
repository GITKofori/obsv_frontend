'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import type {
  IoTStreamState,
  LeituraT1,
  LeituraT2,
  SSEAlertaEvent,
} from 'types/pmac';

const DEFAULT_STATE: IoTStreamState = {
  point1: { t1: null, t2: null },
  point2: { t1: null, t2: null },
  point3: { t1: null, t2: null },
  connected: false,
};

interface UseIoTStreamResult {
  state: IoTStreamState;
  alerts: SSEAlertaEvent[];
  sseConnected: boolean;
  clearAlerts: () => void;
}

export function useIoTStream(): UseIoTStreamResult {
  const [state, setState] = useState<IoTStreamState>(DEFAULT_STATE);
  const [alerts, setAlerts] = useState<SSEAlertaEvent[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    async function connect() {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token || cancelled) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
      const url = `${backendUrl}/api/protected/sensores/stream?token=${session.access_token}`;

      es = new EventSource(url);
      esRef.current = es;

      es.addEventListener('init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as IoTStreamState;
          setState(data);
          setSseConnected(data.connected);
        } catch {/* ignore parse errors */}
      });

      es.addEventListener('t1', (e: MessageEvent) => {
        try {
          const { parcela, data } = JSON.parse(e.data) as {
            parcela: keyof Omit<IoTStreamState, 'connected'>;
            data: LeituraT1;
          };
          setState((prev) => ({
            ...prev,
            [parcela]: { ...prev[parcela], t1: data },
          }));
        } catch {/* ignore */}
      });

      es.addEventListener('t2', (e: MessageEvent) => {
        try {
          const { parcela, data } = JSON.parse(e.data) as {
            parcela: keyof Omit<IoTStreamState, 'connected'>;
            data: LeituraT2;
          };
          setState((prev) => ({
            ...prev,
            [parcela]: { ...prev[parcela], t2: data },
          }));
        } catch {/* ignore */}
      });

      es.addEventListener('alerta', (e: MessageEvent) => {
        try {
          const alerta = JSON.parse(e.data) as SSEAlertaEvent;
          setAlerts((prev) => [alerta, ...prev.slice(0, 49)]); // keep last 50
        } catch {/* ignore */}
      });

      es.addEventListener('status', (e: MessageEvent) => {
        try {
          const { connected } = JSON.parse(e.data) as { connected: boolean };
          setSseConnected(connected);
          setState((prev) => ({ ...prev, connected }));
        } catch {/* ignore */}
      });

      es.onerror = () => {
        setSseConnected(false);
      };

      es.onopen = () => {
        setSseConnected(true);
      };
    }

    connect();

    return () => {
      cancelled = true;
      es?.close();
      esRef.current = null;
      setSseConnected(false);
    };
  }, []);

  return { state, alerts, sseConnected, clearAlerts };
}
