/**
 * Line chart showing engagement metrics over time
 */

import { Box, Skeleton } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface LineEngagementProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  isLoading?: boolean;
  height?: number;
  color?: string;
  label?: string;
  formatValue?: (value: number) => string;
}

export function LineEngagement({ 
  data, 
  isLoading = false, 
  height = 300,
  color = "#3182ce",
  label = "Engagement",
  formatValue = (value) => value.toFixed(1)
}: LineEngagementProps) {
  if (isLoading) {
    return <Skeleton height={`${height}px`} borderRadius="md" />;
  }

  return (
    <Box height={`${height}px`} width="100%">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              });
            }}
            formatter={(value: number) => [formatValue(value), label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}