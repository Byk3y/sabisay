import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { DashboardClient } from './DashboardClient';

export default async function AdminDashboardPage() {
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

  return <DashboardClient />;
}
