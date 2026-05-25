import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShelf } from '../hooks/useShelf'
import type { Book } from '../types'

const mockBook: Book = {
  id: 'book-001',
  volumeInfo: {
    title: '挪威的森林',
    authors: ['村上春樹'],
    publishedDate: '1987',
    language: 'ja',
  },
}

const mockBook2: Book = {
  id: 'book-002',
  volumeInfo: {
    title: '1Q84',
    authors: ['村上春樹'],
    publishedDate: '2009',
    language: 'ja',
  },
}

describe('useShelf', () => {
  it('initializes with empty shelf', () => {
    const { result } = renderHook(() => useShelf())
    expect(result.current.items).toHaveLength(0)
  })

  it('adds a book to the shelf', () => {
    const { result } = renderHook(() => useShelf())

    act(() => {
      result.current.addBook(mockBook, 'want-to-read')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].bookId).toBe('book-001')
    expect(result.current.items[0].status).toBe('want-to-read')
  })

  it('updates status when adding existing book', () => {
    const { result } = renderHook(() => useShelf())

    act(() => {
      result.current.addBook(mockBook, 'want-to-read')
    })
    act(() => {
      result.current.addBook(mockBook, 'reading')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].status).toBe('reading')
  })

  it('removes a book from the shelf', () => {
    const { result } = renderHook(() => useShelf())

    act(() => {
      result.current.addBook(mockBook, 'want-to-read')
      result.current.addBook(mockBook2, 'read')
    })
    act(() => {
      result.current.removeBook('book-001')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].bookId).toBe('book-002')
  })

  it('updates reading status', () => {
    const { result } = renderHook(() => useShelf())

    act(() => {
      result.current.addBook(mockBook, 'want-to-read')
    })
    act(() => {
      result.current.updateStatus('book-001', 'read')
    })

    expect(result.current.getStatus('book-001')).toBe('read')
  })

  it('returns null status for books not in shelf', () => {
    const { result } = renderHook(() => useShelf())
    expect(result.current.getStatus('nonexistent')).toBeNull()
  })

  it('correctly checks if book is in shelf', () => {
    const { result } = renderHook(() => useShelf())

    expect(result.current.isInShelf('book-001')).toBe(false)

    act(() => {
      result.current.addBook(mockBook, 'reading')
    })

    expect(result.current.isInShelf('book-001')).toBe(true)
  })

  it('counts books by status correctly', () => {
    const { result } = renderHook(() => useShelf())

    act(() => {
      result.current.addBook(mockBook, 'reading')
      result.current.addBook(mockBook2, 'read')
    })

    expect(result.current.countByStatus('reading')).toBe(1)
    expect(result.current.countByStatus('read')).toBe(1)
    expect(result.current.countByStatus('want-to-read')).toBe(0)
  })

  it('persists data to localStorage', () => {
    const { result } = renderHook(() => useShelf())

    act(() => {
      result.current.addBook(mockBook, 'want-to-read')
    })

    const stored = localStorage.getItem('bookshelf-items')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed[0].bookId).toBe('book-001')
  })

  it('loads persisted data from localStorage on init', () => {
    const existingData = [
      {
        bookId: 'book-001',
        status: 'read',
        addedAt: new Date().toISOString(),
        book: mockBook,
      },
    ]
    localStorage.setItem('bookshelf-items', JSON.stringify(existingData))

    const { result } = renderHook(() => useShelf())
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].status).toBe('read')
  })
})
