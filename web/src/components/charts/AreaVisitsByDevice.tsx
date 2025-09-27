/**
 * Area chart showing visits by device type over time
 * Uses Chakra Charts with mount-only animations
 */

import { useMemo } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
  // Memoize chart data to prevent re-animations on every render
  const chartData = useMemo(() => data, [data]);
  
  // Animation key that only changes on mount
  const animationKey = useMemo(() => Date.now(), []);

  const chart = useChart({
    data: chartData,
    series: [
      { name: 'mobile', color: 'blue.solid', label: '📱 Mobile' },
      { name: 'desktop', color: 'gray.solid', label: '💻 Desktop' },
    ],
  });

  if (isLoading) {
    return <Skeleton height={`${height}px`} borderRadius="md" />;
  }

  return (
    <Box height={`${height}px`} width="100%">
      <Chart.Root maxH={`${height}px`} chart={chart} key={animationKey}>
        <AreaChart data={chart.data}>
          <CartesianGrid stroke={chart.color('border')} strokeDasharray="3 3" />
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
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip />}
          />
          {chart.series.map((item) => (
            <Area
              key={item.name}
              type="monotone"
              dataKey={chart.key(item.name)}
              stackId="device"
              stroke={chart.color(item.color)}
              fill={chart.color(item.color)}
              fillOpacity={0.6}
              isAnimationActive={false} // Disable re-animations
            />
          ))}
        </AreaChart>
      </Chart.Root>
    </Box>
  );
}