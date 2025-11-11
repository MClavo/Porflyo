/**
 * ProjectsPage - Prioritize projects with actionable insights
 * Goal: simple, actionable project rankings and comparisons
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProjectsData, type SortBy } from '../hooks/metrics/useProjectsData';

interface RankingBarProps {
  project: {
    projectId: number;
    avgViewTimeMs: number | null;
    codeCtr: number | null;
    liveCtr: number | null;
  };
  rank: number;
  maxValue: number;
  sortBy: SortBy;
  formatValue: (value: number | null, type: SortBy) => string;
  getProjectName: (projectId: number) => string;
}

const RankingBar: React.FC<RankingBarProps> = ({
  project,
  rank,
  maxValue,
  sortBy,
  formatValue,
  getProjectName,
}) => {
  let value: number | null = null;
  let colorScheme = 'blue';

  switch (sortBy) {
    case 'avgViewTime':
      value = project.avgViewTimeMs;
      colorScheme = 'blue';
      break;
    case 'codeCtr':
      value = project.codeCtr;
      colorScheme = 'green';
      break;
    case 'liveCtr':
      value = project.liveCtr;
      colorScheme = 'purple';
      break;
  }

  const percentage = value && maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <Box
      key={project.projectId}
      p={3}
      bg='white'
      borderRadius='md'
      boxShadow='sm'
      border='1px'
      borderColor='gray.100'
    >
      <HStack justify='space-between' mb={2}>
        <HStack>
          <Box
            bg='gray.100'
            color='gray.600'
            fontSize='xs'
            fontWeight='bold'
            px={2}
            py={1}
            borderRadius='full'
            minW='24px'
            textAlign='center'
          >
            {rank + 1}
          </Box>
          <Text fontWeight='medium'>{getProjectName(project.projectId)}</Text>
        </HStack>
        <Text fontWeight='bold' color={`${colorScheme}.600`}>
          {formatValue(value, sortBy)}
        </Text>
      </HStack>
      <Box bg='gray.50' height='6px' borderRadius='full' overflow='hidden'>
        <Box
          bg={`${colorScheme}.400`}
          height='100%'
          width={`${percentage}%`}
          borderRadius='full'
          transition='width 0.6s ease'
        />
      </Box>
    </Box>
  );
};

const ProjectsPage: React.FC = () => {
  const [rangeDays, setRangeDays] = useState(30);
  const [sortBy, setSortBy] = useState<SortBy>('avgViewTime');
  const [projectAId, setProjectAId] = useState<number | null>(null);
  const [projectBId, setProjectBId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const {
    avgViewTimeRanking,
    codeCtrRanking,
    liveCtrRanking,
    allProjects,
    getComparisonData,
    formatValue,
    getProjectName,
    isLoading,
    error,
  } = useProjectsData(rangeDays, sortBy);

  // Get comparison chart data
  const comparisonData = 
    projectAId && projectBId 
      ? getComparisonData(projectAId, projectBId)
      : { projectA: [], projectB: [] };

  const chartData = comparisonData.projectA.map((pointA, index) => ({
    date: pointA.date,
    projectA: pointA.value,
    projectB: comparisonData.projectB[index]?.value || null,
  }));

  if (error) {
    return (
      <Box p={6}>
        <Text color='red.500'>Error loading projects data: {error}</Text>
      </Box>
    );
  }

  // Calculate max values for progress bars  
  const maxAvgViewTime = Math.max(...avgViewTimeRanking.map(p => p.avgViewTimeMs || 0));
  const maxCodeCtr = Math.max(...codeCtrRanking.map(p => p.codeCtr || 0));
  const maxLiveCtr = Math.max(...liveCtrRanking.map(p => p.liveCtr || 0));

  return (
    <Box p={6} maxW='7xl' mx='auto'>
      {/* Header */}
      <Text fontSize='2xl' fontWeight='bold' mb={6} color='gray.800'>
        Projects
      </Text>

      {/* Controls Bar */}
      <HStack mb={6} gap={4} flexWrap='wrap'>
        <HStack>
          <Text fontSize='sm' fontWeight='medium' color='gray.600'>
            Range:
          </Text>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            style={{
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              minWidth: '80px'
            }}
          >
            <option value={10}>10d</option>
            <option value={30}>30d</option>
            <option value={60}>60d</option>
          </select>
        </HStack>

        <HStack>
          <Text fontSize='sm' fontWeight='medium' color='gray.600'>
            Sort by:
          </Text>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              minWidth: '120px'
            }}
          >
            <option value='avgViewTime'>Avg Time</option>
            <option value='codeCtr'>Code CTR</option>
            <option value='liveCtr'>Live CTR</option>
          </select>
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Rankings Tabs */}
        <Box>
          {/* Tab Headers */}
          <HStack mb={4} borderBottom='1px' borderColor='gray.200'>
            {['Avg View Time', 'Code CTR', 'Live CTR'].map((tabName, index) => (
              <Box
                key={index}
                as='button'
                px={4}
                py={2}
                fontWeight={activeTab === index ? 'bold' : 'medium'}
                color={activeTab === index ? 'blue.600' : 'gray.600'}
                borderBottom='2px'
                borderColor={activeTab === index ? 'blue.600' : 'transparent'}
                onClick={() => setActiveTab(index)}
                cursor='pointer'
                _hover={{ color: 'blue.600' }}
              >
                {tabName}
              </Box>
            ))}
          </HStack>

          {/* Tab Content */}
          {/* Avg View Time Ranking */}
          {activeTab === 0 && (
            <VStack gap={3} align='stretch'>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height='70px' borderRadius='md' />
                ))
              ) : (
                avgViewTimeRanking.slice(0, 10).map((project, index) => (
                  <RankingBar
                    key={project.projectId}
                    project={project}
                    rank={index}
                    maxValue={maxAvgViewTime}
                    sortBy='avgViewTime'
                    formatValue={formatValue}
                    getProjectName={getProjectName}
                  />
                ))
              )}
            </VStack>
          )}

          {/* Code CTR Ranking */}
          {activeTab === 1 && (
            <VStack gap={3} align='stretch'>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height='70px' borderRadius='md' />
                ))
              ) : (
                codeCtrRanking.slice(0, 10).map((project, index) => (
                  <RankingBar
                    key={project.projectId}
                    project={project}
                    rank={index}
                    maxValue={maxCodeCtr}
                    sortBy='codeCtr'
                    formatValue={formatValue}
                    getProjectName={getProjectName}
                  />
                ))
              )}
            </VStack>
          )}

          {/* Live CTR Ranking */}
          {activeTab === 2 && (
            <VStack gap={3} align='stretch'>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height='70px' borderRadius='md' />
                ))
              ) : (
                liveCtrRanking.slice(0, 10).map((project, index) => (
                  <RankingBar
                    key={project.projectId}
                    project={project}
                    rank={index}
                    maxValue={maxLiveCtr}
                    sortBy='liveCtr'
                    formatValue={formatValue}
                    getProjectName={getProjectName}
                  />
                ))
              )}
            </VStack>
          )}
        </Box>

        {/* Comparison Block */}
        <Box>
          <Text fontSize='lg' fontWeight='bold' mb={4} color='gray.800'>
            Compare Projects
          </Text>

          <VStack gap={4} align='stretch'>
            {/* Project Selectors */}
            <HStack>
              <VStack align='stretch' flex={1}>
                <Text fontSize='sm' fontWeight='medium' color='gray.600'>
                  Project A
                </Text>
                <select
                  value={projectAId || ''}
                  onChange={(e) => setProjectAId(Number(e.target.value) || null)}
                  style={{
                    fontSize: '14px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    width: '100%'
                  }}
                >
                  <option value=''>Select project</option>
                  {allProjects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {getProjectName(project.projectId)}
                    </option>
                  ))}
                </select>
              </VStack>

              <VStack align='stretch' flex={1}>
                <Text fontSize='sm' fontWeight='medium' color='gray.600'>
                  Project B
                </Text>
                <select
                  value={projectBId || ''}
                  onChange={(e) => setProjectBId(Number(e.target.value) || null)}
                  style={{
                    fontSize: '14px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    width: '100%'
                  }}
                >
                  <option value=''>Select project</option>
                  {allProjects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {getProjectName(project.projectId)}
                    </option>
                  ))}
                </select>
              </VStack>
            </HStack>

            {/* Comparison Chart */}
            {projectAId && projectBId && chartData.length > 0 && (
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
                  {sortBy === 'avgViewTime' ? 'Average View Time' : 
                   sortBy === 'codeCtr' ? 'Code CTR' : 'Live CTR'} Over Time
                </Text>
                <ResponsiveContainer width='100%' height='90%'>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis 
                      dataKey='date' 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Line
                      type='monotone'
                      dataKey='projectA'
                      stroke='#3182ce'
                      strokeWidth={2}
                      dot={{ fill: '#3182ce', strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='projectB'
                      stroke='#805ad5'
                      strokeWidth={2}
                      dot={{ fill: '#805ad5', strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Empty state for comparison */}
            {(!projectAId || !projectBId) && (
              <Box
                bg='gray.50'
                p={8}
                borderRadius='md'
                textAlign='center'
                border='2px dashed'
                borderColor='gray.200'
              >
                <Text color='gray.500' fontSize='sm'>
                  Select two projects to compare their performance over time
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};

export default ProjectsPage;