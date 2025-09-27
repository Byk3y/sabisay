/**
 * Shared UI primitives extracted from MarketCard for consistent styling
 * Ensures BinaryCard and GroupCard blend perfectly with existing grid
 */

import React from 'react';

// Card shell with exact same styling as MarketCard
export function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-gray-300 dark:border-gray-600/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-lg dark:hover:bg-gray-800/70 transition-all duration-200 ring-1 ring-gray-100 dark:ring-gray-700/50 cursor-pointer">
      <div className="p-4">
        {children}
      </div>
    </article>
  );
}

// Card header with icon, title, and optional right slot
export function CardHeader({ 
  iconSlot, 
  title, 
  rightSlot, 
  subtitle 
}: { 
  iconSlot?: React.ReactNode;
  title: string;
  rightSlot?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <>
      {/* Image and title on the same line */}
      <div className="flex items-center gap-3 mb-2">
        {iconSlot && (
          <div className="w-[38px] h-[38px] shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {iconSlot}
          </div>
        )}
        <h3 className="text-[15px] font-semibold leading-5 line-clamp-2 flex-1 text-gray-900 dark:text-white">
          {title}
        </h3>
        {rightSlot && (
          <div className="shrink-0">
            {rightSlot}
          </div>
        )}
      </div>
      
      {/* Subtitle */}
      {subtitle && (
        <div className="mb-2">
          <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
            {subtitle}
          </div>
        </div>
      )}
    </>
  );
}

// Row line for outcomes/members with consistent styling
export function RowLine({ 
  left, 
  right, 
  showDivider = false 
}: { 
  left: React.ReactNode;
  right: React.ReactNode;
  showDivider?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1 ${showDivider ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="truncate text-gray-800 dark:text-gray-200 text-sm font-medium">
        {left}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
      </div>
    </div>
  );
}

// Action pill for Yes/No buttons with exact MarketCard styling
export function ActionPill({ 
  variant, 
  children, 
  onClick 
}: { 
  variant: "yes" | "no";
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const isYes = variant === "yes";
  const baseClasses = "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors shadow-sm";
  const yesClasses = "bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 border border-green-300 dark:border-green-500/30 text-green-800 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300";
  const noClasses = "bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/30 text-red-800 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300";
  
  return (
    <button 
      className={`${baseClasses} ${isYes ? yesClasses : noClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// View action button for group members
export function ViewAction({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      onClick={onClick}
    >
      view
    </button>
  );
}
