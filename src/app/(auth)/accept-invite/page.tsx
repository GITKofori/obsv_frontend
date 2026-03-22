'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AcceptInvitePage() {
  const router = useRouter();
  const supabase = createBrowserSupabase();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase automatically exchanges the token from the URL hash
    // when onAuthStateChange fires with SIGNED_IN event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSessionReady(true);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('As passwords nao coincidem');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast.success('Password definida com sucesso!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao definir password');
    } finally {
      setLoading(false);
    }
  }

  if (!sessionReady) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='mt-4 text-sm text-muted-foreground'>A verificar convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-sm space-y-6 p-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Bem-vindo ao Observatorio do Clima</h1>
          <p className='text-sm text-muted-foreground'>
            Defina a sua password para ativar a conta.
          </p>
        </div>
        <form onSubmit={handleSetPassword} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Minimo 8 caracteres'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirm'>Confirmar Password</Label>
            <Input
              id='confirm'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className='text-sm text-destructive'>{error}</p>
          )}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'A guardar...' : 'Ativar Conta'}
          </Button>
        </form>
      </div>
    </div>
  );
}
