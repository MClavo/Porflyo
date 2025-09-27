/**
 * Device mix display with badges or compact progress bar
 */

import { HStack, Badge, Text, Box, Skeleton } from '@chakra-ui/react';

export interface DeviceMixBadgeProps {
  desktopPct: number | null;
  mobilePct: number | null;
  isLoading?: boolean;
}

export function DeviceMixBadge({ 
  desktopPct, 
  mobilePct, 
  isLoading = false 
}: DeviceMixBadgeProps) {
  if (isLoading) {
    return (
      <HStack gap={2}>
        <Skeleton height="20px" width="60px" borderRadius="full" />
        <Skeleton height="20px" width="60px" borderRadius="full" />
      </HStack>
    );
  }

  // If we have valid percentages, show badges
  if (desktopPct !== null && mobilePct !== null) {
    return (
      <HStack gap={2}>
        <Badge 
          colorScheme="blue" 
          variant="subtle"
          borderRadius="full"
          px={3}
          py={1}
        >
          <Text fontSize="xs" fontWeight="medium">
            📱 {(mobilePct * 100).toFixed(0)}%
          </Text>
        </Badge>
        <Badge 
          colorScheme="gray" 
          variant="subtle"
          borderRadius="full"
          px={3}
          py={1}
        >
          <Text fontSize="xs" fontWeight="medium">
            💻 {(desktopPct * 100).toFixed(0)}%
          </Text>
        </Badge>
      </HStack>
    );
  }

  // Fallback for no data
  return (
    <Badge colorScheme="gray" variant="outline">
      <Text fontSize="xs">No data</Text>
    </Badge>
  );
}

/**
 * Compact device mix as a progress bar (alternative layout)
 */
export interface DeviceMixBarProps {
  desktopPct: number | null;
  mobilePct: number | null;
  isLoading?: boolean;
  width?: string;
  height?: string;
}

export function DeviceMixBar({ 
  desktopPct, 
  mobilePct, 
  isLoading = false,
  width = "120px",
  height = "6px"
}: DeviceMixBarProps) {
  if (isLoading) {
    return <Skeleton height={height} width={width} borderRadius="full" />;
  }

  if (desktopPct === null || mobilePct === null) {
    return (
      <Box 
        width={width} 
        height={height} 
        bg="gray.200" 
        borderRadius="full" 
      />
    );
  }

  return (
    <Box width={width} height={height} position="relative" bg="gray.100" borderRadius="full" overflow="hidden">
      {/* Desktop segment */}
      <Box
        position="absolute"
        left={0}
        top={0}
        height="100%"
        width={`${desktopPct * 100}%`}
        bg="gray.500"
        borderRadius="full"
      />
      {/* Mobile segment */}
      <Box
        position="absolute"
        right={0}
        top={0}
        height="100%"
        width={`${mobilePct * 100}%`}
        bg="blue.500"
        borderRadius="full"
      />
    </Box>
  );
}