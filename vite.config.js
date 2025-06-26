// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['app-img.172.16.15.30.sslip.io'],
  },
});
