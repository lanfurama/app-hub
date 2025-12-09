import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './vite-plugin-api.js';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), apiPlugin()],
      // ⚠️ SECURITY: Do NOT expose API keys in client-side code
      // API keys should only be used in server-side API routes
      // If you need to use Gemini API, create a proxy endpoint in api/routes/
      envPrefix: ['VITE_'], // Only allow VITE_ prefixed env vars for client-side
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
