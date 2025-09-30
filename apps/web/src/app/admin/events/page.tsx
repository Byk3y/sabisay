import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { EventsListClient } from './EventsListClient';

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
          Events Management
        </h1>
        <p className="mt-1 text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
          Manage prediction market events
        </p>
      </div>

      <EventsListClient />
    </div>
  );
}
