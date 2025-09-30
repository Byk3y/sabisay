import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { NewEventForm } from './NewEventForm';

export default async function NewEventPage() {
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Create New Event
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create a new prediction market event
            </p>
          </div>

          <div className="p-6">
            <NewEventForm />
          </div>
        </div>
      </div>
    </main>
  );
}
