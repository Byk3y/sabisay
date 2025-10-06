'use client';

import { useState } from 'react';
import { Plus, X, GripVertical, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PAKO_OUTCOME_COLORS, getDefaultOutcomeColor, DEFAULT_OUTCOME_COLOR } from '@/lib/colors';

export interface Outcome {
  label: string;
  color?: string;
}

interface ModernOutcomesEditorProps {
  type: 'binary' | 'multi';
  outcomes: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
  className?: string;
}

export function ModernOutcomesEditor({
  type,
  outcomes,
  onChange,
  className,
}: ModernOutcomesEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  const handleUpdateOutcome = (
    index: number,
    field: keyof Outcome,
    value: string
  ) => {
    const newOutcomes = [...outcomes];
    const current = newOutcomes[index];
    if (!current) return;

    if (field === 'label') {
      const updated: Outcome = { label: value };
      if (current.color) {
        updated.color = current.color;
      }
      newOutcomes[index] = updated;
    } else if (field === 'color') {
      const updated: Outcome = { label: current.label };
      if (value) {
        updated.color = value;
      }
      newOutcomes[index] = updated;
    }
    onChange(newOutcomes);
  };

  const handleAddOutcome = () => {
    if (outcomes.length < 8) {
      // Find the next available color that hasn't been used
      const usedColors = outcomes.map(o => o.color).filter(Boolean);
      let nextColorIndex = 0;
      
      // Find the first color from PAKO_OUTCOME_COLORS that isn't already used
      while (nextColorIndex < PAKO_OUTCOME_COLORS.length) {
        const candidateColor = PAKO_OUTCOME_COLORS[nextColorIndex];
        if (!usedColors.includes(candidateColor)) {
          break;
        }
        nextColorIndex++;
      }
      
      // If all colors are used, fall back to cycling (shouldn't happen with max 8 outcomes)
      const newColor = nextColorIndex < PAKO_OUTCOME_COLORS.length 
        ? PAKO_OUTCOME_COLORS[nextColorIndex]
        : getDefaultOutcomeColor(outcomes.length);
        
      onChange([...outcomes, { label: '', color: newColor }]);
    }
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length > 2) {
      onChange(outcomes.filter((_, i) => i !== index));
    }
  };

  const handleColorSelect = (index: number, color: string) => {
    handleUpdateOutcome(index, 'color', color);
    setShowColorPicker(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
          Outcomes ({outcomes.length}/{type === 'binary' ? 2 : 8})
        </label>
        {type === 'multi' && outcomes.length < 8 && (
          <button
            type="button"
            onClick={handleAddOutcome}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-admin-primary-600 dark:text-admin-primary-400 bg-admin-primary-50 dark:bg-admin-primary-900/20 rounded-lg hover:bg-admin-primary-100 dark:hover:bg-admin-primary-900/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Outcome
          </button>
        )}
      </div>

      <div className="space-y-2">
        {outcomes.map((outcome, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-admin-primary-300 dark:hover:border-admin-primary-600 transition-colors"
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Color picker */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowColorPicker(showColorPicker === index ? null : index)}
                className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-800 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: outcome.color || DEFAULT_OUTCOME_COLOR }}
                aria-label="Change color"
              >
                <Palette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Color picker dropdown */}
              {showColorPicker === index && (
                <div className="absolute top-10 left-0 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <div className="grid grid-cols-4 gap-2">
                    {PAKO_OUTCOME_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelect(index, color)}
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input field */}
            <div className="flex-1">
              <input
                type="text"
                value={outcome.label}
                onChange={(e) => handleUpdateOutcome(index, 'label', e.target.value)}
                placeholder={`Outcome ${index + 1}`}
                disabled={type === 'binary'}
                className={cn(
                  'w-full px-3 py-2 text-sm border rounded-lg shadow-sm transition-all duration-200',
                  'focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500',
                  'bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark',
                  'placeholder:text-sabi-text-muted dark:placeholder:text-sabi-text-muted-dark',
                  type === 'binary' && 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed',
                  'border-sabi-border dark:border-sabi-border-dark'
                )}
              />
            </div>

            {/* Remove button */}
            {type === 'multi' && outcomes.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOutcome(index)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                aria-label="Remove outcome"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Help text */}
      <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
        {type === 'binary' 
          ? 'Binary markets have exactly two outcomes: Yes and No.'
          : 'Add 2-8 outcomes for your multi-choice market. Each outcome needs a clear label.'
        }
      </p>
    </div>
  );
}
