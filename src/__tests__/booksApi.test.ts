import { describe, it, expect, vi } from 'vitest'
import { searchBooks, getBookById, getBookCover, getAuthors, ApiError } from '../services/booksApi'
import type { Book, BooksApiResponse } from '../types'

const mockBook: Book = {
  id: 'test-id-123',
  volumeInfo: {
    title: '深夜加油站遇見蘇格拉底',
    authors: ['Dan Millman'],
    publisher: '心靈工坊',
    publishedDate: '2005',
    description: '一本關於人生意義的書。',
    pageCount: 280,
    categories: ['Self-Help'],
    averageRating: 4.5,
    ratingsCount: 1200,
    imageLinks: {
      thumbnail: 'http://books.google.com/thumbnail.jpg',
      smallThumbnail: 'http://books.google.com/smallthumbnail.jpg',
    },
    language: 'zh',
  },
}

const mockApiResponse: BooksApiResponse = {
  kind: 'books#volumes',
  totalItems: 1,
  items: [mockBook],
}

describe('booksApi', () => {
  describe('searchBooks', () => {
    it('returns empty result for empty query', async () => {
      const result = await searchBooks({ query: '' })
      expect(result.totalItems).toBe(0)
      expect(result.items).toEqual([])
      expect(fetch).not.toHaveBeenCalled()
    })

    it('returns empty result for whitespace-only query', async () => {
      const result = await searchBooks({ query: '   ' })
      expect(result.totalItems).toBe(0)
    })

    it('calls fetch with correct URL parameters', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockApiResponse), { status: 200 })
      )

      await searchBooks({ query: '哈利波特', orderBy: 'newest' })

      expect(fetch).toHaveBeenCalledOnce()
      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(calledUrl).toContain('q=%E5%93%88%E5%88%A9%E6%B3%A2%E7%89%B9')
      expect(calledUrl).toContain('orderBy=newest')
      expect(calledUrl).toContain('maxResults=12')
    })

    it('returns book data on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockApiResponse), { status: 200 })
      )

      const result = await searchBooks({ query: '哈利波特' })
      expect(result.totalItems).toBe(1)
      expect(result.items?.[0].id).toBe('test-id-123')
    })

    it('throws ApiError on 429 rate limit', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response('', { status: 429 })
      )

      await expect(searchBooks({ query: '書' })).rejects.toThrow(ApiError)
      await expect(searchBooks({ query: '書' })).rejects.toThrow('請求次數過多')
    })

    it('throws ApiError on 500 server error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('', { status: 500 })
      )

      await expect(searchBooks({ query: '書' })).rejects.toThrow(ApiError)
    })

    it('includes langRestrict when provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockApiResponse), { status: 200 })
      )

      await searchBooks({ query: '書', langRestrict: 'zh' })
      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
      expect(calledUrl).toContain('langRestrict=zh')
    })
  })

  describe('getBookById', () => {
    it('fetches a single book by ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockBook), { status: 200 })
      )

      const result = await getBookById('test-id-123')
      expect(result.id).toBe('test-id-123')
      expect(result.volumeInfo.title).toBe('深夜加油站遇見蘇格拉底')
    })

    it('throws ApiError when book not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Not found' } }),
          { status: 404 }
        )
      )

      await expect(getBookById('nonexistent')).rejects.toThrow(ApiError)
    })
  })

  describe('getBookCover', () => {
    it('returns HTTPS thumbnail URL', () => {
      const url = getBookCover(mockBook, 'large')
      expect(url).toContain('https://')
      expect(url).not.toContain('http://')
    })

    it('returns small thumbnail for small size', () => {
      const url = getBookCover(mockBook, 'small')
      expect(url).toContain('smallthumbnail')
    })

    it('returns empty string when no imageLinks', () => {
      const bookWithoutCover: Book = {
        ...mockBook,
        volumeInfo: { ...mockBook.volumeInfo, imageLinks: undefined },
      }
      expect(getBookCover(bookWithoutCover)).toBe('')
    })
  })

  describe('getAuthors', () => {
    it('returns author name', () => {
      expect(getAuthors(mockBook)).toBe('Dan Millman')
    })

    it('joins two authors with 、', () => {
      const twoAuthors: Book = {
        ...mockBook,
        volumeInfo: { ...mockBook.volumeInfo, authors: ['Author A', 'Author B'] },
      }
      expect(getAuthors(twoAuthors)).toBe('Author A、Author B')
    })

    it('truncates more than 2 authors', () => {
      const manyAuthors: Book = {
        ...mockBook,
        volumeInfo: { ...mockBook.volumeInfo, authors: ['A', 'B', 'C', 'D'] },
      }
      expect(getAuthors(manyAuthors)).toBe('A、B 等')
    })

    it('returns 作者不詳 when no authors', () => {
      const noAuthor: Book = {
        ...mockBook,
        volumeInfo: { ...mockBook.volumeInfo, authors: undefined },
      }
      expect(getAuthors(noAuthor)).toBe('作者不詳')
    })
  })
})