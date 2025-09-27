/**
 * Statistical display card with skeleton loading state
 */

import { 
  Box, 
  Text, 
  HStack, 
  VStack,
  Skeleton,
  Icon,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number | null;
  suffix?: string;
  helpText?: string;
  isLoading?: boolean;
}

export function StatCard({ 
  label, 
  value, 
  delta, 
  suffix, 
  helpText, 
  isLoading = false 
}: StatCardProps) {
  const deltaIsPositive = delta !== null && delta !== undefined && delta > 0;
  const deltaIsNegative = delta !== null && delta !== undefined && delta < 0;
  
  const deltaColor = deltaIsPositive ? 'green.500' : deltaIsNegative ? 'red.500' : 'gray.500';

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="shadow 0.2s"
    >
      <VStack align="start" gap={2}>
        {/* Label */}
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {label}
        </Text>
        
        {/* Value with skeleton */}
        <HStack align="baseline" gap={2}>
          {isLoading ? (
            <Skeleton height="32px" width="120px" />
          ) : (
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              {value}
              {suffix && (
                <Text as="span" fontSize="lg" color="gray.600" ml={1}>
                  {suffix}
                </Text>
              )}
            </Text>
          )}
          
          {/* Delta indicator */}
          {delta !== null && delta !== undefined && !isLoading && (
            <HStack gap={1} color={deltaColor}>
              <Icon 
                as={deltaIsPositive ? ArrowUpIcon : ArrowDownIcon} 
                boxSize={3}
              />
              <Text fontSize="sm" fontWeight="medium">
                {Math.abs(delta * 100).toFixed(1)}%
              </Text>
            </HStack>
          )}
        </HStack>
        
        {/* Help text */}
        {helpText && !isLoading && (
          <Text fontSize="xs" color="gray.500">
            {helpText}
          </Text>
        )}
        
        {/* Skeleton for help text when loading */}
        {isLoading && (
          <Skeleton height="12px" width="80%" />
        )}
      </VStack>
    </Box>
  );
}