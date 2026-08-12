import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // L'interface parle à l'API par le même origine en développement : pas de
    // configuration CORS à gérer côté navigateur.
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } },
  },
});
