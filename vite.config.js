import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Kiosk-App: Service Worker precacht alle Assets, damit Attract-Mode,
// Hub und statische Module auch bei Netzabriss auf der Messe weiterlaufen.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': WIR entscheiden, wann die neue Version aktiviert wird —
      // naemlich im Attract-Mode (KioskSession), wenn niemand die App nutzt.
      registerType: 'prompt',
      includeAssets: ['robbe-logo.png', 'fairs/**/*'],
      manifest: {
        name: 'Robbeversum — Messe-Kiosk',
        short_name: 'Robbeversum',
        display: 'fullscreen',
        background_color: '#F8F7F4',
        theme_color: '#B3000E',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Chats/Webhooks laufen immer live — nur eigene Assets cachen.
        navigateFallback: 'index.html',
      },
    }),
  ],
})
