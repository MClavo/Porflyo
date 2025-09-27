/**
 * TrendsPage - Bigger picture view with minimal noise
 * Goal: high-level trends analysis across time periods
 */

import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Skeleton,
  Grid,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { useTrendsPageData } from '../hooks/metrics/useTrendsPageData';

interface ChartPanelProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ title, children, isLoading = false }) => (
  <Box
    bg='white'
    p={4}
    borderRadius='md'
    boxShadow='sm'
    border='1px'
    borderColor='gray.100'
    height='300px'
  >
    <Text fontSize='sm' fontWeight='medium' mb={3} color='gray.600'>
      {title}
    </Text>
    {isLoading ? (
      <Skeleton height='250px' />
    ) : (
      <Box height='250px'>
        {children}
      </Box>
    )}
  </Box>
);

const TrendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'series'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

  const {
    calendarData,
    visitsData,
    engagementData,
    ttfiData,
    availableMonths,
    isLoading,
    error,
  } = useTrendsPageData(selectedMonth);

  if (error) {
    return (
      <Box p={6}>
        <Text color='red.500'>Error loading trends data: {error}</Text>
      </Box>
    );
  }

  const currentMonth = selectedMonth || (availableMonths[0]?.value || '');
  const startDate = new Date(currentMonth + '-01');
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  return (
    <Box p={6} maxW='7xl' mx='auto'>
      {/* Header */}
      <Text fontSize='2xl' fontWeight='bold' mb={6} color='gray.800'>
        Trends
      </Text>

      {/* Tabs */}
      <HStack mb={6} borderBottom='1px' borderColor='gray.200'>
        {['calendar', 'series'].map((tabName) => (
          <Box
            key={tabName}
            as='button'
            px={4}
            py={2}
            fontWeight={activeTab === tabName ? 'bold' : 'medium'}
            color={activeTab === tabName ? 'blue.600' : 'gray.600'}
            borderBottom='2px'
            borderColor={activeTab === tabName ? 'blue.600' : 'transparent'}
            onClick={() => setActiveTab(tabName as 'calendar' | 'series')}
            cursor='pointer'
            _hover={{ color: 'blue.600' }}
            textTransform='capitalize'
          >
            {tabName}
          </Box>
        ))}
      </HStack>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <VStack gap={6} align='stretch'>
          {/* Month Selector */}
          <HStack justify='space-between' align='center'>
            <Text fontSize='lg' fontWeight='medium' color='gray.700'>
              Monthly Visits Overview
            </Text>
            <HStack>
              <Text fontSize='sm' fontWeight='medium' color='gray.600'>
                Month:
              </Text>
              <select
                value={currentMonth}
                onChange={(e) => setSelectedMonth(e.target.value || undefined)}
                style={{
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  minWidth: '140px'
                }}
              >
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </HStack>
          </HStack>

          {/* Calendar Heatmap */}
          <Box
            bg='white'
            p={6}
            borderRadius='md'
            boxShadow='sm'
            border='1px'
            borderColor='gray.100'
          >
            <CalendarHeatmap
              data={calendarData.map(item => ({
                day: item.date,
                value: item.value
              }))}
              isLoading={isLoading}
              height={200}
              from={startDate.toISOString().split('T')[0]}
              to={endDate.toISOString().split('T')[0]}
            />
          </Box>
        </VStack>
      )}

      {/* Series Tab */}
      {activeTab === 'series' && (
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
          {/* Stacked Area - Visits by Device */}
          <ChartPanel title='Visits by Device' isLoading={isLoading}>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={visitsData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis 
                  dataKey='date' 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'desktop' ? 'Desktop' : 'Mobile/Tablet'
                  ]}
                />
                <Area
                  type='monotone'
                  dataKey='desktop'
                  stackId='1'
                  stroke='#3182ce'
                  fill='#3182ce'
                  fillOpacity={0.6}
                />
                <Area
                  type='monotone'
                  dataKey='mobile'
                  stackId='1'
                  stroke='#805ad5'
                  fill='#805ad5'
                  fillOpacity={0.6}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>

          {/* Line - Engagement */}
          <ChartPanel title='Engagement Average' isLoading={isLoading}>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis 
                  dataKey='date' 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [value.toFixed(2), 'Engagement']}
                />
                <Line
                  type='monotone'
                  dataKey='value'
                  stroke='#38a169'
                  strokeWidth={2}
                  dot={{ fill: '#38a169', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          {/* Line - TTFI */}
          <ChartPanel title='Time to First Interaction (ms)' isLoading={isLoading}>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={ttfiData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis 
                  dataKey='date' 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [
                    `${value.toFixed(0)}ms`, 
                    'TTFI'
                  ]}
                />
                <Line
                  type='monotone'
                  dataKey='value'
                  stroke='#ed8936'
                  strokeWidth={2}
                  dot={{ fill: '#ed8936', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
      )}
    </Box>
  );
};

export default TrendsPage;