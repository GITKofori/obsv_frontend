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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (!hash) {
      // No hash — check for existing session (e.g. arrived via /auth/callback PKCE flow)
      supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
        if (user && !userError) {
          setSessionReady(true);
        } else {
          setError('Link de convite inválido. Peça um novo convite.');
        }
      });
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');

    // Full JWT tokens (implicit flow) — set session directly
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error: sessionError }) => {
        if (sessionError) {
          setError('Convite inválido ou expirado.');
          console.error('setSession error:', sessionError);
        } else {
          setSessionReady(true);
        }
      });
      return;
    }

    // Raw OTP token from Supabase email template — needs email to verify
    if (accessToken && type === 'invite') {
      setInviteToken(accessToken);
      setNeedsVerification(true);
      return;
    }

    setError('Link de convite inválido. Peça um novo convite.');
  }, [supabase]);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('As passwords não coincidem');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // If we have a raw token, verify it first to establish the session
      if (needsVerification && inviteToken) {
        if (!email) {
          setError('Introduza o email para o qual recebeu o convite');
          setLoading(false);
          return;
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: inviteToken,
          type: 'invite',
        });
        if (verifyError) {
          setError('Token inválido ou expirado. Peça um novo convite.');
          console.error('verifyOtp error:', verifyError);
          setLoading(false);
          return;
        }
      }

      // Session is now established — set the password
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

  if (!sessionReady && !needsVerification) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          {error ? (
            <>
              <p className='text-sm text-destructive'>{error}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Contacte o administrador para receber um novo convite.
              </p>
            </>
          ) : (
            <>
              <div className='h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='mt-4 text-sm text-muted-foreground'>A verificar convite...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-sm space-y-6 p-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Bem-vindo ao Observatório do Clima</h1>
          <p className='text-sm text-muted-foreground'>
            Defina a sua password para ativar a conta.
          </p>
        </div>
        <form onSubmit={handleActivate} className='space-y-4'>
          {needsVerification && (
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='O email para o qual recebeu o convite'
                required
              />
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Mínimo 8 caracteres'
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
            {loading ? 'A ativar...' : 'Ativar Conta'}
          </Button>
        </form>
      </div>
    </div>
  );
}
