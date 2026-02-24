'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';
import { Medida } from 'types/pmac';

interface DeleteMedidaDialogProps {
  medida: Medida | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteMedidaDialog({
  medida,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMedidaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!medida) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/medidas/${medida.id}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? err.message ?? 'Erro ao eliminar');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao eliminar');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar medida?</AlertDialogTitle>
          <AlertDialogDescription>
            Está prestes a eliminar permanentemente a medida{' '}
            <code className='font-mono font-semibold text-foreground'>
              {medida?.id}
            </code>
            {medida?.designacao && (
              <>
                {' '}
                — <span className='italic'>{medida.designacao}</span>
              </>
            )}
            . Esta ação não pode ser revertida.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className='text-sm text-destructive bg-destructive/10 rounded px-3 py-2 mx-6'>
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
