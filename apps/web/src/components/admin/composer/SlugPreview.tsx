import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SlugPreviewProps {
  slug: string;
  status: 'idle' | 'checking' | 'valid' | 'taken';
}

export function SlugPreview({ slug, status }: SlugPreviewProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking...
          </span>
        );
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Available
          </span>
        );
      case 'taken':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            Already taken
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg p-4">
      <h3 className="text-sm font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark mb-2">
        URL Slug
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-sabi-bg dark:bg-sabi-bg-dark px-2 py-1.5 rounded border border-sabi-border dark:border-sabi-border-dark text-sabi-text-primary dark:text-sabi-text-primary-dark">
            /event/{slug || 'your-event-slug'}
          </code>
          {getStatusBadge()}
        </div>
        {status === 'taken' && (
          <p className="text-xs text-red-600 dark:text-red-400">
            This URL is already in use. Please change your title.
          </p>
        )}
      </div>
    </div>
  );
}