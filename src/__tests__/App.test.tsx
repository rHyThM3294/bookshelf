import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import type { Book, BooksApiResponse } from '../types'

const mockBook: Book = {
  id: 'hp-1',
  volumeInfo: {
    title: '哈利波特：神秘的魔法石',
    authors: ['J.K. Rowling'],
    publishedDate: '1997',
  },
}

const mockResponse: BooksApiResponse = {
  kind: 'books#volumes',
  totalItems: 1,
  items: [mockBook],
}

describe('App 整合流程', () => {
  it('搜尋 → 開啟詳情 → 加入書架 → 在書架頁看到', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const user = userEvent.setup()
    render(<App />)

    // 1. 搜尋
    await user.type(screen.getByRole('searchbox', { name: '搜尋書籍' }), '哈利波特')
    await user.click(screen.getByRole('button', { name: '搜尋' }))

    // 2. 結果卡片出現，點擊開啟詳情
    const card = await screen.findByRole('button', { name: /哈利波特：神秘的魔法石/ })
    await user.click(card)

    // 3. Modal 開啟，加入「想讀」書架
    const dialog = await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /想讀/ }))
    await user.click(screen.getByRole('button', { name: '關閉' }))
    expect(dialog).not.toBeInTheDocument()

    // 4. 切到書架頁，確認出現剛加入的書
    await user.click(screen.getByRole('button', { name: /我的書架/ }))
    expect(await screen.findByText('哈利波特：神秘的魔法石')).toBeInTheDocument()
    expect(screen.getByText(/1 想讀/)).toBeInTheDocument()
  })
})
