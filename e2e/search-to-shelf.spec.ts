import { test, expect } from '@playwright/test'

const mockBook = {
  id: 'hp-1',
  volumeInfo: {
    title: '哈利波特：神秘的魔法石',
    authors: ['J.K. Rowling'],
    publishedDate: '1997',
  },
}

const mockResponse = {
  kind: 'books#volumes',
  totalItems: 1,
  items: [mockBook],
}

test('搜尋書籍 → 加入書架 → 書架頁看到，且網址同步支援上一頁', async ({ page }) => {
  // 攔截 Google Books API，測試不依賴真實網路與 API 金鑰
  // 依路徑區分「搜尋」與「取得單本書」兩種端點，回傳對應的資料形狀
  await page.route('**/books/v1/volumes**', route => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith(`/volumes/${mockBook.id}`)) {
      return route.fulfill({ json: mockBook })
    }
    return route.fulfill({ json: mockResponse })
  })

  await page.goto('/')

  await page.getByRole('searchbox', { name: '搜尋書籍' }).fill('哈利波特')
  await page.getByRole('button', { name: '搜尋', exact: true }).click()

  const card = page.getByRole('button', { name: /哈利波特：神秘的魔法石/ })
  await expect(card).toBeVisible()
  await expect(page).toHaveURL(/[?&]q=/)
  await card.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(/[?&]book=/)

  // 書籍詳情有深連結：重新整理應還原同一本書的 Modal
  await page.reload()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading', { name: '哈利波特：神秘的魔法石' })).toBeVisible()

  await dialog.getByRole('button', { name: /想讀/ }).click()
  await dialog.getByRole('button', { name: '關閉' }).click()
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: /我的書架/ }).click()
  await expect(page.getByText('哈利波特：神秘的魔法石')).toBeVisible()
  await expect(page).toHaveURL(/[?&]view=shelf/)

  // 瀏覽器上一頁應還原搜尋畫面與輸入框文字
  await page.goBack()
  await expect(page.getByRole('searchbox', { name: '搜尋書籍' })).toHaveValue('哈利波特')
})
