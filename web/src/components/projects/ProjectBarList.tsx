/**
 * Horizontal bar chart for project metrics
 * Uses Chakra Charts with mount-only animations
 */

import { useMemo } from 'react';
import { Box, Skeleton, VStack, Text } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface ProjectBarListProps {
  items: Array<{
    projectId: number;
    label: string;
    value: number;
  }>;
  isLoading?: boolean;
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
  title?: string;
}

export function ProjectBarList({ 
  items, 
  isLoading = false, 
  height = 300,
  color = "#3182ce",
  valueFormatter = (value) => value.toString(),
  title
}: ProjectBarListProps) {
  // Memoize sorted data to prevent re-animations on every render
  const chartData = useMemo(() => 
    [...items].sort((a, b) => b.value - a.value),
    [items]
  );
  
  // Animation key that only changes on mount
  const animationKey = useMemo(() => Date.now(), []);

  const chart = useChart({
    data: chartData,
    series: [
      { name: 'value', color: 'blue.solid', label: 'Value' },
    ],
  });

  if (isLoading) {
    return (
      <VStack align="stretch" gap={4}>
        {title && <Skeleton height="20px" width="150px" />}
        <Skeleton height={`${height}px`} borderRadius="md" />
      </VStack>
    );
  }

  if (items.length === 0) {
    return (
      <VStack align="center" justify="center" height={`${height}px`} gap={4}>
        <Text color="gray.500" fontSize="sm">
          No project data available
        </Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {title && (
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          {title}
        </Text>
      )}
      
      <Box height={`${height}px`} width="100%">
        <Chart.Root maxH={`${height}px`} chart={chart} key={animationKey}>
          <BarChart
            data={chart.data}
            layout="horizontal"
            margin={{
              top: 20,
              right: 30,
              left: 80,
              bottom: 5,
            }}
          >
            <CartesianGrid stroke={chart.color('border')} strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              axisLine={false}
              tick={{ fontSize: 12 }}
              stroke={chart.color('border')}
              tickFormatter={valueFormatter}
            />
            <YAxis 
              type="category" 
              dataKey={chart.key('label')} 
              axisLine={false}
              tick={{ fontSize: 12 }}
              stroke={chart.color('border')}
              width={70}
            />
            <Tooltip
              animationDuration={100}
              cursor={false}
              content={<Chart.Tooltip />}
            />
            {chart.series.map((item) => (
              <Bar 
                key={item.name}
                dataKey={chart.key(item.name)} 
                fill={color}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false} // Disable re-animations
              />
            ))}
          </BarChart>
        </Chart.Root>
      </Box>
    </VStack>
  );
}