import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/porciapp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gestión Porcina · Pedidos de Alimento',
        short_name: 'Gestión Porcina',
        description:
          'Cálculo de pedidos de alimento por bache para el centro porcino. Funciona sin internet.',
        lang: 'es',
        start_url: '/porciapp/',
        scope: '/porciapp/',
        display: 'standalone',
        theme_color: '#0d9488',
        background_color: '#f4f7f5',
        icons: [
          { src: '/porciapp/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/porciapp/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/porciapp/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: '/porciapp/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
  },
});
