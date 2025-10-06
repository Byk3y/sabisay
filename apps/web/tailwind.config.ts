import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Modern color system inspired by reference design
        'sabi-bg': {
          DEFAULT: '#f9fafb', // Light mode - subtle background
          dark: '#0b1220', // Dark mode
        },
        'sabi-card': {
          DEFAULT: '#ffffff', // Light mode
          dark: '#1f2937', // Dark mode
        },
        'sabi-nav': {
          DEFAULT: '#ffffff', // Light mode
          dark: '#0b1220', // Dark mode
        },
        'sabi-text': {
          primary: {
            DEFAULT: '#111827', // Light mode - better contrast
            dark: '#ffffff', // Dark mode
          },
          secondary: {
            DEFAULT: '#6b7280', // Light mode
            dark: '#d1d5db', // Dark mode
          },
          muted: {
            DEFAULT: '#9ca3af', // Light mode
            dark: '#9ca3af', // Dark mode
          },
        },
        'sabi-accent': {
          DEFAULT: '#3b82f6', // Light mode
          dark: '#3b82f6', // Dark mode
        },
        'sabi-success': {
          DEFAULT: '#22c55e', // Light mode - better contrast
          dark: '#22c55e', // Dark mode
        },
        'sabi-warning': {
          DEFAULT: '#f59e0b', // Light mode
          dark: '#f59e0b', // Dark mode
        },
        'sabi-danger': {
          DEFAULT: '#ef4444', // Light mode
          dark: '#ef4444', // Dark mode
        },
        'sabi-border': {
          DEFAULT: '#e5e7eb', // Light mode
          dark: '#374151', // Dark mode
        },
        // Enhanced color palette for modern admin UI
        'admin': {
          // Primary brand colors
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          // Status colors
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          },
          // Neutral grays
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
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
      // Enhanced spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Modern typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Enhanced shadows for modern cards
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
