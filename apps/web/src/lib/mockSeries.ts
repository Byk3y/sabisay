/**
 * Mock time-series data generators for market charts
 * Provides deterministic pseudo-random data for development
 */

export interface SeriesDataPoint {
  t: number; // timestamp
  p: number; // percentage (0-100)
}

export interface Series {
  id: string;
  label: string;
  data: SeriesDataPoint[];
}

export type TimeRange = '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL';

// Deterministic pseudo-random number generator
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// Generate time points based on range
function generateTimePoints(range: TimeRange): number[] {
  const now = Date.now();
  const points: number[] = [];

  switch (range) {
    case '1H':
      for (let i = 0; i < 6; i++) {
        points.push(now - (5 - i) * 10 * 60 * 1000); // 10-minute intervals, 6 points
      }
      break;
    case '6H':
      for (let i = 0; i < 24; i++) {
        points.push(now - (23 - i) * 15 * 60 * 1000); // 15-minute intervals
      }
      break;
    case '1D':
      for (let i = 0; i < 24; i++) {
        points.push(now - (23 - i) * 60 * 60 * 1000); // 1-hour intervals
      }
      break;
    case '1W':
      for (let i = 0; i < 28; i++) {
        points.push(now - (27 - i) * 6 * 60 * 60 * 1000); // 6-hour intervals
      }
      break;
    case '1M':
      for (let i = 0; i < 30; i++) {
        points.push(now - (29 - i) * 24 * 60 * 60 * 1000); // 1-day intervals
      }
      break;
    case 'ALL':
      for (let i = 0; i < 50; i++) {
        points.push(now - (49 - i) * 24 * 60 * 60 * 1000); // 1-day intervals
      }
      break;
  }

  return points;
}

// Generate a smooth curve with some randomness
function generateSmoothCurve(
  timePoints: number[],
  baseValue: number,
  volatility: number,
  trend: number,
  random: () => number
): SeriesDataPoint[] {
  const data: SeriesDataPoint[] = [];
  let currentValue = baseValue;

  for (let i = 0; i < timePoints.length; i++) {
    // Add trend (slight upward or downward movement)
    currentValue += trend * (random() - 0.5) * 0.1;

    // Add volatility (random fluctuations)
    currentValue += (random() - 0.5) * volatility;

    // Add some momentum (previous value influences current)
    if (i > 0 && data[i - 1]) {
      currentValue = currentValue * 0.7 + data[i - 1]!.p * 0.3;
    }

    // Clamp between 0 and 100
    currentValue = Math.max(0, Math.min(100, currentValue));

    data.push({
      t: timePoints[i]!,
      p: Math.round(currentValue * 100) / 100,
    });
  }

  return data;
}

/**
 * Generate a single series for chance markets
 * Returns exactly one series with smooth percentage data
 */
export function generateChanceSeries(
  marketId: string,
  range: TimeRange,
  baseChance?: number
): Series[] {
  const timePoints = generateTimePoints(range);
  const random = seededRandom(marketId.charCodeAt(0) + marketId.length);

  // Use provided base chance or generate one based on market ID
  const baseValue = baseChance ?? 30 + random() * 40; // 30-70% range
  const volatility = 5 + random() * 10; // 5-15% volatility
  const trend = (random() - 0.5) * 2; // Slight trend

  const data = generateSmoothCurve(
    timePoints,
    baseValue,
    volatility,
    trend,
    random
  );

  // Ensure the last data point matches the current chance if provided
  if (baseChance !== undefined && data.length > 0) {
    const lastDataPoint = data[data.length - 1];
    if (lastDataPoint) {
      lastDataPoint.p = baseChance;
    }
  }

  return [
    {
      id: `${marketId}-chance`,
      label: 'Chance',
      data,
    },
  ];
}

/**
 * Generate multiple series for multi-outcome markets
 * Returns multiple series with different colors and behaviors
 */
export function generateMultiSeries(
  marketId: string,
  range: TimeRange,
  labels: string[]
): Series[] {
  const timePoints = generateTimePoints(range);
  const series: Series[] = [];

  // Generate base values that sum to ~100%
  const baseValues: number[] = [];
  let remaining = 100;

  for (let i = 0; i < labels.length; i++) {
    if (i === labels.length - 1) {
      baseValues.push(remaining);
    } else {
      const value =
        20 + Math.random() * (remaining - 20 * (labels.length - i - 1));
      baseValues.push(value);
      remaining -= value;
    }
  }

  // Generate series for each outcome
  labels.forEach((label, index) => {
    const random = seededRandom(
      marketId.charCodeAt(0) + marketId.length + index
    );
    const baseValue = baseValues[index];
    const volatility = 3 + random() * 7; // 3-10% volatility
    const trend = (random() - 0.5) * 1.5; // Slight trend

    const data = generateSmoothCurve(
      timePoints,
      baseValue || 0,
      volatility,
      trend,
      random
    );

    series.push({
      id: `${marketId}-${label.toLowerCase().replace(/\s+/g, '-')}`,
      label,
      data,
    });
  });

  return series;
}

/**
 * Format timestamp for display
 */
export function formatTimeLabel(timestamp: number, range: TimeRange): string {
  const date = new Date(timestamp);

  switch (range) {
    case '1H':
    case '6H':
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    case '1D':
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    case '1W':
    case '1M':
    case 'ALL':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    default:
      return date.toLocaleString();
  }
}
