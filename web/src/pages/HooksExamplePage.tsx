/**
 * Example page demonstrating the new data hooks
 * Shows how pages stay dumb while hooks provide view-ready data
 */

import { VStack, SimpleGrid, Box, Heading, Text, Badge } from '@chakra-ui/react';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { Page, StatCard, ProjectsDayTable } from '../components';
import { 
  useOverviewData, 
  useHeatmapData, 
  useProjectsAggregated, 
  useDaily, 
  useTrends 
} from '../hooks/metrics';

function DashboardContent() {
  // Hooks assemble view-ready data - pages stay dumb
  const overview = useOverviewData(30);
  const heatmap = useHeatmapData();
  const projects = useProjectsAggregated(30);
  const daily = useDaily();
  const trends = useTrends(30, 'visits');

  if (overview.isLoading) {
    return <Text>Loading dashboard data...</Text>;
  }

  if (overview.error) {
    return <Text color="red.500">Error: {overview.error}</Text>;
  }

  return (
    <VStack gap={8} align="stretch">
      
      {/* Today's KPIs from useOverviewData */}
      <Box>
        <Heading size="md" mb={4}>Today's Overview</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <StatCard
            label="Total Views"
            value={overview.todayKpis?.totalViews?.toLocaleString() || '0'}
            delta={trends.summary.changePct}
          />
          <StatCard
            label="Avg Session"
            value={overview.todayKpis?.avgSessionMs ? 
              `${Math.round(overview.todayKpis.avgSessionMs / 1000)}s` : 'N/A'}
          />
          <StatCard
            label="Device Mix"
            value={overview.todayKpis?.deviceMix ? 
              `${overview.todayKpis.deviceMix.desktop}% / ${overview.todayKpis.deviceMix.mobile}%` : 'N/A'}
          />
          <StatCard
            label="Quality Rate"
            value={overview.todayKpis?.bounceRate ? 
              `${Math.round(overview.todayKpis.bounceRate * 100)}%` : 'N/A'}
          />
        </SimpleGrid>
      </Box>

      {/* Heatmap Summary from useHeatmapData */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid #e2e8f0">
        <Heading size="md" mb={4}>Portfolio Heatmap Summary</Heading>
        <SimpleGrid columns={3} gap={4}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {heatmap.kpis.coverage?.toFixed(1) || '0'}%
            </Text>
            <Text color="gray.600">Coverage</Text>
          </Box>
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {heatmap.kpis.k}
            </Text>
            <Text color="gray.600">Projects</Text>
          </Box>
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {heatmap.kpis.top?.projectId || 'N/A'}
            </Text>
            <Text color="gray.600">Top Project</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Top Projects from useProjectsAggregated */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid #e2e8f0">
        <Heading size="md" mb={4}>Top Projects by Exposures</Heading>
        <VStack align="stretch" gap={2}>
          {projects.byExposures.slice(0, 5).map((project, index) => (
            <Box key={project.projectId} p={3} bg="gray.50" borderRadius="md">
              <SimpleGrid columns={4} gap={4} alignItems="center">
                <Text fontWeight="medium">
                  <Badge mr={2}>{index + 1}</Badge>
                  Project {project.projectId}
                </Text>
                <Text>{project.exposures.toLocaleString()} exposures</Text>
                <Text>
                  {project.avgViewTimeMs ? 
                    `${Math.round(project.avgViewTimeMs / 1000)}s avg` : 'N/A'}
                </Text>
                <Text>
                  {project.codeCtr ? 
                    `${(project.codeCtr * 100).toFixed(1)}% CTR` : 'N/A'}
                </Text>
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Daily Slot Details from useDaily */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid #e2e8f0">
        <Heading size="md" mb={4}>
          Today's Slot Details {daily.dailyKpis?.date && `(${daily.dailyKpis.date})`}
        </Heading>
        {daily.slotRows.length > 0 ? (
          <ProjectsDayTable 
            data={daily.slotRows.map(row => ({
              projectId: row.projectId,
              projectName: `Project ${row.projectId}`,
              exposures: row.exposures,
              viewTime: row.viewTimeMs,
              avgViewTime: row.avgViewTimeMs,
              codeCtr: row.codeCtr,
              liveCtr: row.liveCtr
            }))}
          />
        ) : (
          <Text color="gray.500">No slot data available for today</Text>
        )}
      </Box>

      {/* Trends Summary from useTrends */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid #e2e8f0">
        <Heading size="md" mb={4}>Trends Summary</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
          <Box>
            <Text fontSize="lg" fontWeight="semibold">Visits Trend</Text>
            <Text fontSize="2xl" fontWeight="bold" color={
              trends.summary.trend === 'up' ? 'green.500' : 
              trends.summary.trend === 'down' ? 'red.500' : 'gray.500'
            }>
              {trends.summary.changePct ? 
                `${trends.summary.changePct > 0 ? '+' : ''}${trends.summary.changePct.toFixed(1)}%` : 'N/A'}
            </Text>
            <Text color="gray.600">vs yesterday</Text>
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="semibold">Calendar Days</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {trends.calendarValues.length}
            </Text>
            <Text color="gray.600">days with data</Text>
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="semibold">Data Series</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {trends.primarySeries.length}
            </Text>
            <Text color="gray.600">data points</Text>
          </Box>
        </SimpleGrid>
      </Box>

    </VStack>
  );
}

export default function HooksExamplePage() {
  return (
    <MetricsProvider portfolioId="example-portfolio">
      <Page title="Data Hooks Example">
        <DashboardContent />
      </Page>
    </MetricsProvider>
  );
}