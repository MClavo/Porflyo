import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  proxy: {
    '/api/user': 'http://localhost:8080',
    '/api/repos': 'http://localhost:8080',
    '/oauth': 'http://localhost:8080',
  },
}
});
