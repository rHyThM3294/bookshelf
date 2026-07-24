import { vi } from 'vitest'

// vite-plugin-pwa 的 virtual:pwa-register/react 只在真正的 Vite/PWA build
// pipeline 裡才解析得到；測試用的 Vite 實例沒有註冊該 plugin，連 import 解析
// 都會失敗（比 vi.mock 介入的時機還早），所以改用 resolve.alias 整個換掉。
export function useRegisterSW() {
  return {
    offlineReady: [false, vi.fn()] as [boolean, (v: boolean) => void],
    needRefresh: [false, vi.fn()] as [boolean, (v: boolean) => void],
    updateServiceWorker: vi.fn(),
  }
}
