/**
 * Page wrapper component with consistent layout and structure
 */

import { Container, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Page({ children }: PageProps) {
  return (
    <Container maxW="100%" px={6} py={0}>
      <Stack gap={0}>
        {/* Page content - title is handled by individual pages now */}
        {children}
      </Stack>
    </Container>
  );
}