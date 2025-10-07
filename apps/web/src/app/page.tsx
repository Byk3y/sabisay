import { SidePanelProvider } from '@/contexts/SidePanelContext';
import { HomePageContent } from '@/components/HomePage/HomePageContent';
import { getEvents } from '@/lib/getEvents';

export default async function HomePage() {
  // Fetch events server-side using direct Supabase query
  const realEvents = await getEvents();

  return (
    <SidePanelProvider>
      <HomePageContent realEvents={realEvents} />
    </SidePanelProvider>
  );
}
