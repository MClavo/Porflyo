/**
 * DailyPage - Zoom into a specific day with detailed metrics
 * Goal: detailed daily analysis with project-level insights
 */

import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Skeleton,
  Grid,
  Badge,
} from '@chakra-ui/react';
import { useDailyPageData, type DailySortBy } from '../hooks/metrics/useDailyPageData';

interface KPICardProps {
  label: string;
  value: string;
  colorScheme?: string;
  isLoading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  label, 
  value, 
  colorScheme = 'blue',
  isLoading = false 
}) => (
  <Box
    bg='white'
    p={4}
    borderRadius='md'
    boxShadow='sm'
    border='1px'
    borderColor='gray.100'
  >
    <Text fontSize='sm' color='gray.600' mb={1}>
      {label}
    </Text>
    {isLoading ? (
      <Skeleton height='24px' />
    ) : (
      <Text fontSize='2xl' fontWeight='bold' color={`${colorScheme}.600`}>
        {value}
      </Text>
    )}
  </Box>
);

interface ProjectTableRowProps {
  project: {
    projectId: number;
    exposures: number;
    viewTimeMs: number;
    avgViewTimeMs: number | null;
    codeCtr: number | null;
    liveCtr: number | null;
  };
  maxValues: {
    exposures: number;
    viewTimeMs: number;
    avgViewTimeMs: number;
    codeCtr: number;
    liveCtr: number;
  };
  formatValue: (value: number | null, type: DailySortBy) => string;
  getProjectName: (projectId: number) => string;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  project,
  maxValues,
  formatValue,
  getProjectName,
}) => {
  const getProgressWidth = (value: number | null, maxValue: number): number => {
    if (!value || !maxValue) return 0;
    return Math.min((value / maxValue) * 100, 100);
  };

  return (
    <Box
      bg='white'
      p={4}
      borderRadius='md'
      boxShadow='sm'
      border='1px'
      borderColor='gray.100'
    >
      <Grid templateColumns='2fr 1fr 1fr 1fr 1fr 1fr' gap={4} alignItems='center'>
        {/* Project Name */}
        <VStack align='start' gap={1}>
          <Text fontWeight='medium'>{getProjectName(project.projectId)}</Text>
          <Text fontSize='xs' color='gray.500'>ID: {project.projectId}</Text>
        </VStack>

        {/* Exposures */}
        <VStack align='start' gap={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {formatValue(project.exposures, 'exposures')}
          </Text>
          <Box w='100%' bg='gray.100' height='4px' borderRadius='full'>
            <Box
              bg='blue.400'
              height='100%'
              width={`${getProgressWidth(project.exposures, maxValues.exposures)}%`}
              borderRadius='full'
              transition='width 0.3s ease'
            />
          </Box>
        </VStack>

        {/* View Time */}
        <VStack align='start' gap={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {formatValue(project.viewTimeMs, 'viewTimeMs')}
          </Text>
          <Box w='100%' bg='gray.100' height='4px' borderRadius='full'>
            <Box
              bg='green.400'
              height='100%'
              width={`${getProgressWidth(project.viewTimeMs, maxValues.viewTimeMs)}%`}
              borderRadius='full'
              transition='width 0.3s ease'
            />
          </Box>
        </VStack>

        {/* Avg View Time */}
        <VStack align='start' gap={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {formatValue(project.avgViewTimeMs, 'avgViewTimeMs')}
          </Text>
          <Box w='100%' bg='gray.100' height='4px' borderRadius='full'>
            <Box
              bg='purple.400'
              height='100%'
              width={`${getProgressWidth(project.avgViewTimeMs, maxValues.avgViewTimeMs)}%`}
              borderRadius='full'
              transition='width 0.3s ease'
            />
          </Box>
        </VStack>

        {/* Code CTR */}
        <VStack align='start' gap={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {formatValue(project.codeCtr, 'codeCtr')}
          </Text>
          <Box w='100%' bg='gray.100' height='4px' borderRadius='full'>
            <Box
              bg='orange.400'
              height='100%'
              width={`${getProgressWidth(project.codeCtr, maxValues.codeCtr)}%`}
              borderRadius='full'
              transition='width 0.3s ease'
            />
          </Box>
        </VStack>

        {/* Live CTR */}
        <VStack align='start' gap={1}>
          <Text fontSize='sm' fontWeight='medium'>
            {formatValue(project.liveCtr, 'liveCtr')}
          </Text>
          <Box w='100%' bg='gray.100' height='4px' borderRadius='full'>
            <Box
              bg='red.400'
              height='100%'
              width={`${getProgressWidth(project.liveCtr, maxValues.liveCtr)}%`}
              borderRadius='full'
              transition='width 0.3s ease'
            />
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

const TableHeader: React.FC<{
  sortBy: DailySortBy;
  sortDirection: 'asc' | 'desc';
  onSort: (field: DailySortBy) => void;
}> = ({ sortBy, sortDirection, onSort }) => {
  const getSortIcon = (field: DailySortBy) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'desc' ? '↓' : '↑';
  };

  const headerStyle = {
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#4a5568',
    padding: '8px 4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  };

  return (
    <Grid templateColumns='2fr 1fr 1fr 1fr 1fr 1fr' gap={4} mb={3}>
      <Box style={headerStyle}>Project</Box>
      <Box
        style={{
          ...headerStyle,
          backgroundColor: sortBy === 'exposures' ? '#e2e8f0' : undefined
        }}
        onClick={() => onSort('exposures')}
      >
        Exposures {getSortIcon('exposures')}
      </Box>
      <Box
        style={{
          ...headerStyle,
          backgroundColor: sortBy === 'viewTimeMs' ? '#e2e8f0' : undefined
        }}
        onClick={() => onSort('viewTimeMs')}
      >
        View Time {getSortIcon('viewTimeMs')}
      </Box>
      <Box
        style={{
          ...headerStyle,
          backgroundColor: sortBy === 'avgViewTimeMs' ? '#e2e8f0' : undefined
        }}
        onClick={() => onSort('avgViewTimeMs')}
      >
        Avg Time {getSortIcon('avgViewTimeMs')}
      </Box>
      <Box
        style={{
          ...headerStyle,
          backgroundColor: sortBy === 'codeCtr' ? '#e2e8f0' : undefined
        }}
        onClick={() => onSort('codeCtr')}
      >
        Code CTR {getSortIcon('codeCtr')}
      </Box>
      <Box
        style={{
          ...headerStyle,
          backgroundColor: sortBy === 'liveCtr' ? '#e2e8f0' : undefined
        }}
        onClick={() => onSort('liveCtr')}
      >
        Live CTR {getSortIcon('liveCtr')}
      </Box>
    </Grid>
  );
};

const DailyPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<DailySortBy>('exposures');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const {
    selectedDate: currentDate,
    availableDates,
    dailyKpis,
    projectRows,
    formatValue,
    getProjectName,
    isLoading,
    error,
  } = useDailyPageData(selectedDate, sortBy, sortDirection);

  const handleSort = (field: DailySortBy) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  if (error) {
    return (
      <Box p={6}>
        <Text color='red.500'>Error loading daily data: {error}</Text>
      </Box>
    );
  }

  // Calculate max values for progress bars
  const maxValues = {
    exposures: Math.max(...projectRows.map(p => p.exposures), 1),
    viewTimeMs: Math.max(...projectRows.map(p => p.viewTimeMs), 1),
    avgViewTimeMs: Math.max(...projectRows.map(p => p.avgViewTimeMs || 0), 1),
    codeCtr: Math.max(...projectRows.map(p => p.codeCtr || 0), 0.01),
    liveCtr: Math.max(...projectRows.map(p => p.liveCtr || 0), 0.01),
  };

  return (
    <Box p={6} maxW='7xl' mx='auto'>
      {/* Header with Date Picker */}
      <HStack justify='space-between' align='center' mb={6}>
        <Text fontSize='2xl' fontWeight='bold' color='gray.800'>
          Daily
        </Text>
        <HStack>
          <Text fontSize='sm' fontWeight='medium' color='gray.600'>
            Date:
          </Text>
          <select
            value={currentDate || ''}
            onChange={(e) => setSelectedDate(e.target.value || undefined)}
            style={{
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              minWidth: '140px'
            }}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </HStack>
      </HStack>

      {/* KPIs Row */}
      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap={4} mb={8}>
        <KPICard
          label='Views'
          value={dailyKpis?.totalViews?.toLocaleString() || '—'}
          colorScheme='blue'
          isLoading={isLoading}
        />
        <KPICard
          label='Avg Session'
          value={
            dailyKpis?.avgSessionMs
              ? dailyKpis.avgSessionMs >= 1000
                ? `${(dailyKpis.avgSessionMs / 1000).toFixed(1)}s`
                : `${Math.round(dailyKpis.avgSessionMs)}ms`
              : '—'
          }
          colorScheme='green'
          isLoading={isLoading}
        />
        <KPICard
          label='Engagement'
          value={
            dailyKpis?.engagementAvg !== null
              ? (dailyKpis?.engagementAvg || 0).toFixed(2)
              : '—'
          }
          colorScheme='purple'
          isLoading={isLoading}
        />
        <KPICard
          label='Desktop'
          value={
            dailyKpis?.deviceMix?.desktopPct !== null
              ? `${((dailyKpis?.deviceMix?.desktopPct || 0) * 100).toFixed(1)}%`
              : '—'
          }
          colorScheme='orange'
          isLoading={isLoading}
        />
        <KPICard
          label='Mobile'
          value={
            dailyKpis?.deviceMix?.mobileTabletPct !== null
              ? `${((dailyKpis?.deviceMix?.mobileTabletPct || 0) * 100).toFixed(1)}%`
              : '—'
          }
          colorScheme='pink'
          isLoading={isLoading}
        />
        <KPICard
          label='Quality Rate'
          value={
            dailyKpis?.qualityVisitRate !== null
              ? `${((dailyKpis?.qualityVisitRate || 0) * 100).toFixed(1)}%`
              : '—'
          }
          colorScheme='teal'
          isLoading={isLoading}
        />
      </Grid>

      {/* Medium PortfolioHeatmap Placeholder */}
      <Box
        bg='gray.50'
        p={8}
        borderRadius='md'
        textAlign='center'
        border='2px dashed'
        borderColor='gray.200'
        mb={8}
        height='300px'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <VStack>
          <Text color='gray.500' fontSize='lg' fontWeight='medium'>
            Portfolio Heatmap
          </Text>
          <Text color='gray.400' fontSize='sm'>
            Visual portfolio overlay for {currentDate ? new Date(currentDate).toLocaleDateString() : 'selected date'}
          </Text>
        </VStack>
      </Box>

      {/* Projects Day Table */}
      <Box>
        <HStack justify='space-between' align='center' mb={4}>
          <Text fontSize='lg' fontWeight='bold' color='gray.800'>
            Projects Performance
          </Text>
          <Badge colorScheme='blue' fontSize='xs'>
            {projectRows.length} projects
          </Badge>
        </HStack>

        <TableHeader
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <VStack gap={3} align='stretch'>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height='80px' borderRadius='md' />
            ))
          ) : projectRows.length > 0 ? (
            projectRows.map((project) => (
              <ProjectTableRow
                key={project.projectId}
                project={project}
                maxValues={maxValues}
                formatValue={formatValue}
                getProjectName={getProjectName}
              />
            ))
          ) : (
            <Box
              bg='gray.50'
              p={8}
              borderRadius='md'
              textAlign='center'
              border='2px dashed'
              borderColor='gray.200'
            >
              <Text color='gray.500'>
                No project data available for {currentDate ? new Date(currentDate).toLocaleDateString() : 'this date'}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default DailyPage;