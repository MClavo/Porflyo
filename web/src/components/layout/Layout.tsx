/**
 * Layout component with navigation for metrics pages
 */

import React from 'react';
import {
  Box,
  HStack,
  Text,
  Container,
} from '@chakra-ui/react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/overview', label: 'Overview' },
  { path: '/heatmap', label: 'Heatmap' },
  { path: '/projects', label: 'Projects' },
  { path: '/daily', label: 'Daily' },
  { path: '/trends', label: 'Trends' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH='100vh' bg='gray.50'>
      {/* Header Navigation */}
      <Box
        bg='white'
        borderBottom='1px'
        borderColor='gray.200'
        position='sticky'
        top={0}
        zIndex={10}
        boxShadow='sm'
      >
        <Container maxW='7xl' py={4}>
          <HStack justify='space-between' align='center'>
            {/* Logo/Brand */}
            <Text fontSize='xl' fontWeight='bold' color='gray.900'>
              Porflyo Metrics
            </Text>

            {/* Navigation Links */}
            <HStack gap={1}>
              {navItems.map((item) => (
                <Box
                  key={item.path}
                  px={3}
                  py={2}
                  borderRadius='md'
                  fontSize='sm'
                  fontWeight='medium'
                  color='gray.700'
                  bg='transparent'
                  _hover={{
                    bg: 'gray.100',
                    textDecoration: 'none',
                  }}
                  transition='all 0.2s'
                  cursor='pointer'
                  onClick={() => {
                    window.location.href = item.path;
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box>{children}</Box>
    </Box>
  );
};