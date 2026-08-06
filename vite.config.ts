import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'manifest.json'],
      manifest: {
        name: 'ReLift — Smart Fitness Tracker',
        short_name: 'ReLift',
        description:
          'Track your workouts, smash your goals, and monitor progress — online or offline.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#050505',
        theme_color: '#CCFF00',
        dir: 'ltr',
        lang: 'en',
        categories: ['fitness', 'health', 'lifestyle'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // App shell: cache the initial HTML, CSS, JS and fonts.
        globPatterns: ['**/*.{js,css,html,woff,woff2,ttf,png,svg,ico,webp}'],
        // Don't precache the enormous 1MB+ JPG illustrations; cache on demand.
        globIgnores: ['**/assets/*.jpg'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // Google Fonts (already preconnected in index.html).
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Exercise/dataset images from GitHub.
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'exercise-images' },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'local-images' },
          },
          {
            // The API is live data — network-first, fall back to cache/offline.
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Keep heavy vendors in stable, separately-cacheable chunks so the
        // app entry stays small and vendor updates don't bust the app cache.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router', '@tanstack/react-router'],
          motion: ['framer-motion'],
          dexie: ['dexie'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
