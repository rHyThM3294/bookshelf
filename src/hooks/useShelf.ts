import { useState, useCallback, useEffect } from 'react'
import type { Book, ShelfBook, ReadingStatus } from '../types'

const STORAGE_KEY = 'bookshelf-items'

function loadFromStorage(): ShelfBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ShelfBook[]
  } catch {
    return []
  }
}

function saveToStorage(items: ShelfBook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage might be full; fail silently
  }
}

interface UseShelfReturn {
  items: ShelfBook[]
  addBook: (book: Book, status: ReadingStatus) => void
  removeBook: (bookId: string) => void
  updateStatus: (bookId: string, status: ReadingStatus) => void
  getStatus: (bookId: string) => ReadingStatus | null
  isInShelf: (bookId: string) => boolean
  countByStatus: (status: ReadingStatus) => number
}

export function useShelf(): UseShelfReturn {
  const [items, setItems] = useState<ShelfBook[]>(loadFromStorage)

  useEffect(() => {
    saveToStorage(items)
  }, [items])

  const addBook = useCallback((book: Book, status: ReadingStatus) => {
    setItems(prev => {
      const exists = prev.find(item => item.bookId === book.id)
      if (exists) {
        return prev.map(item =>
          item.bookId === book.id ? { ...item, status } : item
        )
      }
      const newItem: ShelfBook = {
        bookId: book.id,
        status,
        addedAt: new Date().toISOString(),
        book,
      }
      return [newItem, ...prev]
    })
  }, [])

  const removeBook = useCallback((bookId: string) => {
    setItems(prev => prev.filter(item => item.bookId !== bookId))
  }, [])

  const updateStatus = useCallback((bookId: string, status: ReadingStatus) => {
    setItems(prev =>
      prev.map(item => (item.bookId === bookId ? { ...item, status } : item))
    )
  }, [])

  const getStatus = useCallback(
    (bookId: string): ReadingStatus | null => {
      return items.find(item => item.bookId === bookId)?.status ?? null
    },
    [items]
  )

  const isInShelf = useCallback(
    (bookId: string): boolean => {
      return items.some(item => item.bookId === bookId)
    },
    [items]
  )

  const countByStatus = useCallback(
    (status: ReadingStatus): number => {
      return items.filter(item => item.status === status).length
    },
    [items]
  )

  return { items, addBook, removeBook, updateStatus, getStatus, isInShelf, countByStatus }
}
