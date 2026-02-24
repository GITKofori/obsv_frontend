import { createServerSupabase } from '@/utils/supabase/server';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (config) => {
  const supabase = await createServerSupabase();

  // Ensure identity is fresh. getUser() performs a secure roundtrip when needed.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // If a session exists, read the current access token
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (user && session?.access_token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    // Remove any stale header
    if (config.headers) delete (config.headers as any).Authorization;
  }

  return config;
});
