/**
 * Simple working example showing basic usage of metrics components
 */

import { VStack, Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { 
  Page, 
  StatCard, 
  DeviceMixBadge,
  ProjectsDayTable
} from '../components';
import type { ProjectsDayTableRow } from '../components';

// Mock table data
const mockTableData: ProjectsDayTableRow[] = [
  {
    projectId: 1,
    projectName: 'Portfolio Site',
    exposures: 1250,
    viewTime: 45000,
    avgViewTime: 36000,
    codeCtr: 0.15,
    liveCtr: 0.08
  },
  {
    projectId: 2,
    projectName: 'E-commerce App',
    exposures: 980,
    viewTime: 52000,
    avgViewTime: 53000,
    codeCtr: 0.22,
    liveCtr: 0.12
  }
];

export default function SimpleMetricsExample() {
  return (
    <MetricsProvider portfolioId="example-123">
      <Page title="Simple Metrics Example">
        <VStack gap={8} align="stretch">
          
          {/* Basic Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <StatCard
              label="Total Views"
              value="12,400"
              delta={15.3}
            />
            <StatCard
              label="Avg Session"
              value="2m 34s"
              delta={-5.2}
            />
            <StatCard
              label="Code CTR"
              value="18.7%"
              delta={8.1}
            />
            <Box>
              <DeviceMixBadge 
                desktopPct={65}
                mobilePct={35}
              />
            </Box>
          </SimpleGrid>

          {/* Projects Table */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid #e2e8f0">
            <Heading size="md" mb={4}>Project Performance</Heading>
            <ProjectsDayTable data={mockTableData} />
          </Box>

        </VStack>
      </Page>
    </MetricsProvider>
  );
}