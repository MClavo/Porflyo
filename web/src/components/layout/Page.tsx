/**
 * Page wrapper component with consistent layout and structure
 */

import { Container, Heading, HStack, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Page({ title, actions, children }: PageProps) {
  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={8}>
        {/* Header with title and optional actions */}
        <Stack gap={4}>
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="gray.800">
              {title}
            </Heading>
            {actions && (
              <HStack gap={3}>
                {actions}
              </HStack>
            )}
          </HStack>
        </Stack>
        
        {/* Page content */}
        {children}
      </Stack>
    </Container>
  );
}