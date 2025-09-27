/**
 * Area chart showing visits by device type over time
 */

import { Box, Skeleton } from '@chakra-ui/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface AreaVisitsByDeviceProps {
  data: Array<{
    date: string;
    desktop: number;
    mobile: number;
  }>;
  isLoading?: boolean;
  height?: number;
}

export function AreaVisitsByDevice({ 
  data, 
  isLoading = false, 
  height = 300 
}: AreaVisitsByDeviceProps) {
  if (isLoading) {
    return <Skeleton height={`${height}px`} borderRadius="md" />;
  }

  return (
    <Box height={`${height}px`} width="100%">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
          <YAxis tick={{ fontSize: 12 }} />
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
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              name === 'desktop' ? '💻 Desktop' : '📱 Mobile'
            ]}
          />
          <Area
            type="monotone"
            dataKey="mobile"
            stackId="1"
            stroke="#3182ce"
            fill="#3182ce"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="desktop"
            stackId="1"
            stroke="#718096"
            fill="#718096"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}