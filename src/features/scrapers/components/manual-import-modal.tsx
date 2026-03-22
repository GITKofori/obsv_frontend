'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

async function getHeaders() {
  const supabase = createBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    toast.error('Sessao expirada. Por favor faca login novamente.');
    return null;
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

export function ManualImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [csv, setCsv] = useState('iso_indicador_id,municipio_id,ano,valor,unidade\n');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCsv('iso_indicador_id,municipio_id,ano,valor,unidade\n');
      setResult(null);
      setError(null);
    }
  }, [open]);

  async function handleImport() {
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const headers = await getHeaders();
      if (!headers) { setLoading(false); return; }
      const { data } = await axios.post(
        'http://localhost:8080/api/protected/admin/scrapers/manual',
        { csv },
        { headers }
      );
      setResult(`Importados ${data.imported} valores`);
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader><DialogTitle>Importação Manual de Indicadores</DialogTitle></DialogHeader>
        <p className='text-sm text-muted-foreground'>
          Formato: <code>iso_indicador_id,municipio_id,ano,valor,unidade</code>
        </p>
        <Textarea value={csv} onChange={e => setCsv(e.target.value)} rows={12} className='font-mono text-xs' />
        {result && <p className='text-green-600 text-sm'>{result}</p>}
        {error  && <p className='text-destructive text-sm'>{error}</p>}
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>Cancelar</Button>
          <Button onClick={handleImport} disabled={loading}>
            {loading ? 'A importar…' : 'Importar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
