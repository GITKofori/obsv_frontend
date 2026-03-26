import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = next;
      redirectUrl.searchParams.delete('code');
      redirectUrl.searchParams.delete('next');
      return NextResponse.redirect(redirectUrl);
    }
  }

  const errorUrl = req.nextUrl.clone();
  errorUrl.pathname = '/';
  errorUrl.searchParams.set('error', 'auth_callback_failed');
  return NextResponse.redirect(errorUrl);
}
