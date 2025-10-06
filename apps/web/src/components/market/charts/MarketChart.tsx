'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Series, formatTimeLabel, type TimeRange } from '@/lib/mockSeries';
import { getDefaultOutcomeColor } from '@/lib/colors';

export type MarketChartVariant = 'chance' | 'multi';

export interface MarketChartProps {
  variant: MarketChartVariant;
  series: Series[];
  showChanceHeader?: boolean;
  currentChancePct?: number | undefined;
  timeRange: TimeRange;
  className?: string;
}

// Custom tooltip: we hide the floating tooltip and instead render labels near each line via active dots
const CustomTooltip = () => null;

// Custom active dot that renders a colored pill label anchored near the line point
const CustomActiveDot = ({ cx, cy, stroke, payload, color, label }: any) => {
  if (typeof cx !== 'number' || typeof cy !== 'number') return null;
  const value = typeof payload?.p === 'number' ? payload.p : 0;
  const bg = color || stroke || '#3B82F6';
  const text = `${label ?? ''} ${Math.round(value * 10) / 10}%`;
  const paddingX = 6;
  const paddingY = 3;
  const charWidth = 6.5; // rough estimate for width calculation
  const width = Math.max(28, Math.round(text.length * charWidth) + paddingX * 2);
  const height = 18;

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} stroke={bg} strokeWidth={2} fill={bg} />
      <g transform={`translate(${cx + 8}, ${cy - height + 2})`}>
        <rect x={0} y={0} width={width} height={height} rx={6} ry={6} fill={bg} />
        <text
          x={width / 2}
          y={height / 2 + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="#fff"
        >
          {text}
        </text>
      </g>
    </g>
  );
};

export function MarketChart({
  variant,
  series,
  showChanceHeader = true,
  currentChancePct,
  timeRange,
  className = '',
}: MarketChartProps) {
  if (!series || series.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Calculate change percentage for chance markets
  const calculateChange = () => {
    if (variant !== 'chance' || !series[0]?.data || series[0].data.length < 2)
      return 0;

    const data = series[0].data;
    const current = data[data.length - 1]?.p || 0;

    // Look at a few data points back to get a more meaningful change
    const lookback = Math.min(3, data.length - 1);
    const previous = data[data.length - 1 - lookback]?.p || 0;

    return current - previous;
  };

  const change = calculateChange();
  const changePct = Math.abs(change).toFixed(1);
  const isPositive = change > 0;

  // For chance variant, show header with current percentage and change
  const chanceHeader =
    variant === 'chance' &&
    showChanceHeader &&
    currentChancePct !== undefined ? (
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(currentChancePct)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">chance</div>
          {change !== 0 && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              <span className="text-xs">{isPositive ? '▲' : '▼'}</span>
              {changePct}%
            </div>
          )}
        </div>
      </div>
    ) : null;

  return (
    <div className={`w-full ${className}`}>
      {chanceHeader}

      <div className="h-32 md:h-56 relative mb-8">
        {/* Custom horizontal lines that extend full width */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 25, 50, 75, 100].map((value, index) => (
            <div
              key={index}
              className="absolute border-t border-dashed border-gray-300 dark:border-gray-600"
              style={{
                top: `${5 + (value / 100) * (100 - 10)}%`, // 5% top margin, 10% total margin
                height: '1px',
                left: '0',
                right: '40px', // Leave space for percentage labels
              }}
            />
          ))}
        </div>

        {/* Custom percentage labels positioned in front of horizontal lines */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {[0, 25, 50, 75, 100].map((value, index) => (
            <div
              key={value}
              className="absolute text-xs text-gray-600 dark:text-gray-400"
              style={{
                top: `${5 + ((100 - value) / 100) * (100 - 10)}%`, // Invert positioning: 0% at bottom, 100% at top
                right: '8px',
                transform: 'translateY(-50%)', // Center the text on the line
              }}
            >
              {value}%
            </div>
          ))}
        </div>

        {/* Custom time labels positioned below the bottom dotted line */}
        <div className="absolute -bottom-6 md:-bottom-3 left-0 right-10 pointer-events-none z-10">
          <div
            className="flex items-center h-6 px-2 md:px-8"
            style={{ justifyContent: 'space-evenly' }}
          >
            {series[0]?.data &&
              series[0].data.length > 0 &&
              (() => {
                const data = series[0].data;
                const timePoints = [
                  data[0], // First point
                  data[Math.floor(data.length * 0.25)], // 25% point
                  data[Math.floor(data.length * 0.5)], // 50% point
                  data[Math.floor(data.length * 0.75)], // 75% point
                  data[data.length - 1], // Last point
                ].filter(Boolean);

                return timePoints.map((point, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    {point?.t ? formatTimeLabel(point.t, timeRange) : ''}
                  </div>
                ));
              })()}
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series[0]?.data || []}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              className="dark:stroke-gray-700"
              horizontal={false}
              vertical={false}
            />

            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tick={false}
              axisLine={false}
            />

            <YAxis
              orientation="right"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />

            <Tooltip
              content={() => null}
              cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            {variant === 'chance' ? (
              // Single line for chance markets
              <Line
                type="monotone"
                dataKey="p"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            ) : (
              // Multiple lines for multi-outcome markets - each with individual tooltip
              series.map((s, index) => {
                const color = s.color ?? getDefaultOutcomeColor(index);
                return (
                  <Line
                    key={s.id}
                    type="monotone"
                    dataKey="p"
                    data={s.data}
                    name={s.label}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={(props: any) => (
                      <CustomActiveDot {...props} color={color} label={s.label} />
                    )}
                    label={({ x, y, value, index: pointIndex }: any) => {
                      // Only show label for the active point (when hovering)
                      return null; // Labels will be shown via Tooltip instead
                    }}
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
