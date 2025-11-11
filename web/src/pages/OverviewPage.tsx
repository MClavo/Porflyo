/**
 * Overview - Professional analytics dashboard with modern design
 */

import {
  VStack,
  HStack,
  Box,
  Heading,
  Button,
  SimpleGrid,
  Grid,
  GridItem,
  Text,
  Icon,
  Badge,
  Card,
  Skeleton,
  SkeletonCircle
} from '@chakra-ui/react';
import { 
  FiRefreshCw, 
  FiTrendingUp, 
  FiUsers, 
  FiClock, 
  FiMonitor, 
  FiMail
} from 'react-icons/fi';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { 
  Page, 
  DeviceMixBadge,
  AreaVisitsByDevice,
  LineEngagement,
  CalendarHeatmap
} from '../components';
import { useOverviewData, useTrends } from '../hooks/metrics';
import { formatMs } from '../lib/format';

// Professional Stat Card Component using Chakra UI v3 Card
interface ProfessionalStatCardProps {
  icon: React.ComponentType;
  label: string;
  value: string;
  delta?: number | null;
  suffix?: string;
  helpText?: string;
  colorPalette: string;
}

function ProfessionalStatCard({ icon, label, value, delta, suffix, helpText, colorPalette }: ProfessionalStatCardProps) {
  // replaced implementation: clearer horizontal layout, larger value, delta arrow with color
  return (
    <Card.Root
      variant="elevated"
      size="md"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 6px 18px rgba(15,23,42,0.06)"
      borderRadius="lg"
      overflow="hidden"
      minH="88px"
      _hover={{ transform: 'translateY(-6px)', boxShadow: '0 10px 30px rgba(15,23,42,0.12)' }}
      transition="all 0.18s ease"
    >
      <Card.Body p={4}>
  <HStack gap={4} align="center" justify="space-between">
          {/* Left: icon + label */}
          <HStack gap={3} align="center">
            <Box
              p={3}
              rounded="md"
              bg={`${colorPalette}.50`}
              color={`${colorPalette}.600`}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={icon} boxSize={5} />
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="12px" color="gray.500" fontWeight={600}>
                {label}
              </Text>
              {helpText && (
                <Text fontSize="11px" color="gray.400">{helpText}</Text>
              )}
            </VStack>
          </HStack>

          {/* Right: value + delta */}
          <VStack align="end" gap={0}>
            <HStack align="center" gap={3}>
              <Heading as="div" fontSize={{ base: 'lg', md: '3xl', lg: '4xl' }} color="gray.800" fontWeight={800}>
                {value}
                {suffix && (
                  <Text as="span" fontSize="sm" color="gray.500" ml={2}>{suffix}</Text>
                )}
              </Heading>

              {delta !== undefined && delta !== null && (
                <Box display="inline-flex" alignItems="center" px={2} py={1} borderRadius="full" bg={delta >= 0 ? 'green.50' : 'red.50'}>
                  <Text color={delta >= 0 ? 'green.600' : 'red.600'} fontSize="12px" fontWeight={700}>
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                  </Text>
                </Box>
              )}
            </HStack>

            {/* small caption under value (kept empty for symmetry) */}
            <Text fontSize="12px" color="gray.500">&nbsp;</Text>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}

// Professional Loading Skeleton
function LoadingSkeleton() {
  return (
    <Box className="professional-container" maxW="full" mx="auto">
      <VStack gap="8" align="stretch">
        {/* Header Skeleton */}
        <Card.Root variant="elevated" className="loading-fade">
          <Card.Body p="8">
            <HStack justify="space-between">
              <VStack align="start" gap="3">
                <Skeleton height="10" width="300px" variant="shine" />
                <Skeleton height="6" width="200px" variant="shine" />
              </VStack>
              <Skeleton height="12" width="120px" variant="shine" />
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Stats Cards Skeleton */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} gap="6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card.Root key={i} variant="elevated" size="md" className="loading-fade">
              <Card.Body p="6">
                <HStack justify="space-between" mb="4">
                  <SkeletonCircle size="12" variant="shine" />
                  <Skeleton height="6" width="16" variant="shine" />
                </HStack>
                <VStack align="start" gap="2" w="full">
                  <Skeleton height="4" width="20" variant="shine" />
                  <Skeleton height="8" width="16" variant="shine" />
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* Charts Skeleton */}
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap="8">
          <GridItem>
            <Card.Root variant="elevated" size="lg" className="loading-fade">
              <Card.Body p="8">
                <VStack align="start" gap="6">
                  <VStack align="start" gap="2">
                    <Skeleton height="8" width="200px" variant="shine" />
                    <Skeleton height="4" width="150px" variant="shine" />
                  </VStack>
                  <Skeleton height="280px" width="full" variant="shine" />
                </VStack>
              </Card.Body>
            </Card.Root>
          </GridItem>
          <GridItem>
            <Card.Root variant="elevated" size="lg" className="loading-fade">
              <Card.Body p="8">
                <VStack align="start" gap="6">
                  <VStack align="start" gap="2">
                    <Skeleton height="8" width="200px" variant="shine" />
                    <Skeleton height="4" width="150px" variant="shine" />
                  </VStack>
                  <Skeleton height="280px" width="full" variant="shine" />
                </VStack>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>

        {/* Calendar Skeleton */}
        <Card.Root variant="elevated" size="lg" className="loading-fade">
          <Card.Body p="8">
            <VStack align="start" gap="6">
              <VStack align="start" gap="2">
                <Skeleton height="8" width="200px" variant="shine" />
                <Skeleton height="4" width="150px" variant="shine" />
              </VStack>
              <Skeleton height="200px" width="full" variant="shine" />
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}

