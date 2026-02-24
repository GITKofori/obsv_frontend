import { createServerSupabase } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  console.log(user);
  if (!user) {
    redirect('/');
  }
  redirect('/dashboard/trajetoria');
}
