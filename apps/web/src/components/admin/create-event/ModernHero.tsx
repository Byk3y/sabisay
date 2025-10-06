'use client';

import { TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernHeroProps {
  completionPercentage: number;
  className?: string;
}

export function ModernHero({ completionPercentage, className }: ModernHeroProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-admin-primary-50 via-white to-admin-primary-50/30 dark:from-admin-primary-900/20 dark:via-sabi-bg-dark dark:to-admin-primary-900/10" />
      
      {/* Content */}
      <div className="relative px-6 py-8">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-admin-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-sabi-text-primary dark:text-sabi-text-primary-dark">
                Create Your Prediction Market
              </h1>
              <Sparkles className="w-5 h-5 text-admin-primary-500" />
            </div>
            <p className="text-sabi-text-secondary dark:text-sabi-text-secondary-dark mb-4">
              Turn your insights into tradable markets. Share your predictions and let the community decide.
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-admin-primary-500 to-admin-primary-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-sabi-text-secondary dark:text-sabi-text-secondary-dark min-w-[3rem]">
                {Math.round(completionPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