function OverviewContent() {
  const overview = useOverviewData(30);
  const trends = useTrends(30, 'visits');
  const engagementTrends = useTrends(30, 'engagement');

  if (overview.isLoading) {
    return <LoadingSkeleton />;
  }

  if (overview.error) {
    return (
      <Box className="professional-container" maxW="full" mx="auto">
        <Card.Root variant="elevated" colorPalette="red" className="loading-fade">
          <Card.Body p="8">
            <VStack align="start" gap="4">
              <Heading 
                size="xl" 
                color="red.solid"
                className="professional-title"
              >
                Unable to Load Analytics
              </Heading>
              <Text 
                color="fg.muted" 
                textStyle="lg"
                className="professional-subtitle"
              >
                {overview.error}
              </Text>
              <Button 
                colorPalette="red" 
                variant="solid"
                _hover={{ transform: 'translateY(-1px)' }}
                transition="all 0.2s ease-in-out"
              >
                <Icon as={FiRefreshCw} />
                Retry
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }

  return (
    <Box className="professional-container" maxW="full" mx="auto">
      <VStack gap="8" align="stretch">
        
        {/* Professional Header */}
        <Card.Root 
          variant="elevated" 
          size="lg" 
          colorPalette="blue"
          className="loading-fade"
          bg="linear-gradient(135deg, blue.500, blue.600)"
          color="white"
        >
          <Card.Body p="8">
            <HStack justify="space-between" align="center">
              <VStack align="start" gap="3">
                <Heading 
                  size="2xl" 
                  color="white" 
                  fontWeight="bold"
                  className="professional-title"
                >
                  Analytics Dashboard
                </Heading>
                <Text 
                  color="whiteAlpha.900" 
                  textStyle="lg"
                  className="professional-subtitle"
                >
                  Comprehensive insights into portfolio performance and user engagement
                </Text>
              </VStack>
              <Button
                size="lg"
                variant="subtle"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ 
                  bg: 'whiteAlpha.300',
                  transform: 'translateY(-1px)' 
                }}
                transition="all 0.2s ease-in-out"
              >
                <Icon as={FiRefreshCw} />
                Refresh
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

  {/* Professional KPIs Grid */}
  <SimpleGrid minChildWidth="220px" gap={6}>
          <ProfessionalStatCard
            icon={FiUsers}
            label="Total Visits"
            value={overview.todayKpis?.totalViews?.toLocaleString() || '0'}
            delta={trends.summary.changePct}
            colorPalette="blue"
          />
          
          <ProfessionalStatCard
            icon={FiTrendingUp}
            label="Engagement Rate"
            value={engagementTrends.summary.current?.toFixed(1) || 'N/A'}
            delta={engagementTrends.summary.changePct}
            suffix="avg"
            colorPalette="green"
          />
          
          <ProfessionalStatCard
            icon={FiClock}
            label="Session Duration"
            value={overview.todayKpis?.avgSessionMs ? 
              formatMs(overview.todayKpis.avgSessionMs) : 'N/A'}
            colorPalette="purple"
          />
          
          <ProfessionalStatCard
            icon={FiClock}
            label="Time to Interact"
            value={overview.todayKpis?.avgSessionMs ? 
              formatMs(overview.todayKpis.avgSessionMs * 0.7) : 'N/A'}
            helpText="First meaningful interaction"
            colorPalette="orange"
          />
          
          <ProfessionalStatCard
            icon={FiMail}
            label="Conversion Rate"
            value={overview.todayKpis?.bounceRate ? 
              `${((1 - overview.todayKpis.bounceRate) * 12).toFixed(1)}%` : 'N/A'}
            colorPalette="pink"
          />
          
          <Card.Root
            variant="elevated"
            size="md"
            colorPalette="teal"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
              transition: 'all 0.2s ease-in-out'
            }}
            transition="all 0.2s ease-in-out"
          >
            <Card.Body p="6">
              <HStack mb="4">
                <Box
                  p="3"
                  rounded="lg"
                  bg="teal.subtle"
                  color="teal.solid"
                >
                  <Icon as={FiMonitor} boxSize="5" />
                </Box>
              </HStack>
              <VStack align="start" gap="2" w="full">
                <Text textStyle="sm" color="fg.muted" fontWeight="medium">
                  Device Distribution
                </Text>
                <DeviceMixBadge
                  desktopPct={overview.todayKpis?.deviceMix?.desktop || null}
                  mobilePct={overview.todayKpis?.deviceMix?.mobile || null}
                  isLoading={false}
                />
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Professional Charts Grid */}
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap="8">
          <GridItem>
            <Card.Root 
              variant="elevated" 
              size="lg" 
              className="loading-fade"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                transition: 'all 0.2s ease-in-out'
              }}
              transition="all 0.2s ease-in-out"
            >
              <Card.Header pb="0">
                <HStack justify="space-between" w="full">
                  <VStack align="start" gap="1">
                    <Card.Title 
                      color="fg" 
                      fontWeight="semibold"
                      className="professional-title"
                    >
                      Device Analytics
                    </Card.Title>
                    <Card.Description 
                      color="fg.muted"
                      className="professional-subtitle"
                    >
                      Visitor breakdown by device category
                    </Card.Description>
                  </VStack>
                  <Badge colorPalette="blue" variant="subtle" size="sm">
                    30 days
                  </Badge>
                </HStack>
              </Card.Header>
              <Card.Body>
                <Box 
                  rounded="lg" 
                  overflow="hidden"
                  bg="bg.subtle"
                  p="4"
                  className="chart-container"
                >
                  <AreaVisitsByDevice
                    data={overview.visitsByDeviceSeries}
                    height={280}
                  />
                </Box>
              </Card.Body>
            </Card.Root>
          </GridItem>
          
          <GridItem>
            <Card.Root 
              variant="elevated" 
              size="lg" 
              className="loading-fade"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                transition: 'all 0.2s ease-in-out'
              }}
              transition="all 0.2s ease-in-out"
            >
              <Card.Header pb="0">
                <HStack justify="space-between" w="full">
                  <VStack align="start" gap="1">
                    <Card.Title 
                      color="fg" 
                      fontWeight="semibold"
                      className="professional-title"
                    >
                      Engagement Trends
                    </Card.Title>
                    <Card.Description 
                      color="fg.muted"
                      className="professional-subtitle"
                    >
                      User interaction patterns over time
                    </Card.Description>
                  </VStack>
                  <Badge colorPalette="green" variant="subtle" size="sm">
                    Live
                  </Badge>
                </HStack>
              </Card.Header>
              <Card.Body>
                <Box 
                  rounded="lg" 
                  overflow="hidden"
                  bg="bg.subtle"
                  p="4"
                  className="chart-container"
                >
                  <LineEngagement
                    data={overview.engagementSeries.map(item => ({
                      date: item.date,
                      value: item.visits
                    }))}
                    height={280}
                    label="Visits"
                  />
                </Box>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>

        {/* Professional Activity Calendar */}
        <Card.Root 
          variant="elevated" 
          size="lg" 
          className="loading-fade"
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'lg',
            transition: 'all 0.2s ease-in-out'
          }}
          transition="all 0.2s ease-in-out"
        >
          <Card.Header pb="0">
            <HStack justify="space-between" w="full">
              <VStack align="start" gap="1">
                <Card.Title 
                  color="fg" 
                  fontWeight="semibold"
                  className="professional-title"
                >
                  Activity Heatmap
                </Card.Title>
                <Card.Description 
                  color="fg.muted"
                  className="professional-subtitle"
                >
                  Daily engagement patterns and activity distribution
                </Card.Description>
              </VStack>
              <HStack gap="2">
                <Badge colorPalette="purple" variant="subtle" size="sm">
                  Current Period
                </Badge>
                <Badge variant="outline" size="sm">
                  Visit-based
                </Badge>
              </HStack>
            </HStack>
          </Card.Header>
          <Card.Body>
            <Box 
              rounded="lg" 
              overflow="hidden"
              bg="bg.subtle"
              p="6"
              className="chart-container"
            >
              <CalendarHeatmap
                data={overview.calendarData}
                height={200}
              />
            </Box>
          </Card.Body>
        </Card.Root>

      </VStack>
    </Box>
  );
}

export default function OverviewPage() {
  return (
    <MetricsProvider portfolioId="default">
      <Box bg="bg" minHeight="100vh">
        <Page title="Analytics Dashboard">
          <OverviewContent />
        </Page>
      </Box>
    </MetricsProvider>
  );
}