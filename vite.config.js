import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FocusFlow — Adaptive Study & Productivity Assistant',
        short_name: 'FocusFlow',
        description: 'Chart your focus like a night sky. A local-first study session tracker with a Focus Score and rule-based insights.',
        theme_color: '#120B1E',
        background_color: '#120B1E',
        display: 'standalone',
        start_url: '/',
        // Assumption: single scalable SVG icon in place of generated PNG raster
        // sets (no image-generation tooling in this build environment) — every
        // modern PWA-installing browser accepts an SVG "any"-purpose icon.
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
