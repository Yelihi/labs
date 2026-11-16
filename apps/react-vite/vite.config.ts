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
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest, _request, response) => {
            response.once('close', () => {
              if (!response.writableEnded) proxyRequest.destroy();
            });
          });
        },
      },
    },
    port: 5173,
    host: '0.0.0.0',
  },
});
