"use client";

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Series, formatTimeLabel, type TimeRange } from '@/lib/mockSeries';

export type MarketChartVariant = "chance" | "multi";

export interface MarketChartProps {
  variant: MarketChartVariant;
  series: Series[];
  showChanceHeader?: boolean;
  currentChancePct?: number | undefined;
  timeRange: TimeRange;
  className?: string;
}

// Color palette for multi-outcome charts
const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, timeRange, variant }: any) => {
  if (active && payload && payload.length) {
    const timeLabel = formatTimeLabel(label, timeRange);
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{timeLabel}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {variant === "chance" ? "Chance" : entry.dataKey}: {entry.value}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export function MarketChart({
  variant,
  series,
  showChanceHeader = true,
  currentChancePct,
  timeRange,
  className = ""
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
    if (variant !== "chance" || !series[0]?.data || series[0].data.length < 2) return 0;
    
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
  const chanceHeader = variant === "chance" && showChanceHeader && currentChancePct !== undefined ? (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {Math.round(currentChancePct)}%
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">chance</div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            <span className="text-xs">
              {isPositive ? '▲' : '▼'}
            </span>
            {changePct}%
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className={`w-full ${className}`}>
      {chanceHeader}
      
      <div className="h-64 relative">
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
                right: '40px' // Leave space for percentage labels
              }}
            />
          ))}
        </div>

        {/* Custom percentage labels positioned in front of horizontal lines */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {[100, 75, 50, 25, 0].map((value, index) => (
            <div
              key={value}
              className="absolute text-xs text-gray-600 dark:text-gray-400"
              style={{
                top: `${5 + (value / 100) * (100 - 10)}%`, // Match horizontal line position
                right: '8px',
                transform: 'translateY(-50%)' // Center the text on the line
              }}
            >
              {value}%
            </div>
          ))}
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
              tickFormatter={(value) => formatTimeLabel(value, timeRange)}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              className="dark:fill-gray-400"
              axisLine={false}
            />
            
            <YAxis
              orientation="right"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            
            <Tooltip content={<CustomTooltip timeRange={timeRange} variant={variant} />} />
            
            {variant === "chance" ? (
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
              // Multiple lines for multi-outcome markets
              series.map((s, index) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey="p"
                  data={s.data}
                  name={s.label}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: CHART_COLORS[index % CHART_COLORS.length] || '#3B82F6', strokeWidth: 2 }}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
