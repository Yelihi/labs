import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@frontend-labs/lab-core': path.resolve(__dirname, '../../packages/lab-core/src'),
    },
  },
  server: {
    port: 5175,
    host: '0.0.0.0',
  },
});
