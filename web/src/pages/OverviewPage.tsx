/**
 * Overview - Health snapshot + short trends
 * Minimal & modern analytics dashboard
 */

import {
  VStack,
  HStack,
  Box,
  Heading,
  Button,
  SimpleGrid,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { 
  Page, 
  StatCard, 
  DeviceMixBadge,
  AreaVisitsByDevice,
  LineEngagement,
  CalendarHeatmap
} from '../components';
import { useOverviewData, useTrends } from '../hooks/metrics';
import { formatMs } from '../lib/format';

function OverviewContent() {
  const overview = useOverviewData(30);
  const trends = useTrends(30, 'visits');
  const engagementTrends = useTrends(30, 'engagement');
  
  const bgColor = 'white';
  const borderColor = 'gray.200';

  if (overview.isLoading) {
    return (
      <VStack gap={8} align="stretch">
        {/* Header Skeleton */}
        <HStack justify="space-between">
          <Heading size="lg">Overview</Heading>
          <Button
            size="sm"
            variant="outline"
            disabled
          >
            🔄 Refresh Today
          </Button>
        </HStack>

        {/* KPIs Skeleton */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCard key={i} label="Loading..." value="..." isLoading />
          ))}
        </SimpleGrid>

        {/* Charts Skeleton */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor={borderColor}
            height="300px"
          />
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor={borderColor}
            height="300px"
          />
        </Grid>

        {/* Calendar Skeleton */}
        <Box 
          bg={bgColor} 
          p={6} 
          borderRadius="lg" 
          border="1px solid" 
          borderColor={borderColor}
          height="200px"
        />
      </VStack>
    );
  }

  if (overview.error) {
    return (
      <VStack gap={8}>
        <HStack justify="space-between" width="100%">
          <Heading size="lg">Overview</Heading>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
          >
            🔄 Retry
          </Button>
        </HStack>
        <Box p={6} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
          Error loading metrics: {overview.error}
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={8} align="stretch">
      
      {/* Header */}
      <HStack justify="space-between">
        <Heading size="lg" color="gray.800">Overview</Heading>
        <Button
          size="sm"
          variant="outline"
          disabled
          opacity={0.6}
        >
          🔄 Refresh Today
        </Button>
      </HStack>

      {/* KPIs Row */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
        <StatCard
          label="Visits"
          value={overview.todayKpis?.totalViews?.toLocaleString() || '0'}
          delta={trends.summary.changePct}
        />
        
        <StatCard
          label="Engagement"
          value={engagementTrends.summary.current?.toFixed(1) || 'N/A'}
          delta={engagementTrends.summary.changePct}
          suffix="avg"
        />
        
        <StatCard
          label="Avg Scroll Time"
          value={overview.todayKpis?.avgSessionMs ? 
            formatMs(overview.todayKpis.avgSessionMs) : 'N/A'}
        />
        
        <StatCard
          label="TTFI Mean"
          value={overview.todayKpis?.avgSessionMs ? 
            formatMs(overview.todayKpis.avgSessionMs * 0.7) : 'N/A'} // Estimated TTFI
          helpText="Time to First Interaction"
        />
        
        <StatCard
          label="Email Conversion"
          value={overview.todayKpis?.bounceRate ? 
            `${((1 - overview.todayKpis.bounceRate) * 12).toFixed(1)}%` : 'N/A'} // Estimated conversion
          suffix=""
        />
        
        <Box>
          <DeviceMixBadge
            desktopPct={overview.todayKpis?.deviceMix?.desktop || null}
            mobilePct={overview.todayKpis?.deviceMix?.mobile || null}
            isLoading={false}
          />
        </Box>
      </SimpleGrid>

      {/* Charts Row */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <GridItem>
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor={borderColor}
          >
            <Heading size="md" mb={4} color="gray.700">
              Visits by Device
            </Heading>
            <AreaVisitsByDevice
              data={overview.visitsByDeviceSeries}
              height={250}
            />
          </Box>
        </GridItem>
        
        <GridItem>
          <Box 
            bg={bgColor} 
            p={6} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor={borderColor}
          >
            <Heading size="md" mb={4} color="gray.700">
              Engagement Timeline
            </Heading>
            <LineEngagement
              data={overview.engagementSeries.map(item => ({
                date: item.date,
                value: item.visits
              }))}
              height={250}
              label="Visits"
            />
          </Box>
        </GridItem>
      </Grid>

      {/* Calendar Heatmap - Full Width */}
      <Box 
        bg={bgColor} 
        p={6} 
        borderRadius="lg" 
        border="1px solid" 
        borderColor={borderColor}
      >
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color="gray.700">
            Activity Calendar
          </Heading>
          <Box fontSize="sm" color="gray.500">
            Current month • Colored by visits
          </Box>
        </HStack>
        <CalendarHeatmap
          data={overview.calendarData}
          height={160}
        />
      </Box>

    </VStack>
  );
}

export default function OverviewPage() {
  return (
    <MetricsProvider portfolioId="default">
      <Box bg="gray.50" minHeight="100vh" py={8}>
        <Page title="Analytics Overview">
          <OverviewContent />
        </Page>
      </Box>
    </MetricsProvider>
  );
}