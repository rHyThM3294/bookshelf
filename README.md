# 📚 BookShelf

> 探索、收藏、管理你的個人書單 — React + TypeScript 作品集專案

[![CI](https://github.com/YOUR_USERNAME/bookshelf/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/bookshelf/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18)](https://vitest.dev/)

🔗 **[Live Demo](https://YOUR_USERNAME.github.io/bookshelf/)**

---

## 專案截圖

| 搜尋探索 | 書籍詳情 | 我的書架 |
|---------|---------|---------|
| 搜尋書名、作者，即時顯示結果 | Modal 展示完整書籍資訊 | 分類管理想讀／在讀／已讀 |

---

## 功能

- **🔍 書籍搜尋** — 串接 Google Books API，支援書名、作者、ISBN 搜尋
- **📄 分頁載入** — 「載入更多」漸進式載入，搭配 Skeleton loading 骨架屏
- **⚡ 排序篩選** — 依相關度或出版日期排序
- **📚 書架管理** — 加入想讀 / 在讀 / 已讀三種狀態，LocalStorage 本地持久化
- **🔴 Error State** — 完整的 API 錯誤處理（429、500、網路斷線）
- **♿ 無障礙** — ARIA labels、鍵盤導航、語意化 HTML
- **📱 RWD** — 支援手機至桌機的響應式佈局

---

## 技術選型

| 類別 | 技術 | 選擇原因 |
|------|------|---------|
| 框架 | React 18 + TypeScript | 展示 React Hooks 模式與嚴格型別 |
| 打包 | Vite 5 | 極速 HMR，原生 ESM |
| 狀態 | useState + Custom Hooks | 符合功能規模，不過度工程化 |
| 測試 | Vitest + React Testing Library | 與 Vite 生態整合，API 與 Jest 相容 |
| 樣式 | Pure CSS (CSS Variables) | 無框架依賴，展示 CSS 基礎能力 |
| 部署 | GitHub Pages + GitHub Actions | 自動化 CI/CD |
| API | Google Books API | 免費、無需 API Key、資料豐富 |

---

## 架構說明

```
src/
├── types/          # TypeScript 型別定義（Google Books API、App 層）
├── services/       # API 呼叫層（booksApi.ts）
│   └── booksApi.ts # fetch 封裝、錯誤處理、工具函式
├── hooks/          # Custom Hooks
│   ├── useBookSearch.ts  # 搜尋狀態、分頁、AbortController
│   └── useShelf.ts       # 書架 CRUD + localStorage 同步
├── components/     # UI 元件
│   ├── SearchBar.tsx
│   ├── BookCard.tsx
│   ├── BookGrid.tsx
│   ├── BookModal.tsx
│   ├── ShelfPanel.tsx
│   └── EmptyState.tsx
└── __tests__/      # 測試檔案
    ├── setup.ts
    ├── booksApi.test.ts
    └── useShelf.test.ts
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
git clone https://github.com/YOUR_USERNAME/bookshelf.git
cd bookshelf

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
# → http://localhost:5173/bookshelf/

# 4. 執行測試
npm test

# 5. 型別檢查
npm run type-check

# 6. 建置
npm run build
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

---

## CI/CD 流程

```
Push to main
    │
    ▼
┌─────────────────┐
│ Job 1: test     │  tsc --noEmit + vitest run
└────────┬────────┘
         │ pass
    ▼
┌─────────────────┐
│ Job 2: build    │  vite build
└────────┬────────┘
         │ pass (main branch only)
    ▼
┌─────────────────┐
│ Job 3: deploy   │  GitHub Pages
└─────────────────┘
```

PR 只會執行 test + build，不會觸發 deploy。

---

## 部署到 GitHub Pages

1. Fork 此 repo
2. 修改 `vite.config.ts` 的 `base` 為你的 repo 名稱
3. 修改 `README.md` 中的 `YOUR_USERNAME`
4. 前往 **Settings → Pages → Source → GitHub Actions**
5. Push 到 main，Actions 自動完成部署

---

## 學習重點

這個專案展示了以下前端開發能力：

- **TypeScript 嚴格模式** — 完整型別定義，無 `any`
- **Custom Hooks 設計** — 關注點分離，邏輯可測試
- **API 整合最佳實踐** — AbortController 取消請求、完整 error state
- **單元測試** — Mock fetch、Mock localStorage、Hook 測試
- **CI/CD** — 型別檢查 → 測試 → 建置 → 自動部署的完整流程
- **無障礙** — ARIA、語意化 HTML、鍵盤導航

---

## License

MIT
