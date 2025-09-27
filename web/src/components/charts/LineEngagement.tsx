/**
 * Line chart showing engagement metrics over time
 * Uses Chakra Charts with mount-only animations
 */

import { useMemo } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
  // Memoize chart data to prevent re-animations on every render
  const chartData = useMemo(() => data, [data]);
  
  // Animation key that only changes on mount
  const animationKey = useMemo(() => Date.now(), []);

  const chart = useChart({
    data: chartData,
    series: [
      { name: 'value', color: 'blue.solid', label },
    ],
  });

  if (isLoading) {
    return <Skeleton height={`${height}px`} borderRadius="md" />;
  }

  return (
    <Box height={`${height}px`} width="100%">
      <Chart.Root maxH={`${height}px`} chart={chart} key={animationKey}>
        <LineChart data={chart.data}>
          <CartesianGrid stroke={chart.color('border')} strokeDasharray="3 3" vertical={false} />
          <XAxis 
            axisLine={false}
            dataKey={chart.key('date')}
            tick={{ fontSize: 12 }}
            stroke={chart.color('border')}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            stroke={chart.color('border')}
            tickFormatter={formatValue}
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip />}
          />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              type="monotone"
              dataKey={chart.key(item.name)}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              isAnimationActive={false} // Disable re-animations
            />
          ))}
        </LineChart>
      </Chart.Root>
    </Box>
  );
}