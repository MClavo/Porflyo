/**
 * Custom Chakra UI theme with tighter spacing and modern font
 */

import { createSystem, defaultConfig } from '@chakra-ui/react';

const customConfig = {
  ...defaultConfig,
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` },
        body: { value: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` },
      },
      spacing: {
        '0.5': { value: '0.125rem' },
        '1': { value: '0.25rem' },
        '1.5': { value: '0.375rem' },
        '2': { value: '0.5rem' },
        '2.5': { value: '0.625rem' },
        '3': { value: '0.75rem' },
        '3.5': { value: '0.875rem' },
        '4': { value: '1rem' },
        '5': { value: '1.25rem' },
        '6': { value: '1.5rem' },
        '8': { value: '2rem' },
        '10': { value: '2.5rem' },
        '12': { value: '3rem' },
        '16': { value: '4rem' },
        '20': { value: '5rem' },
        '24': { value: '6rem' },
        '32': { value: '8rem' },
      },
    },
    globalCss: {
      'html, body': {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        bg: { base: 'gray.50', _dark: 'gray.900' },
        color: { base: 'gray.900', _dark: 'white' }
      }
    }
  }
};

const theme = createSystem(customConfig);

export default theme;