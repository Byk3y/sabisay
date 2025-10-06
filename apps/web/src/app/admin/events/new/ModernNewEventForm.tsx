'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { toSlug } from '@/lib/slugUtils';
import { getDefaultOutcomeColor } from '@/lib/colors';
import { 
  FileText, 
  Target, 
  Clock, 
  Save, 
  Trash2,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

// Import modern components
import { ModernSectionCard } from '@/components/admin/create-event/ModernSectionCard';
import { ModernInput } from '@/components/admin/create-event/ModernInput';
import { MarketTypeSelector } from '@/components/admin/create-event/MarketTypeSelector';
import { ModernOutcomesEditor, type Outcome } from '@/components/admin/create-event/ModernOutcomesEditor';
import { ModernButton } from '@/components/ui/ModernButton';
import { ImageUpload } from '@/components/admin/create-event/ImageUpload';

type SlugStatus = 'idle' | 'checking' | 'valid' | 'taken';

export function ModernNewEventForm() {
  // Form state
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<'binary' | 'multi'>('binary');
  const [closeTime, setCloseTime] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { label: 'Yes', color: getDefaultOutcomeColor(0) },
    { label: 'No', color: getDefaultOutcomeColor(1) },
  ]);

  // UI state
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 7; // title, question, type, outcomes, closeTime, rules, image

    if (title.trim()) completed++;
    if (question.trim()) completed++;
    if (type) completed++;
    if (outcomes.length >= 2 && outcomes.every(o => o.label.trim())) completed++;
    if (closeTime) completed++;
    if (rules.trim()) completed++;
    if (imageUrl) completed++;

    return (completed / total) * 100;
  };

  const completionPercentage = calculateCompletion();

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
        { label: 'Yes', color: getDefaultOutcomeColor(0) },
        { label: 'No', color: getDefaultOutcomeColor(1) },
      ]);
    } else {
      // Multi-choice: start with blue and amber (skip green/red to differentiate from binary)
      setOutcomes([
        { label: '', color: getDefaultOutcomeColor(2) },
        { label: '', color: getDefaultOutcomeColor(3) },
      ]);
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
            outcomes: outcomes.map(o => ({ label: o.label.trim(), color: o.color })),
            closeTime: new Date(closeTime).toISOString(),
            rules: rules.trim() || undefined,
            imageUrl: imageUrl || undefined,
          }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft');
      }

      // Store the draft ID for publishing
      setDraftId(data.id);
      setLastSaved(new Date());
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save draft'
      );
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
      setImageUrl(null);
      setOutcomes([
        { label: 'Yes', color: getDefaultOutcomeColor(0) },
        { label: 'No', color: getDefaultOutcomeColor(1) },
      ]);
      setLastSaved(null);
      toast.info('Changes discarded');
    }
  };

  // Publish event
  const handlePublish = async () => {
    // Validate all required fields first
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    if (!title.trim() || !question.trim() || !closeTime) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsPublishing(true);

    try {
      let eventId = draftId;

      // If no draft exists, save it first
      if (!eventId) {
        const draftResponse = await fetch('/api/admin/events/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            question: question.trim(),
            type,
            outcomes: outcomes.map(o => ({ label: o.label.trim(), color: o.color })),
            closeTime: new Date(closeTime).toISOString(),
            rules: rules.trim() || undefined,
            imageUrl: imageUrl || undefined,
          }),
        });

        const draftData = await draftResponse.json();

        if (!draftResponse.ok) {
          throw new Error(draftData.error || 'Failed to save draft');
        }

        eventId = draftData.id;
        setDraftId(eventId);
      }

      // Now publish the event
      const response = await fetch(`/api/admin/events/${eventId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish event');
      }

      toast.success('Event published successfully!');
      
      // Redirect to the published event
      window.location.href = `/event/${data.slug}`;
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to publish event'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // Get local timezone hint
  const getTimezoneHint = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `Your timezone: ${tz}`;
  };

  // Check if sections are completed
  const isBasicsCompleted = title.trim() && question.trim();
  const isMarketTypeCompleted = type && outcomes.length >= 2 && outcomes.every(o => o.label.trim());
  const isTimingCompleted = closeTime;
  const isMediaCompleted = !!imageUrl;

  return (
    <div className="h-full flex flex-col">
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
                  label="Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Will Bitcoin hit $100k by 2025?"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>
              <div className="lg:col-span-2">
                <ModernInput
                  label="Question"
                  value={question}
                  onChange={setQuestion}
                  placeholder="Will Bitcoin reach $100,000 by December 31, 2025?"
                  type="textarea"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={2}
                />
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
              10-2000 characters. This will be displayed prominently on the market page.
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
            <MarketTypeSelector value={type} onChange={handleTypeChange} />
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
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-lg shadow-sm focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500 bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
                required
              />
              <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
                {getTimezoneHint()}
              </p>
            </div>
          </ModernSectionCard>

          {/* Media Section */}
          <ModernSectionCard
            title="Cover Image"
            icon={<ImageIcon className="w-5 h-5 text-admin-primary-500" />}
            isCompleted={isMediaCompleted}
            defaultOpen
          >
            <ImageUpload
              value={imageUrl ?? undefined}
              onChange={setImageUrl}
            />
          </ModernSectionCard>
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0 mt-6 pt-4 border-t border-sabi-border dark:border-sabi-border-dark">
        {/* Debug validation errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Validation Errors:</h4>
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
              onClick={handleDiscard}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </ModernButton>
          </div>
          
          <div className="flex items-center gap-3">
            <ModernButton
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSaving || validationErrors.length > 0}
              loading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </ModernButton>
            
            <ModernButton
              onClick={handlePublish}
              disabled={isPublishing || validationErrors.length > 0}
              loading={isPublishing}
            >
              <Target className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Create Event'}
            </ModernButton>
          </div>
        </div>
      </div>
    </div>
  );
}
