import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
const BASE_URL = `http://localhost:${PORT}/bookshelf/`

/**
 * 專門用來產生 README 截圖的設定，走真實 Google Books API（不 mock），
 * 讓截圖裡看得到真實書封。不接 CI，僅供本機手動執行 `npm run screenshots`。
 */
export default defineConfig({
  testDir: './scripts',
  workers: 1,
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
