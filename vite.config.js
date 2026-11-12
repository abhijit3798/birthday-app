import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'pwa-maskable-192.png', 'pwa-maskable-512.png', 'apple-touch-icon.png', 'notification-badge.png'],
      manifest: {
        name: 'Bday Reminder',
        short_name: 'Bday Reminder',
        description: 'Keep track of birthdays with live countdowns and persistent offline storage.',
        theme_color: '#1e1b4b',
        background_color: '#1e1b4b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        dontCacheBustURLsMatching: new RegExp('assets/'),
        importScripts: ['sw-notification-click.js'],
        globPatterns: [],
        maximumFileSizeToCacheInBytes: 3000000
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
