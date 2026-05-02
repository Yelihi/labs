import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@frontend-labs/lab-core': path.resolve(__dirname, '../../packages/lab-core/src'),
      '@frontend-labs/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@frontend-labs/test-utils': path.resolve(__dirname, '../../packages/test-utils/src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
});
