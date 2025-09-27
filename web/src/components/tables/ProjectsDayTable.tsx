/**
 * Projects performance table with progress bars for visual cues
 */

import { 
  Box, 
  Text, 
  HStack,
  VStack,
  Skeleton,
  Badge
} from '@chakra-ui/react';

export interface ProjectsDayTableRow {
  projectId: number;
  projectName: string;
  exposures: number;
  viewTime: number; // in milliseconds
  avgViewTime: number | null; // in milliseconds
  codeCtr: number | null; // fraction 0..1
  liveCtr: number | null; // fraction 0..1
}

export interface ProjectsDayTableProps {
  data: ProjectsDayTableRow[];
  isLoading?: boolean;
}

export function ProjectsDayTable({ data, isLoading = false }: ProjectsDayTableProps) {
  if (isLoading) {
    return (
      <VStack align="stretch" gap={3}>
        {Array.from({ length: 5 }).map((_, index) => (
          <HStack key={index} gap={4} p={4}>
            <Skeleton height="20px" width="120px" />
            <Skeleton height="20px" width="60px" />
            <Skeleton height="20px" width="80px" />
            <Skeleton height="20px" width="80px" />
            <Skeleton height="20px" width="60px" />
            <Skeleton height="20px" width="60px" />
          </HStack>
        ))}
      </VStack>
    );
  }

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No project data available</Text>
      </Box>
    );
  }

  // Calculate max values for progress bar scaling
  const maxAvgViewTime = Math.max(...data.map(row => row.avgViewTime || 0));
  const maxCodeCtr = Math.max(...data.map(row => row.codeCtr || 0));
  const maxLiveCtr = Math.max(...data.map(row => row.liveCtr || 0));

  const formatMs = (ms: number | null): string => {
    if (ms === null || ms === undefined) return 'N/A';
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
  };

  const formatPct = (value: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const ProgressBar = ({ value, max, color = "blue" }: { value: number | null; max: number; color?: string }) => {
    if (value === null || max === 0) return null;
    const percentage = (value / max) * 100;
    return (
      <Box width="60px" height="4px" bg="gray.100" borderRadius="full" overflow="hidden">
        <Box 
          width={`${percentage}%`} 
          height="100%" 
          bg={`${color}.500`}
          transition="width 0.3s ease"
        />
      </Box>
    );
  };

  return (
    <Box overflowX="auto">
      {/* Table Header */}
      <HStack 
        gap={4} 
        p={4} 
        bg="gray.50" 
        borderRadius="md" 
        fontSize="sm" 
        fontWeight="semibold" 
        color="gray.700"
        mb={2}
      >
        <Box flex="2">Project</Box>
        <Box flex="1" textAlign="right">Exposures</Box>
        <Box flex="1" textAlign="right">View Time</Box>
        <Box flex="1" textAlign="right">Avg View Time</Box>
        <Box flex="1" textAlign="right">Code CTR</Box>
        <Box flex="1" textAlign="right">Live CTR</Box>
      </HStack>

      {/* Table Body */}
      <VStack align="stretch" gap={2}>
        {data.map((row) => (
          <HStack 
            key={row.projectId} 
            gap={4} 
            p={4} 
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            _hover={{ bg: 'gray.50' }}
            transition="background 0.2s"
          >
            {/* Project */}
            <VStack align="start" flex="2" gap={1}>
              <Text fontWeight="medium" fontSize="sm">
                {row.projectName}
              </Text>
              <Badge size="sm" colorScheme="gray" variant="subtle">
                ID: {row.projectId}
              </Badge>
            </VStack>
            
            {/* Exposures */}
            <Box flex="1" textAlign="right">
              <Text fontSize="sm" fontWeight="medium">
                {row.exposures.toLocaleString()}
              </Text>
            </Box>
            
            {/* View Time */}
            <Box flex="1" textAlign="right">
              <Text fontSize="sm">
                {formatMs(row.viewTime)}
              </Text>
            </Box>
            
            {/* Avg View Time with Progress */}
            <VStack flex="1" align="end" gap={1}>
              <Text fontSize="sm" fontWeight="medium">
                {formatMs(row.avgViewTime)}
              </Text>
              <ProgressBar value={row.avgViewTime} max={maxAvgViewTime} color="blue" />
            </VStack>
            
            {/* Code CTR with Progress */}
            <VStack flex="1" align="end" gap={1}>
              <Text fontSize="sm" fontWeight="medium">
                {formatPct(row.codeCtr)}
              </Text>
              <ProgressBar value={row.codeCtr} max={maxCodeCtr} color="green" />
            </VStack>
            
            {/* Live CTR with Progress */}
            <VStack flex="1" align="end" gap={1}>
              <Text fontSize="sm" fontWeight="medium">
                {formatPct(row.liveCtr)}
              </Text>
              <ProgressBar value={row.liveCtr} max={maxLiveCtr} color="purple" />
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}