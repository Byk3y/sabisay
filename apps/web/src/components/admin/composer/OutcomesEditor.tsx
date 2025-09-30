'use client';

import { Plus, X } from 'lucide-react';

export interface Outcome {
  label: string;
  color?: string;
}

interface OutcomesEditorProps {
  type: 'binary' | 'multi';
  outcomes: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
}

export function OutcomesEditor({ type, outcomes, onChange }: OutcomesEditorProps) {
  const handleUpdateOutcome = (index: number, field: keyof Outcome, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = { ...newOutcomes[index], [field]: value };
    onChange(newOutcomes);
  };

  const handleAddOutcome = () => {
    if (outcomes.length < 8) {
      onChange([...outcomes, { label: '', color: '#6B7280' }]);
    }
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length > 2) {
      onChange(outcomes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
          Outcomes ({outcomes.length}/{type === 'binary' ? 2 : 8})
        </label>
        {type === 'multi' && outcomes.length < 8 && (
          <button
            type="button"
            onClick={handleAddOutcome}
            className="text-xs text-sabi-accent hover:text-sabi-accent/80 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Outcome
          </button>
        )}
      </div>

      {outcomes.map((outcome, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={outcome.label}
            onChange={e => handleUpdateOutcome(index, 'label', e.target.value)}
            placeholder={`Outcome ${index + 1}`}
            className="flex-1 px-3 py-2 text-sm border border-sabi-border dark:border-sabi-border-dark rounded-md shadow-sm focus:ring-2 focus:ring-sabi-accent focus:border-sabi-accent bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark"
            disabled={type === 'binary'}
          />
          <input
            type="color"
            value={outcome.color || '#6B7280'}
            onChange={e => handleUpdateOutcome(index, 'color', e.target.value)}
            className="w-10 h-10 rounded border border-sabi-border dark:border-sabi-border-dark cursor-pointer"
          />
          {type === 'multi' && outcomes.length > 2 && (
            <button
              type="button"
              onClick={() => handleRemoveOutcome(index)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              aria-label="Remove outcome"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}