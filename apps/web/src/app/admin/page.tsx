import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';

export default async function AdminPage() {
  // Get session directly
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    redirect('/');
  }

  // Check admin status from database
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', session.userId)
    .single();

  if (error || !user?.is_admin) {
    redirect('/');
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">You have admin access.</p>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Events</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage prediction market events</p>
          <a
            href="/admin/events/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Event
          </a>
        </div>
      </div>
    </main>
  );
}
