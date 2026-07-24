import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const mockBook = {
  id: 'hp-1',
  volumeInfo: {
    title: '哈利波特：神秘的魔法石',
    authors: ['J.K. Rowling'],
    publishedDate: '1997',
    imageLinks: { thumbnail: 'https://books.google.com/thumbnail.jpg' },
  },
}

const mockResponse = { kind: 'books#volumes', totalItems: 1, items: [mockBook] }

// 淺色／深色主題都要掃過一次：index.html 的 inline script 會讀 prefers-color-scheme，
// Playwright 的 colorScheme context 選項可以直接模擬系統偏好，不用手動點切換鈕
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`自動化無障礙掃描（axe-core） — ${colorScheme} 主題`, () => {
    test.use({ colorScheme })

    test.beforeEach(async ({ page }) => {
      // 攔截 Google Books API，測試不依賴真實網路與 API 金鑰
      await page.route('**/books/v1/volumes**', route => {
        const url = new URL(route.request().url())
        if (url.pathname.endsWith(`/volumes/${mockBook.id}`)) {
          return route.fulfill({ json: mockBook })
        }
        return route.fulfill({ json: mockResponse })
      })
    })

    test('首頁（建議搜尋詞畫面）', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('試試搜尋這些')).toBeVisible()

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })

    test('搜尋結果畫面', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('searchbox', { name: '搜尋書籍' }).fill('哈利波特')
      await page.getByRole('button', { name: '搜尋', exact: true }).click()
      await expect(page.getByRole('button', { name: /哈利波特：神秘的魔法石/ })).toBeVisible()

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })

    test('書籍詳情 Modal', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('searchbox', { name: '搜尋書籍' }).fill('哈利波特')
      await page.getByRole('button', { name: '搜尋', exact: true }).click()
      await page.getByRole('button', { name: /哈利波特：神秘的魔法石/ }).click()
      await expect(page.getByRole('dialog')).toBeVisible()

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })

    test('我的書架畫面（含空狀態）', async ({ page }) => {
      await page.goto('/?view=shelf')
      await expect(page.getByText('書架還是空的')).toBeVisible()

      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  })
}
