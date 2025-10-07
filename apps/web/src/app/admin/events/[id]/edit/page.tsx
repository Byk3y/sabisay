import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { EditEventForm } from './EditEventForm';
import { EventDetail } from '@/types/admin';

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  // Get session and verify admin
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect('/');
  }

  // Check admin status
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', session.userId)
    .single();

  if (userError || !user?.is_admin) {
    redirect('/');
  }

  // Fetch event data
  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select(
      `
      *,
      event_outcomes (
        id,
        event_id,
        label,
        idx,
        color,
        created_at
      )
    `
    )
    .eq('id', params.id)
    .single();

  if (eventError || !event) {
    redirect('/admin/events');
  }

  // Sort outcomes by index
  const sortedOutcomes = event.event_outcomes.sort(
    (a: { idx: number }, b: { idx: number }) => a.idx - b.idx
  );

  const eventDetail: EventDetail = {
    ...event,
    event_outcomes: sortedOutcomes,
  } as EventDetail;

  // Cannot edit resolved or archived events
  if (eventDetail.status === 'resolved' || eventDetail.status === 'archived') {
    redirect('/admin/events');
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg min-h-[calc(100vh-3rem)]">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Edit Event
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update event details and settings
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Status:{' '}
                <span className="font-medium capitalize">
                  {eventDetail.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 h-full">
            <EditEventForm event={eventDetail} />
          </div>
        </div>
      </div>
    </main>
  );
}

