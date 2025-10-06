/**
 * Shared color palette for PakoMarket outcomes
 * Single source of truth for all outcome colors across the application
 */

export const PAKO_OUTCOME_COLORS = [
  '#10B981', // green (index 0) - Binary "Yes"
  '#F97316', // orange (index 1) - Binary "No"
  '#3B82F6', // blue (index 2) - Multi-choice start
  '#F59E0B', // amber (index 3)
  '#8B5CF6', // violet (index 4)
  '#EC4899', // pink (index 5)
  '#06B6D4', // cyan (index 6)
  '#84CC16', // lime (index 7)
] as const;

export const DEFAULT_OUTCOME_COLOR = '#6B7280'; // neutral gray fallback

/**
 * Get a deterministic color for an outcome based on its index
 * Colors cycle through the palette for indices > 7
 */
export const getDefaultOutcomeColor = (index: number): string =>
  PAKO_OUTCOME_COLORS[index % PAKO_OUTCOME_COLORS.length];

export type HexColor = (typeof PAKO_OUTCOME_COLORS)[number] | string;

