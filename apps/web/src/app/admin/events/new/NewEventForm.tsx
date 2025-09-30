'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { toSlug } from '@/lib/slugUtils';
import { ComposerLayout } from '@/components/admin/composer/ComposerLayout';
import { SectionAccordion } from '@/components/admin/composer/SectionAccordion';
import {
  OutcomesEditor,
  type Outcome,
} from '@/components/admin/composer/OutcomesEditor';
import { MarketPreview } from '@/components/admin/composer/MarketPreview';
import { SlugPreview } from '@/components/admin/composer/SlugPreview';

type SlugStatus = 'idle' | 'checking' | 'valid' | 'taken';

export function NewEventForm() {
  // Form state
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<'binary' | 'multi'>('binary');
  const [closeTime, setCloseTime] = useState('');
  const [description, setDescription] = useState('');
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { label: 'Yes', color: '#10B981' },
    { label: 'No', color: '#EF4444' },
  ]);

  // UI state
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Generate slug from title
  useEffect(() => {
    if (title) {
      const slug = toSlug(title);
      setGeneratedSlug(slug);
    } else {
      setGeneratedSlug('');
      setSlugStatus('idle');
    }
  }, [title]);

  // Debounced slug check
  useEffect(() => {
    if (!generatedSlug) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/admin/slug/check?slug=${encodeURIComponent(generatedSlug)}`
        );

        if (response.ok) {
          const data = await response.json();
          setSlugStatus(data.available ? 'valid' : 'taken');
        } else {
          setSlugStatus('idle');
        }
      } catch (error) {
        console.error('Slug check error:', error);
        setSlugStatus('idle');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [generatedSlug]);

  // Client-side validation
  useEffect(() => {
    const errors: string[] = [];

    if (title && (title.length < 3 || title.length > 100)) {
      errors.push('Title must be 3-100 characters');
    }

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
    }

    setValidationErrors(errors);
  }, [title, question, outcomes, closeTime]);

  // Handle type change
  const handleTypeChange = (newType: 'binary' | 'multi') => {
    setType(newType);
    if (newType === 'binary') {
      setOutcomes([
        { label: 'Yes', color: '#10B981' },
        { label: 'No', color: '#EF4444' },
      ]);
    } else if (outcomes.length === 2) {
      // Keep existing outcomes but allow editing
      setOutcomes([...outcomes]);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    // Basic validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!question.trim()) {
      toast.error('Question is required');
      return;
    }
    if (!closeTime) {
      toast.error('Close time is required');
      return;
    }
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/events/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          question: question.trim(),
          type,
          outcomes: outcomes.map(o => ({ label: o.label.trim() })),
          closeTime: new Date(closeTime).toISOString(),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft');
      }

      setLastSaved(new Date());
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle discard
  const handleDiscard = () => {
    if (
      confirm(
        'Are you sure you want to discard your changes? This cannot be undone.'
      )
    ) {
      setTitle('');
      setQuestion('');
      setType('binary');
      setCloseTime('');
      setDescription('');
      setOutcomes([
        { label: 'Yes', color: '#10B981' },
        { label: 'No', color: '#EF4444' },
      ]);
      setLastSaved(null);
      toast.info('Changes discarded');
    }
  };

  // Get local timezone hint
  const getTimezoneHint = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `Your timezone: ${tz}`;
  };

  return (
    <ComposerLayout
      left={
        <>
          {/* Basics Section */}
          <SectionAccordion title="Basics" defaultOpen>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark mb-1"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Will Bitcoin hit $100k by 2025?"
                className="w-full px-3 py-2 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
                required
              />
              <p className="mt-1 text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                3-100 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark mb-1"
              >
                Question *
              </label>
              <textarea
                id="question"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Will Bitcoin reach $100,000 by December 31, 2025?"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark resize-none"
                required
              />
              <p className="mt-1 text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                10-500 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Additional context about this market..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark resize-none"
              />
            </div>
          </SectionAccordion>

          {/* Market Type Section */}
          <SectionAccordion title="Market Type" defaultOpen>
            <div>
              <label className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark mb-2">
                Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="binary"
                    checked={type === 'binary'}
                    onChange={e => handleTypeChange('binary')}
                    className="text-sabi-accent focus:ring-sabi-accent"
                  />
                  <span className="text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark">
                    Binary (Yes/No)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="multi"
                    checked={type === 'multi'}
                    onChange={e => handleTypeChange('multi')}
                    className="text-sabi-accent focus:ring-sabi-accent"
                  />
                  <span className="text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark">
                    Multi-choice
                  </span>
                </label>
              </div>
            </div>

            <OutcomesEditor type={type} outcomes={outcomes} onChange={setOutcomes} />
          </SectionAccordion>

          {/* Timing Section */}
          <SectionAccordion title="Timing" defaultOpen>
            <div>
              <label
                htmlFor="closeTime"
                className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark mb-1"
              >
                Close Time *
              </label>
              <input
                type="datetime-local"
                id="closeTime"
                value={closeTime}
                onChange={e => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
                required
              />
              <p className="mt-1 text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                {getTimezoneHint()}
              </p>
            </div>
          </SectionAccordion>
        </>
      }
      right={
        <>
          {/* Market Preview */}
          <MarketPreview
            title={title}
            question={question}
            outcomes={outcomes}
            closeTime={closeTime}
          />

          {/* Slug Preview */}
          <SlugPreview slug={generatedSlug} status={slugStatus} />

          {/* Validation Hints */}
          {validationErrors.length > 0 && (
            <div
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
              role="alert"
              aria-live="polite"
            >
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                Validation Issues
              </h4>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Last Saved Indicator */}
          {lastSaved && (
            <div className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark text-center">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </>
      }
      actions={
        <>
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark border border-sabi-border dark:border-sabi-border-dark rounded-md hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || validationErrors.length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-sabi-accent hover:bg-sabi-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </>
      }
    />
  );
}