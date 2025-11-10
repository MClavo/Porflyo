import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import preact from '@preact/preset-vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    visualizer({ filename: 'stats.html', template: 'treemap', gzipSize: true, brotliSize: true })
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    },
  },
  server: {
    proxy: {
      // API routes with credentials
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Public routes without credentials
      '/public': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Authentication routes
      '/oauth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/metrics': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
