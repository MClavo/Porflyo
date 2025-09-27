/**
 * Horizontal bar chart for project metrics
 */

import { Box, Skeleton, VStack, Text } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Sort items by value (descending) for better visualization
  const sortedItems = [...items].sort((a, b) => b.value - a.value);

  return (
    <VStack align="stretch" gap={4}>
      {title && (
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          {title}
        </Text>
      )}
      
      <Box height={`${height}px`} width="100%">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedItems}
            layout="horizontal"
            margin={{
              top: 20,
              right: 30,
              left: 80,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              tick={{ fontSize: 12 }}
              tickFormatter={valueFormatter}
            />
            <YAxis 
              type="category" 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [
                valueFormatter(value),
                'Value'
              ]}
              labelFormatter={(label: string) => `Project: ${label}`}
            />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[0, 4, 4, 0]}
              animationDuration={800}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  );
}