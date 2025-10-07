'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getDefaultOutcomeColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/csrf-client';
import { EventDetail } from '@/types/admin';
import {
  FileText,
  Target,
  Clock,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

// Import modern components
import { ModernSectionCard } from '@/components/admin/create-event/ModernSectionCard';
import { ModernInput } from '@/components/admin/create-event/ModernInput';
import { MarketTypeSelector } from '@/components/admin/create-event/MarketTypeSelector';
import {
  ModernOutcomesEditor,
  type Outcome,
} from '@/components/admin/create-event/ModernOutcomesEditor';
import { ModernButton } from '@/components/ui/ModernButton';
import { ImageUpload } from '@/components/admin/create-event/ImageUpload';

interface EditEventFormProps {
  event: EventDetail;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();

  // Form state - initialize from event data
  const [question, setQuestion] = useState(event.question);
  const [type] = useState<'binary' | 'multi'>(event.type);
  const [closeTime, setCloseTime] = useState(() => {
    // Convert ISO string to datetime-local format
    const date = new Date(event.close_time);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState(event.description || '');
  const [rules, setRules] = useState(event.rules || '');
  const [imageUrl, setImageUrl] = useState<string | null>(
    event.image_url || null
  );
  const [outcomes, setOutcomes] = useState<Outcome[]>(() =>
    event.event_outcomes.map(o => ({
      id: o.id,
      label: o.label,
      color: o.color || getDefaultOutcomeColor(o.idx),
    }))
  );

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Determine what can be edited based on status
  const canEditQuestion = event.status === 'draft' || event.status === 'pending';
  const canEditType = false; // Never allow type changes
  const canEditOutcomes = event.status === 'draft' || event.status === 'pending';
  const canEditCloseTime = true; // Can extend for live events
  const isLiveEvent = event.status === 'live';

  // Client-side validation
  useEffect(() => {
    const errors: string[] = [];

    if (question && (question.length < 10 || question.length > 500)) {
      errors.push('Question must be 10-500 characters');
    }

    if (outcomes.length < 2) {
      errors.push('At least 2 outcomes required');
    }

    if (outcomes.some(o => !o.label.trim())) {
      errors.push('All outcomes must have labels');
    }

    if (closeTime) {
      const closeDate = new Date(closeTime);
      if (closeDate <= new Date()) {
        errors.push('Close time must be in the future');
      }

      // For live events, cannot shorten close time
      if (isLiveEvent) {
        const currentCloseDate = new Date(event.close_time);
        if (closeDate < currentCloseDate) {
          errors.push('Cannot shorten close time for live events');
        }
      }
    }

    setValidationErrors(errors);
  }, [question, outcomes, closeTime, isLiveEvent, event.close_time]);

  // Handle save
  const handleSave = async () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSaving(true);

    try {
      const response = await authenticatedFetch(
        `/api/admin/events/${event.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            question: canEditQuestion ? question.trim() : undefined,
            description: description.trim() || null,
            type, // Send but API will reject changes
            outcomes: canEditOutcomes
              ? outcomes.map(o => ({
                  id: o.id,
                  label: o.label.trim(),
                  color: o.color,
                }))
              : undefined,
            closeTime: new Date(closeTime).toISOString(),
            rules: rules.trim() || null,
            imageUrl: imageUrl || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event');
      }

      toast.success('Event updated successfully');
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update event'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Get local timezone hint
  const getTimezoneHint = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `Your timezone: ${tz}`;
  };

  // Check if sections are completed
  const isBasicsCompleted = question.trim();
  const isMarketTypeCompleted =
    type && outcomes.length >= 2 && outcomes.every(o => o.label.trim());
  const isTimingCompleted = closeTime;
  const isMediaCompleted = !!imageUrl;

  return (
    <div className="h-full flex flex-col">
      {/* Warning for live events */}
      {!canEditQuestion && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Limited Editing
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              This event is {event.status}. You can only edit rules, image, and
              extend the close time. Question and outcomes cannot be changed.
            </p>
          </div>
        </div>
      )}

      {/* Slug Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Event Slug (Read-only)
            </label>
            <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
              {event.slug}
            </p>
          </div>
          <a
            href={`/event/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-admin-primary-600 dark:text-admin-primary-400 hover:underline"
          >
            View Public Page →
          </a>
        </div>
      </div>

      {/* Main content area - Two column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
        {/* Left column - Main form sections */}
        <div className="space-y-4">
          {/* Basics Section */}
          <ModernSectionCard
            title="Basics"
            icon={<FileText className="w-5 h-5 text-admin-primary-500" />}
            isCompleted={isBasicsCompleted}
            defaultOpen
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <ModernInput
                  label="Market Question"
                  value={question}
                  onChange={setQuestion}
                  placeholder="Will Bitcoin reach $100,000 by December 31, 2025?"
                  type="textarea"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={2}
                  disabled={!canEditQuestion}
                />
                {!canEditQuestion && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Question cannot be changed after publishing
                  </p>
                )}
              </div>
              <div className="lg:col-span-2">
                <ModernInput
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Additional context about this market..."
                  type="textarea"
                  rows={2}
                />
              </div>
            </div>
          </ModernSectionCard>

          {/* Rules Section */}
          <ModernSectionCard
            title="Market Rules"
            icon={<FileText className="w-5 h-5 text-admin-primary-500" />}
            isCompleted={rules.trim().length >= 10}
            defaultOpen
          >
            <ModernInput
              label="Rules & Resolution Criteria"
              value={rules}
              onChange={setRules}
              placeholder="Define the specific rules and criteria for resolving this market. Be clear about what constitutes a win/loss and any edge cases..."
              type="textarea"
              rows={4}
              required
            />
            <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark mt-2">
              10-2000 characters. This will be displayed prominently on the
              market page.
            </p>
          </ModernSectionCard>
        </div>

        {/* Right column - Additional sections */}
        <div className="space-y-4">
          {/* Market Type Section */}
          <ModernSectionCard
            title="Market Type"
            icon={<Target className="w-5 h-5 text-admin-primary-500" />}
            isCompleted={isMarketTypeCompleted}
            defaultOpen
          >
            <MarketTypeSelector value={type} onChange={() => {}} disabled />
            {!canEditOutcomes && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                Outcomes cannot be changed after publishing
              </p>
            )}
            <ModernOutcomesEditor
              type={type}
              outcomes={outcomes}
              onChange={setOutcomes}
            />
          </ModernSectionCard>

          {/* Timing Section */}
          <ModernSectionCard
            title="Timing"
            icon={<Clock className="w-5 h-5 text-admin-primary-500" />}
            isCompleted={isTimingCompleted}
            defaultOpen
          >
            <div className="space-y-4">
              <input
                type="datetime-local"
                value={closeTime}
                onChange={e => setCloseTime(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-lg shadow-sm focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500 bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
                required
                disabled={!canEditCloseTime}
              />
              <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                {getTimezoneHint()}
              </p>
              {isLiveEvent && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  For live events, you can only extend the close time, not
                  shorten it
                </p>
              )}
            </div>
          </ModernSectionCard>

          {/* Media Section */}
          <ModernSectionCard
            title="Cover Image"
            icon={<ImageIcon className="w-5 h-5 text-admin-primary-500" />}
            isCompleted={isMediaCompleted}
            defaultOpen
          >
            <ImageUpload value={imageUrl ?? undefined} onChange={setImageUrl} />
          </ModernSectionCard>
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0 mt-6 pt-4 border-t border-sabi-border dark:border-sabi-border-dark">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModernButton
              variant="ghost"
              onClick={() => router.push('/admin/events')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </ModernButton>
          </div>

          <div className="flex items-center gap-3">
            <ModernButton
              onClick={handleSave}
              disabled={isSaving || validationErrors.length > 0}
              loading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  );
}

