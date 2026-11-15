import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@frontend-labs/lab-core': path.resolve(__dirname, '../../packages/lab-core/src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
});
