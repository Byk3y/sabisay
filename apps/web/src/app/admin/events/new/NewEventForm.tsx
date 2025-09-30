'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toSlug } from '@/lib/slugUtils';

interface Outcome {
  label: string;
  color?: string | undefined;
}

export function NewEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<'binary' | 'multi'>('binary');
  const [closeTime, setCloseTime] = useState('');
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { label: 'Yes', color: '#10B981' },
    { label: 'No', color: '#EF4444' }
  ]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Generate slug preview
  const slugPreview = title ? toSlug(title) : '';

  // Handle outcome changes
  const updateOutcome = (index: number, field: keyof Outcome, value: string) => {
    const newOutcomes = [...outcomes];
    const currentOutcome = newOutcomes[index];
    if (field === 'label') {
      newOutcomes[index] = { label: value, color: currentOutcome?.color };
    } else if (field === 'color') {
      newOutcomes[index] = { label: currentOutcome?.label || '', color: value };
    }
    setOutcomes(newOutcomes);
  };

  const addOutcome = () => {
    if (outcomes.length < 8) {
      setOutcomes([...outcomes, { label: '', color: '#6B7280' }]);
    }
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!question.trim()) {
        throw new Error('Question is required');
      }
      if (!closeTime) {
        throw new Error('Close time is required');
      }
      if (new Date(closeTime) <= new Date()) {
        throw new Error('Close time must be in the future');
      }
      if (outcomes.length < 2) {
        throw new Error('At least 2 outcomes are required');
      }
      if (outcomes.some(o => !o.label.trim())) {
        throw new Error('All outcomes must have labels');
      }

      // Convert image to base64 if provided
      let imageBase64: string | undefined;
      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // Prepare request body
      const body = {
        title: title.trim(),
        question: question.trim(),
        type,
        closeTime: new Date(closeTime).toISOString(),
        outcomes: outcomes.map(o => ({
          label: o.label.trim(),
          color: o.color,
        })),
        description: description.trim() || undefined,
        imageBase64,
      };

      // Submit to API
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      if (data.success && data.data?.slug) {
        // Redirect to the new event page
        router.push(`/event/${data.data.slug}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Event title"
          required
        />
        {slugPreview && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Slug: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{slugPreview}</code>
          </p>
        )}
      </div>

      {/* Question */}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Question *
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="What will happen?"
          required
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Type *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="binary"
              checked={type === 'binary'}
              onChange={(e) => setType(e.target.value as 'binary')}
              className="mr-2"
            />
            Binary (Yes/No)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="multi"
              checked={type === 'multi'}
              onChange={(e) => setType(e.target.value as 'multi')}
              className="mr-2"
            />
            Multi-choice
          </label>
        </div>
      </div>

      {/* Outcomes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Outcomes * ({outcomes.length}/8)
        </label>
        <div className="space-y-3">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={outcome.label}
                onChange={(e) => updateOutcome(index, 'label', e.target.value)}
                className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Outcome ${index + 1}`}
                required
              />
              <input
                type="color"
                value={outcome.color || '#6B7280'}
                onChange={(e) => updateOutcome(index, 'color', e.target.value)}
                className="w-12 h-10 rounded border-gray-300 dark:border-gray-600"
              />
              {outcomes.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOutcome(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {outcomes.length < 8 && type === 'multi' && (
            <button
              type="button"
              onClick={addOutcome}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              + Add Outcome
            </button>
          )}
        </div>
      </div>

      {/* Close Time */}
      <div>
        <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Close Time *
        </label>
        <input
          type="datetime-local"
          id="closeTime"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Additional details about this event..."
        />
      </div>

      {/* Image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image (Optional)
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
