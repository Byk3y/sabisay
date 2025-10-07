'use client';

import { Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { MarketCard } from '@/components/market/MarketCard';
import { cn } from '@/lib/utils';

interface ModernPreviewPanelProps {
  title?: string;
  question?: string;
  outcomes?: Array<{ label: string; color?: string; oddsPct?: number }>;
  closeTime?: string;
  slug?: string;
  slugStatus?: 'idle' | 'checking' | 'valid' | 'taken';
  validationErrors?: string[];
  lastSaved?: Date | null;
  rules?: string;
  imageUrl?: string;
  className?: string;
}

export function ModernPreviewPanel({
  title,
  question,
  outcomes,
  closeTime,
  slug,
  slugStatus,
  validationErrors = [],
  lastSaved,
  rules,
  imageUrl,
  className,
}: ModernPreviewPanelProps) {
  // Check if we have minimum data to show preview
  const hasMinimumData = title && question && outcomes && outcomes.length >= 2;
  const hasErrors = validationErrors.length > 0;
  const isComplete = hasMinimumData && !hasErrors && closeTime;

  // Transform data for MarketCard
  const marketData: any = {
    kind: 'market' as const,
    id: 'preview',
    question: question || '',
    poolUsd: 0,
    outcomes:
      outcomes?.map(o => ({
        label: o.label,
        oddsPct: o.oddsPct || 50,
      })) || [],
    slug: 'preview',
  };

  if (closeTime) {
    marketData.closesAt = closeTime;
  }

  if (imageUrl) {
    marketData.imageUrl = imageUrl;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
          Live Preview
        </h3>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div className="flex items-center gap-1 text-admin-success-600 dark:text-admin-success-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Ready</span>
            </div>
          ) : hasMinimumData ? (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Incomplete</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sabi-text-muted dark:text-sabi-text-muted-dark">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Draft</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview (if uploaded) */}
      {imageUrl && (
        <div className="bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Event cover preview"
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      {/* Market Preview */}
      <div className="space-y-3">
        {hasMinimumData ? (
          <div className="pointer-events-none">
            <MarketCard market={marketData} />
          </div>
        ) : (
          <div className="bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
              Fill in the basic details to preview your market
            </p>
          </div>
        )}

        {/* Slug Preview */}
        {slug && (
          <div className="bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                URL Slug
              </label>
              {slugStatus === 'valid' && (
                <CheckCircle className="w-4 h-4 text-admin-success-500" />
              )}
              {slugStatus === 'taken' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-sabi-text-primary dark:text-sabi-text-primary-dark bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                /event/{slug}
              </code>
              <button
                type="button"
                className="p-1 text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
                aria-label="Copy slug"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            {slugStatus === 'taken' && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                This slug is already taken
              </p>
            )}
          </div>
        )}

        {/* Validation Summary */}
        {hasErrors && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">
                Issues to Fix
              </h4>
            </div>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completion Status */}
        {isComplete && (
          <div className="bg-admin-success-50 dark:bg-admin-success-900/20 border border-admin-success-200 dark:border-admin-success-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-admin-success-600 dark:text-admin-success-400" />
              <h4 className="text-sm font-semibold text-admin-success-800 dark:text-admin-success-400">
                Ready to Publish
              </h4>
            </div>
            <p className="text-xs text-admin-success-700 dark:text-admin-success-300">
              Your market is complete and ready to be published. All required
              fields are filled and validated.
            </p>
          </div>
        )}

        {/* Last Saved Indicator */}
        {lastSaved && (
          <div className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark text-center">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
