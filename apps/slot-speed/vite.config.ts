import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/speed/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5179,
    host: true,
  },
});
