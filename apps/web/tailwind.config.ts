import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: { 
    extend: {
      colors: {
        // Theme-aware color system
        'sabi-bg': {
          DEFAULT: '#ffffff', // Light mode
          dark: '#0b1220',    // Dark mode
        },
        'sabi-card': {
          DEFAULT: '#ffffff', // Light mode
          dark: '#1f2937',    // Dark mode
        },
        'sabi-nav': {
          DEFAULT: '#ffffff', // Light mode
          dark: '#0b1220',    // Dark mode
        },
        'sabi-text': {
          primary: {
            DEFAULT: '#1a1a1a', // Light mode
            dark: '#ffffff',    // Dark mode
          },
          secondary: {
            DEFAULT: '#6b7280', // Light mode
            dark: '#d1d5db',    // Dark mode
          },
          muted: {
            DEFAULT: '#9ca3af', // Light mode
            dark: '#9ca3af',    // Dark mode
          },
        },
        'sabi-accent': {
          DEFAULT: '#3b82f6', // Light mode
          dark: '#3b82f6',    // Dark mode
        },
        'sabi-success': {
          DEFAULT: '#10b981', // Light mode
          dark: '#10b981',    // Dark mode
        },
        'sabi-danger': {
          DEFAULT: '#ef4444', // Light mode
          dark: '#ef4444',    // Dark mode
        },
        'sabi-border': {
          DEFAULT: '#e5e7eb', // Light mode
          dark: '#374151',    // Dark mode
        },
        // Legacy finance colors for backward compatibility
        'finance-bg': '#1C1E26',
        'finance-card': '#2A2D36',
        'finance-nav': '#1C1E26',
        'finance-text-primary': '#FFFFFF',
        'finance-text-secondary': '#9CA3AF',
        'finance-text-disabled': '#6B7280',
        'finance-accent': '#3B82F6',
        'finance-accent-hover': '#2563EB',
        'finance-success': '#10B981',
        'finance-success-hover': '#059669',
        'finance-danger': '#F87171',
        'finance-danger-hover': '#EF4444',
        'finance-highlight': '#FCD535',
        'finance-highlight-soft': '#F4D03F',
        'finance-border': '#374151',
        'finance-border-hover': '#4B5563',
      },
    } 
  },
  plugins: [],
};

export default config;
