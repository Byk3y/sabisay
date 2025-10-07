'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { authenticatedFetch } from '@/lib/csrf-client';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernInput } from '@/components/admin/create-event/ModernInput';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { EventDetail } from '@/types/admin';

interface ResolveModalProps {
  event: EventDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolveModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: ResolveModalProps) {
  const [winningOutcomeIdx, setWinningOutcomeIdx] = useState<number | null>(
    null
  );
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceCid, setEvidenceCid] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when modal closes or event changes
  const resetForm = () => {
    setWinningOutcomeIdx(null);
    setEvidenceUrl('');
    setEvidenceCid('');
    setResolutionNotes('');
    setIsSubmitting(false);
  };

  // Reset when modal closes
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (winningOutcomeIdx === null) {
      toast.error('Please select a winning outcome');
      return;
    }

    if (!evidenceUrl) {
      toast.error('Evidence URL is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch(
        `/api/admin/events/${event.id}/resolve`,
        {
          method: 'POST',
          body: JSON.stringify({
            winningOutcomeIdx,
            evidenceUrl,
            evidenceCid: evidenceCid || undefined,
            resolutionNotes: resolutionNotes || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve event');
      }

      toast.success('Event resolved successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Resolve error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to resolve event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-admin-primary-500" />
              Resolve Event
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {event.question}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Database-Only Resolution (v1)
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              This will update the database only. Blockchain resolution and
              payouts are not yet implemented.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Winning Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Winning Outcome <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {event.event_outcomes.map(outcome => (
                <button
                  key={outcome.id}
                  type="button"
                  onClick={() => setWinningOutcomeIdx(outcome.idx)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    winningOutcomeIdx === outcome.idx
                      ? 'border-admin-primary-500 bg-admin-primary-50 dark:bg-admin-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor:
                        winningOutcomeIdx === outcome.idx
                          ? 'var(--admin-primary-500)'
                          : 'currentColor',
                    }}
                  >
                    {winningOutcomeIdx === outcome.idx && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--admin-primary-500)' }}
                      />
                    )}
                  </div>
                  <div
                    className="w-6 h-6 rounded"
                    style={{
                      backgroundColor: outcome.color || '#6b7280',
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {outcome.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Evidence URL */}
          <div>
            <ModernInput
              label="Evidence URL"
              value={evidenceUrl}
              onChange={setEvidenceUrl}
              placeholder="https://example.com/proof-of-outcome"
              type="url"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Link to credible source proving the outcome
            </p>
          </div>

          {/* Evidence CID (optional) */}
          <div>
            <ModernInput
              label="Evidence IPFS CID (Optional)"
              value={evidenceCid}
              onChange={setEvidenceCid}
              placeholder="Qm..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              IPFS CID for permanent evidence storage
            </p>
          </div>

          {/* Resolution Notes */}
          <div>
            <ModernInput
              label="Resolution Notes (Optional)"
              value={resolutionNotes}
              onChange={setResolutionNotes}
              placeholder="Any additional notes about the resolution..."
              type="textarea"
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              10-1000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <ModernButton type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </ModernButton>
            <ModernButton
              type="submit"
              disabled={isSubmitting || winningOutcomeIdx === null}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Resolving...' : 'Resolve Event'}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
}

