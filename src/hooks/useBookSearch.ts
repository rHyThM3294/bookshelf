import { useState, useCallback, useRef } from 'react'
import { searchBooks, ApiError } from '../services/booksApi'
import type { Book, SortOption } from '../types'

const PAGE_SIZE = 12

/**
 * 429 / 403 退避重試
 * 最多重試 2 次，每次等待 retryAfter 秒（預設 2s）
 */
async function searchWithRetry(
  params: Parameters<typeof searchBooks>[0],
  maxRetries = 2
): Promise<Awaited<ReturnType<typeof searchBooks>>> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await searchBooks(params)
    } catch (err) {
      lastError = err
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        if (attempt < maxRetries) {
          const waitMs = (attempt + 1) * 2000  // 2s, 4s
          await new Promise(r => setTimeout(r, waitMs))
          continue
        }
      }
      throw err
    }
  }
  throw lastError
}

interface UseBookSearchReturn {
  books: Book[]
  totalItems: number
  loading: boolean
  error: string | null
  query: string
  page: number
  sortBy: SortOption
  hasMore: boolean
  search: (query: string, sort?: SortOption) => Promise<void>
  loadMore: () => Promise<void>
  reset: () => void
  setSortBy: (sort: SortOption) => void
}

export function useBookSearch(): UseBookSearchReturn {
  const [books, setBooks] = useState<Book[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [sortBy, setSortByState] = useState<SortOption>('relevance')

  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setBooks([])
    setTotalItems(0)
    setError(null)
    setPage(0)
    setQuery('')
  }, [])

  const search = useCallback(async (newQuery: string, sort: SortOption = sortBy) => {
    if (!newQuery.trim()) {
      reset()
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setQuery(newQuery)
    setPage(0)
    setBooks([])

    try {
      const result = await searchWithRetry({
        query: newQuery,
        startIndex: 0,
        orderBy: sort,
      })

      setBooks(result.items ?? [])
      setTotalItems(result.totalItems)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('搜尋時發生未知錯誤，請稍後再試')
      }
      setBooks([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [sortBy, reset])

  const loadMore = useCallback(async () => {
    if (loading || !query) return

    const nextPage = page + 1
    const startIndex = nextPage * PAGE_SIZE

    setLoading(true)
    setError(null)

    try {
      const result = await searchWithRetry({
        query,
        startIndex,
        orderBy: sortBy,
      })

      setBooks(prev => [...prev, ...(result.items ?? [])])
      setPage(nextPage)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('載入更多時發生錯誤，請稍後再試')
      }
    } finally {
      setLoading(false)
    }
  }, [loading, query, page, sortBy])

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort)
    if (query) {
      search(query, sort)
    }
  }, [query, search])

  const hasMore = books.length < totalItems && books.length > 0

  return {
    books,
    totalItems,
    loading,
    error,
    query,
    page,
    sortBy,
    hasMore,
    search,
    loadMore,
    reset,
    setSortBy,
  }
}
