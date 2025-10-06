import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ModernEventsListClient } from './ModernEventsListClient';

export default async function AdminEventsPage() {
  // Get session and verify admin
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect('/');
  }

  // Check admin status
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', session.userId)
    .single();

  if (error || !user?.is_admin) {
    redirect('/');
  }

  return <ModernEventsListClient />;
}
