import { test } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const OUT_DIR = 'docs/screenshots'

test.beforeAll(() => {
  mkdirSync(OUT_DIR, { recursive: true })
})

async function searchAndOpenFirstCard(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('searchbox', { name: '搜尋書籍' }).fill('村上春樹')
  await page.getByRole('button', { name: '搜尋', exact: true }).click()
  const list = page.getByRole('list', { name: '搜尋結果' })
  await list.waitFor()
  await page.waitForTimeout(800) // 等封面圖載入
  return list.getByRole('button').first()
}

test('探索書籍畫面', async ({ page }) => {
  await searchAndOpenFirstCard(page)
  await page.screenshot({ path: `${OUT_DIR}/search.png` })
})

test('書籍詳情畫面', async ({ page }) => {
  const firstCard = await searchAndOpenFirstCard(page)
  await firstCard.click()
  await page.getByRole('dialog').waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT_DIR}/detail.png` })
})

test('我的書架畫面', async ({ page }) => {
  const firstCard = await searchAndOpenFirstCard(page)
  await firstCard.click()
  await page.getByRole('button', { name: /想讀/ }).click()
  await page.getByRole('button', { name: '關閉' }).click()
  await page.getByRole('button', { name: /我的書架/ }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT_DIR}/shelf.png` })
})
