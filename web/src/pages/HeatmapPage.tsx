/**
 * Heatmap - Where users look; precise & visual
 * Shows portfolio heatmap with user interaction patterns
 */

import { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Heading,
  Input,
  Grid,
  GridItem,
  Text,
  Badge,
  Skeleton
} from '@chakra-ui/react';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { Page, StatCard, CalendarHeatmap } from '../components';
import { useHeatmapData } from '../hooks/metrics';
import { latest } from '../lib/dates';
import { useMetricsStore } from '../state/metrics.store';

interface HotspotRow {
  rank: number;
  index: number;
  value: number;
  count: number;
  intensity: number; // normalized 0-1 for color coding
}

function HeatmapContent() {
  const { slotIndex } = useMetricsStore();
  const latestDate = latest(slotIndex);
  const [selectedDate, setSelectedDate] = useState<string>(latestDate || '');
  
  const heatmapData = useHeatmapData(selectedDate || undefined);
  
  const bgColor = 'var(--dashboard-bg-secondary)';
  const borderColor = 'var(--card-border)';

  // Transform heatmap cells into hotspot rows
  const hotspots: HotspotRow[] = useMemo(() => {
    if (!heatmapData.cells || heatmapData.cells.length === 0) return [];
    
    const maxValue = Math.max(...heatmapData.cells.map(cell => cell.value));
    
    return heatmapData.cells
      .map((cell, index) => ({
        rank: 0, // Will be set after sorting
        index: index,
        value: cell.value,
        count: 1, // Assuming count = 1 for now, can be enhanced
        intensity: maxValue > 0 ? cell.value / maxValue : 0
      }))
      .filter(hotspot => hotspot.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((hotspot, index) => ({
        ...hotspot,
        rank: index + 1
      }));
  }, [heatmapData.cells]);

  if (heatmapData.isLoading) {
    return (
      <VStack gap={6} align="stretch">
        {/* Header Skeleton */}
        <HStack justify="space-between">
          <Heading size="lg">Heatmap</Heading>
          <Skeleton height="40px" width="200px" />
        </HStack>

        {/* Grid Skeleton */}
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
          <GridItem>
            <Skeleton height="500px" borderRadius="lg" />
          </GridItem>
          <GridItem>
            <Box style={{ backgroundColor: bgColor, borderColor }} p={6} borderRadius="lg" border="1px solid">
              <Skeleton height="24px" width="150px" mb={4} />
              <VStack gap={4}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="60px" width="100%" />
                ))}
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    );
  }

  if (heatmapData.error) {
    return (
      <VStack gap={6}>
        <HStack justify="space-between" width="100%">
          <Heading size="lg">Heatmap</Heading>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            width="200px"
          />
        </HStack>
        <Box p={6} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
          Error loading heatmap: {heatmapData.error}
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      
      {/* Header with Date Picker */}
      <HStack justify="space-between">
        <Heading size="lg" style={{ color: 'var(--text-primary)' }}>Heatmap</Heading>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          width="200px"
          style={{ backgroundColor: bgColor, borderColor }}
          border="1px solid"
        />
      </HStack>

      {/* Main Grid: Heatmap + KPIs */}
      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
        
        {/* Column 1: Portfolio Heatmap */}
        <GridItem>
          <Box 
            style={{ backgroundColor: bgColor, borderColor }}
            border="1px solid"
            borderRadius="lg"
            p={4}
            height="500px"
            position="relative"
          >
            <CalendarHeatmap
              data={heatmapData.cells.map((cell, index) => ({
                day: `${selectedDate}-${index}`,
                value: cell.value
              }))}
              height={460}
            />
          </Box>
        </GridItem>

        {/* Column 2: KPIs and Top Hotspots */}
        <GridItem>
          <VStack gap={4} align="stretch">
            
            {/* KPIs Box */}
            <Box style={{ backgroundColor: bgColor, borderColor }} p={6} borderRadius="lg" border="1px solid">
              <Heading size="md" mb={4}>Heatmap Metrics</Heading>
              <VStack gap={4} align="stretch">
                
                <StatCard
                  label="Coverage"
                  value={heatmapData.kpis.coverage ? 
                    `${heatmapData.kpis.coverage.toFixed(1)}%` : '0%'}
                  helpText="Percentage of active cells"
                />
                
                <StatCard
                  label="K (Total Cells)"
                  value={heatmapData.kpis.k.toString()}
                  helpText="Total available grid cells"
                />
                
                <StatCard
                  label="Top Hotspot"
                  value={heatmapData.kpis.top ? 
                    `Project ${heatmapData.kpis.top.projectId}` : 'None'}
                  suffix={heatmapData.kpis.top ? 
                    `(${heatmapData.kpis.top.value})` : ''}
                  helpText={heatmapData.kpis.top ? 
                    `${heatmapData.kpis.top.percentage.toFixed(1)}% of activity` : undefined}
                />
                
              </VStack>
            </Box>

            {/* Top 10 Hotspots List */}
            <Box style={{ backgroundColor: bgColor, borderColor }} p={6} borderRadius="lg" border="1px solid">
              <Heading size="sm" mb={4}>Top 10 Hotspots</Heading>
              {hotspots.length > 0 ? (
                <VStack gap={2} align="stretch" maxHeight="300px" overflowY="auto">
                  {hotspots.map((hotspot) => (
                    <HStack 
                      key={hotspot.index} 
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      _hover={{ bg: 'gray.100' }}
                    >
                      <HStack gap={3}>
                        <Badge 
                          colorScheme={hotspot.rank <= 3 ? 'blue' : 'gray'}
                          variant={hotspot.rank <= 3 ? 'solid' : 'subtle'}
                        >
                          #{hotspot.rank}
                        </Badge>
                        <Text fontFamily="mono" fontSize="sm">
                          Index {hotspot.index}
                        </Text>
                      </HStack>
                      <HStack gap={4}>
                        <Text fontWeight="medium">
                          {hotspot.value.toLocaleString()}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ({hotspot.count})
                        </Text>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Box textAlign="center" py={4} color="gray.500">
                  <Text>No hotspot data available</Text>
                  <Text fontSize="sm">for {selectedDate || 'selected date'}</Text>
                </Box>
              )}
            </Box>
            
          </VStack>
        </GridItem>
        
      </Grid>
      
    </VStack>
  );
}

export default function HeatmapPage() {
  return (
    <MetricsProvider portfolioId="default">
      <Page title="Portfolio Heatmap Analysis">
        <HeatmapContent />
      </Page>
    </MetricsProvider>
  );
}