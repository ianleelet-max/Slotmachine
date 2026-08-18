import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/auditreq/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    allowedHosts: true,
    // L'interface parle à l'API par le même origine en développement : pas de
    // configuration CORS à gérer côté navigateur.
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } },
  },
});
