import { MarketCard } from '@/components/market/MarketCard';

interface MarketPreviewProps {
  title?: string;
  question?: string;
  outcomes?: Array<{ label: string; color?: string; oddsPct?: number }>;
  imageUrl?: string;
  closeTime?: string;
}

export function MarketPreview({
  title,
  question,
  outcomes,
  imageUrl,
  closeTime,
}: MarketPreviewProps) {
  // Check if we have minimum data to show preview
  const hasMinimumData = title && question && outcomes && outcomes.length >= 2;

  if (!hasMinimumData) {
    return (
      <div className="bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg p-8 text-center">
        <p className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
          Fill in the basic details to preview your market
        </p>
      </div>
    );
  }

  // Transform data for MarketCard
  const marketData: any = {
    kind: 'market' as const,
    id: 'preview',
    question: question || '',
    poolUsd: 0,
    outcomes: outcomes.map(o => ({
      label: o.label,
      oddsPct: o.oddsPct || 50,
      color: o.color,
    })),
    slug: 'preview',
  };

  // Conditionally add optional properties
  if (imageUrl) {
    marketData.imageUrl = imageUrl;
  }
  if (closeTime) {
    marketData.closesAt = closeTime;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark mb-3">
        Market Preview
      </h3>
      <div className="pointer-events-none">
        <MarketCard market={marketData} />
      </div>
    </div>
  );
}
