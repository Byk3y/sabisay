'use client';

import { Target, List, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketTypeOption {
  id: 'binary' | 'multi';
  title: string;
  description: string;
  example: string;
  icon: React.ReactNode;
  features: string[];
}

interface MarketTypeSelectorProps {
  value: 'binary' | 'multi';
  onChange: (value: 'binary' | 'multi') => void;
  className?: string;
}

const marketTypes: MarketTypeOption[] = [
  {
    id: 'binary',
    title: 'Binary Market',
    description: 'Simple Yes/No predictions',
    example: 'Will Bitcoin reach $100k by 2025?',
    icon: <Target className="w-6 h-6" />,
    features: ['Two outcomes', 'Simple to understand', 'High liquidity']
  },
  {
    id: 'multi',
    title: 'Multi-Choice Market',
    description: 'Multiple outcome options',
    example: 'Who will win the 2024 election?',
    icon: <List className="w-6 h-6" />,
    features: ['Up to 8 outcomes', 'Complex scenarios', 'Detailed predictions']
  }
];

export function MarketTypeSelector({ value, onChange, className }: MarketTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <label className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
        Market Type *
      </label>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {marketTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={cn(
              'relative p-6 rounded-xl border-2 transition-all duration-200 text-left group',
              'hover:shadow-lg hover:scale-[1.02]',
              value === type.id
                ? 'border-admin-primary-500 bg-admin-primary-50 dark:bg-admin-primary-900/20'
                : 'border-sabi-border dark:border-sabi-border-dark bg-sabi-card dark:bg-sabi-card-dark hover:border-admin-primary-300'
            )}
          >
            {/* Selection indicator */}
            {value === type.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-admin-primary-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors',
              value === type.id
                ? 'bg-admin-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-sabi-text-secondary dark:text-sabi-text-secondary-dark group-hover:bg-admin-primary-100 dark:group-hover:bg-admin-primary-800'
            )}>
              {type.icon}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  {type.title}
                </h3>
                <p className="text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                  {type.description}
                </p>
              </div>

              {/* Example */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs font-medium text-sabi-text-muted dark:text-sabi-text-muted-dark mb-1">
                  Example:
                </p>
                <p className="text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark">
                  "{type.example}"
                </p>
              </div>

              {/* Features */}
              <div className="space-y-1">
                {type.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Help text */}
      <p className="text-xs text-sabi-text-muted dark:text-sabi-text-muted-dark">
        Choose the market type that best fits your prediction. You can change this later if needed.
      </p>
    </div>
  );
}
