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
        // Financial charcoal theme palette
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
