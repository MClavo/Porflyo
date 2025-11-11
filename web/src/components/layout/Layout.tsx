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
  { path: '/dashboard/overview', label: 'Overview' },
  { path: '/dashboard/heatmap', label: 'Heatmap' },
  { path: '/dashboard/projects', label: 'Projects' },
  { path: '/dashboard/daily', label: 'Daily' },
  { path: '/dashboard/trends', label: 'Trends' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH='100vh' bgGradient='linear(to-br, gray.50, blue.50, purple.50)'>
      {/* Modern Header Navigation */}
      <Box
        bg='white'
        borderBottom='1px'
        borderColor='gray.200'
        position='sticky'
        top={0}
        zIndex={10}
        boxShadow='lg'
        backdropFilter='blur(10px)'
      >
        <Container maxW='100%' px={6} py={4}>
          <HStack justify='space-between' align='center'>
            {/* Modern Logo/Brand */}
            <Box>
              <Text 
                fontSize='2xl' 
                fontWeight='800' 
                bgGradient='linear(to-r, blue.600, purple.600, pink.600)'
                bgClip='text'
              >
                📊 Porflyo Analytics
              </Text>
              <Text fontSize='xs' color='gray.500' mt={-1}>
                Real-time portfolio insights
              </Text>
            </Box>

            {/* Modern Navigation Links */}
            <HStack gap={2}>
              {navItems.map((item) => (
                <Box
                  key={item.path}
                  px={4}
                  py={2}
                  borderRadius='xl'
                  fontSize='sm'
                  fontWeight='600'
                  color='gray.700'
                  bg='transparent'
                  border='2px solid transparent'
                  _hover={{
                    bg: 'blue.50',
                    borderColor: 'blue.200',
                    textDecoration: 'none',
                    transform: 'translateY(-1px)',
                  }}
                  transition='all 0.3s ease'
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

      {/* Main Content - Full Width */}
      <Box>{children}</Box>
    </Box>
  );
};