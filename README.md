# 📚 BookShelf

> 探索、收藏、管理你的個人書單 — React + TypeScript 作品集專案

[![CI](https://github.com/rHyThM3294/bookshelf/actions/workflows/ci.yml/badge.svg)](https://github.com/rHyThM3294/bookshelf/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18)](https://vitest.dev/)

🔗 **[Live Demo](https://rHyThM3294.github.io/bookshelf/)**

---

## 專案截圖

| 搜尋探索 | 書籍詳情 | 我的書架 |
|---------|---------|---------|
| ![搜尋探索](docs/screenshots/search.png) | ![書籍詳情](docs/screenshots/detail.png) | ![我的書架](docs/screenshots/shelf.png) |
| 搜尋書名、作者，即時顯示結果 | Modal 展示完整書籍資訊 | 分類管理想讀／在讀／已讀 |

🌙 支援深色模式（右上角切換，或跟隨系統設定）：

![深色模式](docs/screenshots/dark.png)

---

## 功能

- **🔍 書籍搜尋** — 串接 Google Books API，支援書名、作者、ISBN 搜尋
- **📄 分頁載入** — 「載入更多」漸進式載入，搭配 Skeleton loading 骨架屏
- **⚡ 排序篩選** — 依相關度或出版日期排序
- **📚 書架管理** — 加入想讀 / 在讀 / 已讀三種狀態，LocalStorage 本地持久化
- **🔗 網址狀態同步** — 搜尋詞／排序／頁籤／書籍詳情反映在網址上，結果可分享連結、重新整理不遺失、支援瀏覽器上一頁／下一頁
- **🔴 Error State** — 完整的 API 錯誤處理（429、500、網路斷線）＋ 頂層 Error Boundary，元件出錯不會整頁白屏
- **♿ 無障礙** — ARIA labels、鍵盤導航、語意化 HTML，並用 axe-core 自動化掃描把關
- **📱 RWD** — 支援手機至桌機的響應式佈局
- **🌙 深色模式** — 跟隨系統偏好或手動切換，選擇會記住；用 CSS 變數切換主題，避免載入瞬間閃色（FOUC）
- **⚙️ 效能** — Modal／書架頁以 `React.lazy` 拆成獨立 chunk，縮小首屏 bundle

---

## 技術選型

| 類別 | 技術 | 選擇原因 |
|------|------|---------|
| 框架 | React 18 + TypeScript | 展示 React Hooks 模式與嚴格型別 |
| 打包 | Vite 5 | 極速 HMR，原生 ESM |
| 狀態 | `useReducer`（搜尋）＋ `useState`（書架、UI） | 搜尋的 query/sort/page/loading/error 會在同一個動作中一起變化，用 reducer 讓這些欄位原子性更新，避免互相不同步；書架、UI 狀態單純獨立，`useState` 已足夠，不為了統一而過度抽象 |
| 測試 | Vitest + React Testing Library（單元/整合）、Playwright（E2E） | 涵蓋測試金字塔三層：邏輯單元測試、元件整合測試、瀏覽器端對端測試 |
| 樣式 | Pure CSS (CSS Variables) | 無框架依賴，展示 CSS 基礎能力 |
| 部署 | GitHub Pages + GitHub Actions | 自動化 CI/CD，E2E 通過才會部署 |
| API | Google Books API | 免費、無需 API Key、資料豐富 |

---

## 架構說明

```
src/
├── types/          # TypeScript 型別定義（Google Books API、App 層）
├── services/       # API 呼叫層
│   ├── booksApi.ts      # fetch 封裝、錯誤處理、工具函式
│   ├── searchCache.ts   # 記憶體 + localStorage 雙層搜尋快取
│   └── searchHistory.ts # 最近搜尋紀錄（localStorage）
├── hooks/          # Custom Hooks
│   ├── useBookSearch.ts  # 搜尋狀態（useReducer）、分頁、AbortController
│   ├── useShelf.ts       # 書架 CRUD + localStorage 同步
│   └── useTheme.ts       # 深色／淺色主題切換 + localStorage 記憶
├── components/     # UI 元件（BookModal、ShelfPanel 以 React.lazy 拆分）
│   ├── SearchBar.tsx
│   ├── BookCard.tsx
│   ├── BookGrid.tsx
│   ├── BookModal.tsx
│   ├── ShelfPanel.tsx
│   ├── StatsBar.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx  # 頂層錯誤邊界，避免單一元件出錯導致整頁白屏
└── __tests__/      # 單元／整合測試（Vitest + RTL）
    ├── setup.ts
    ├── booksApi.test.ts
    ├── useShelf.test.ts
    ├── ErrorBoundary.test.tsx
    └── App.test.tsx   # 整合測試：搜尋 → 開詳情 → 加入書架 → 切換頁面

e2e/                # Playwright E2E 測試（瀏覽器端對端）
├── search-to-shelf.spec.ts
└── a11y.spec.ts    # axe-core 自動化無障礙掃描，淺色／深色主題各掃一次

public/             # 靜態資源（favicon、OG 分享圖）
scripts/            # 開發用腳本（不接 CI）
└── screenshots.spec.ts  # 產生 README 截圖
```

### 資料流設計

```
使用者輸入 → useBookSearch hook
          → booksApi.searchBooks()
          → Google Books API
          → loading / error / data state
          → BookGrid 顯示
```

---

## 本地開發

```bash
# 1. Clone
git clone https://github.com/rHyThM3294/bookshelf.git
cd bookshelf

# 2. 安裝依賴
npm install

# 2.1 （選填）設定 API 金鑰 — 複製後視需要填入，留空也能跑
cp .env.example .env.local

# 3. 啟動開發伺服器
npm run dev
# → http://localhost:5173/bookshelf/

# 4. 執行測試
npm test

# 5. 型別檢查與 Lint
npm run type-check
npm run lint

# 6. E2E 測試（第一次需先安裝瀏覽器）
npx playwright install chromium
npm run test:e2e

# 7. 建置
npm run build

# 8. （選填）重新產生 README 用截圖，存到 docs/screenshots/
npm run screenshots
```

> **Google Books API** 不需要 API Key 即可使用（有請求頻率限制）。

---

## 測試覆蓋

```bash
npm run test:coverage
```

測試範圍：
- `booksApi.ts` — URL 參數組成、HTTP 錯誤處理（429/500）、工具函式
- `useShelf.ts` — CRUD 操作、LocalStorage 持久化、狀態計算
- `ErrorBoundary.tsx` — 子元件丟出例外時正確顯示 fallback，而非整頁白屏
- `App.tsx`（整合測試）— 搜尋 → 開啟詳情 → 加入書架 → 切換頁面的完整使用者流程
- `e2e/search-to-shelf.spec.ts`（Playwright）— 同一條關鍵路徑在真實瀏覽器中執行，並驗證網址同步、瀏覽器上一頁、書籍詳情深連結（重新整理還原 Modal）
- `e2e/a11y.spec.ts`（Playwright + axe-core）— 對首頁、搜尋結果、書籍詳情 Modal、書架頁自動掃描無障礙違規，淺色／深色主題各跑一輪（曾抓出深色模式下沒隨主題變色的寫死背景色）

---

## CI/CD 流程

```
Push to main
    │
    ▼
┌─────────────────┐
│ Job 1: test     │  tsc --noEmit + eslint + vitest run
└────────┬────────┘
         │ pass
    ┌────┴─────┐
    ▼          ▼
┌─────────┐ ┌─────────┐
│ Job 2:  │ │ Job 3:  │  vite build
│ e2e     │ │ build   │  playwright test（瀏覽器端對端）
└────┬────┘ └────┬────┘
     │ pass       │ pass (main branch only)
     └─────┬──────┘
           ▼
     ┌─────────────┐
     │ Job 4:      │  GitHub Pages
     │ deploy      │
     └─────────────┘
```

PR 只會執行 test + e2e + build，不會觸發 deploy；deploy 需要 build 與 e2e 都通過。

---

## 部署到 GitHub Pages

1. Fork 此 repo
2. 修改 `vite.config.ts` 的 `base` 為你的 repo 名稱
3. 修改 `README.md` 中的 `rHyThM3294`
4. 前往 **Settings → Pages → Source → GitHub Actions**
5. Push 到 main，Actions 自動完成部署

---

## 學習重點

這個專案展示了以下前端開發能力：

- **TypeScript 嚴格模式** — 完整型別定義，無 `any`
- **Custom Hooks 設計** — 關注點分離，邏輯可測試；依狀態複雜度選擇 `useReducer` 或 `useState`，並在 README 說明取捨
- **API 整合最佳實踐** — AbortController 取消請求、429/403 退避重試、雙層快取、完整 error state
- **測試金字塔** — Vitest 單元測試（service/hook）→ React Testing Library 整合測試（元件互動）→ Playwright E2E（真實瀏覽器關鍵路徑 + axe-core 無障礙掃描）
- **效能** — `React.lazy` 拆分非首屏元件，縮小初始 bundle
- **路由狀態** — 搜尋詞／排序／頁籤／書籍詳情同步至網址，支援分享連結、深連結與瀏覽器上一頁／下一頁
- **韌性設計** — 頂層 Error Boundary 攔截未預期例外，避免整頁白屏
- **CI/CD** — 型別檢查 → Lint → 測試 → E2E（含無障礙掃描）→ 建置 → 自動部署，任一項沒過不會部署
- **無障礙** — ARIA、語意化 HTML、鍵盤導航（含 Enter / Space 鍵）、WCAG AA 色彩對比，並用 axe-core 自動化把關（曾抓出並修正對比度不足、標題階層跳級、無效 ARIA role 等問題）

---

## License

[MIT](LICENSE)