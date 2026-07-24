import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/bookshelf/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'BookShelf — 探索、收藏、管理你的個人書單',
        short_name: 'BookShelf',
        description: '探索、收藏、管理你的個人書單，串接 Google Books API',
        lang: 'zh-TW',
        theme_color: '#1a1612',
        background_color: '#faf8f5',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 搜尋結果／單本書 API：先給快取讓離線也能看，同時背景更新
        // 封面圖幾乎不會變：直接長期快取，減少重複下載
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://www.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-books-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 6 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://books.google.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'book-covers',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
