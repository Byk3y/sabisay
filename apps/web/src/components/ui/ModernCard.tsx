'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const cardVariants = {
  default:
    'bg-sabi-card dark:bg-sabi-card-dark border border-sabi-border dark:border-sabi-border-dark',
  elevated: 'bg-sabi-card dark:bg-sabi-card-dark shadow-card-lg border-0',
  outlined:
    'bg-transparent border-2 border-sabi-border dark:border-sabi-border-dark',
  ghost: 'bg-transparent border-0',
};

const cardPadding = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'md:rounded-xl transition-all duration-200',
          cardVariants[variant],
          cardPadding[padding],
          hover && 'hover:shadow-card-hover hover:-translate-y-0.5',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModernCard.displayName = 'ModernCard';

// Card sub-components for better composition
export const ModernCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
ModernCardHeader.displayName = 'ModernCardHeader';

export const ModernCardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-sabi-text-primary dark:text-sabi-text-primary-dark',
      className
    )}
    {...props}
  />
));
ModernCardTitle.displayName = 'ModernCardTitle';

export const ModernCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-sabi-text-secondary dark:text-sabi-text-secondary-dark',
      className
    )}
    {...props}
  />
));
ModernCardDescription.displayName = 'ModernCardDescription';

export const ModernCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
ModernCardContent.displayName = 'ModernCardContent';

export const ModernCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
ModernCardFooter.displayName = 'ModernCardFooter';
