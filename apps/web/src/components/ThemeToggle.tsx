'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button
        disabled
        className="p-2 rounded-lg bg-sabi-bg dark:bg-sabi-bg-dark transition-colors cursor-not-allowed"
        aria-label="Loading theme toggle"
      >
        <Sun className="w-5 h-5 text-sabi-text-muted dark:text-sabi-text-muted-dark" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-sabi-bg dark:bg-sabi-bg-dark hover:bg-sabi-card dark:hover:bg-sabi-card-dark transition-all duration-200 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-sabi-text-secondary dark:text-sabi-text-secondary-dark group-hover:text-sabi-text-primary dark:group-hover:text-sabi-text-primary-dark transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-sabi-text-secondary dark:text-sabi-text-secondary-dark group-hover:text-sabi-text-primary dark:group-hover:text-sabi-text-primary-dark transition-colors" />
      )}
    </button>
  );
}
