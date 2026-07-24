import { useCallback, useEffect, useReducer, useRef } from 'react'
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

interface State {
  books: Book[]
  totalItems: number
  loading: boolean
  error: string | null
  query: string
  page: number
  sortBy: SortOption
}

type Action =
  | { type: 'SEARCH_START'; query: string; sortBy: SortOption }
  | { type: 'SEARCH_SUCCESS'; books: Book[]; totalItems: number }
  | { type: 'SEARCH_ERROR'; message: string }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; books: Book[]; page: number }
  | { type: 'LOAD_MORE_ERROR'; message: string }
  | { type: 'SET_SORT'; sortBy: SortOption }
  | { type: 'RESET' }

function createInitialState(query: string, sortBy: SortOption): State {
  return { books: [], totalItems: 0, loading: false, error: null, query, page: 0, sortBy }
}

/**
 * query 與 sortBy 是「一次搜尋」的兩個相關欄位，用 reducer 讓它們隨每個
 * action 原子性一起更新，避免像過去 useState 版本那樣，search() 更新了
 * query 卻沒同步更新 sortBy，導致兩者不同步。
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SEARCH_START':
      return { ...state, loading: true, error: null, query: action.query, sortBy: action.sortBy, page: 0, books: [] }
    case 'SEARCH_SUCCESS':
      return { ...state, loading: false, books: action.books, totalItems: action.totalItems }
    case 'SEARCH_ERROR':
      return { ...state, loading: false, error: action.message, books: [], totalItems: 0 }
    case 'LOAD_MORE_START':
      return { ...state, loading: true, error: null }
    case 'LOAD_MORE_SUCCESS':
      return { ...state, loading: false, books: [...state.books, ...action.books], page: action.page }
    case 'LOAD_MORE_ERROR':
      return { ...state, loading: false, error: action.message }
    case 'SET_SORT':
      return { ...state, sortBy: action.sortBy }
    case 'RESET':
      return createInitialState('', state.sortBy)
    default:
      return state
  }
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

export function useBookSearch(initialQuery = '', initialSort: SortOption = 'relevance'): UseBookSearchReturn {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(initialQuery, initialSort))
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const search = useCallback(async (newQuery: string, sort: SortOption = state.sortBy) => {
    if (!newQuery.trim()) {
      reset()
      return
    }
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    dispatch({ type: 'SEARCH_START', query: newQuery, sortBy: sort })
    try {
      const result = await searchWithRetry({ query: newQuery, startIndex: 0, orderBy: sort })
      dispatch({ type: 'SEARCH_SUCCESS', books: result.items ?? [], totalItems: result.totalItems })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const message = err instanceof ApiError ? err.message : '搜尋時發生未知錯誤，請稍後再試'
      dispatch({ type: 'SEARCH_ERROR', message })
    }
  }, [state.sortBy, reset])

  // 網址帶有搜尋詞時（分享連結、重新整理），掛載時直接執行搜尋
  useEffect(() => {
    if (initialQuery.trim()) search(initialQuery, initialSort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(async () => {
    if (state.loading || !state.query) return

    const nextPage = state.page + 1
    const startIndex = nextPage * PAGE_SIZE

    dispatch({ type: 'LOAD_MORE_START' })
    try {
      const result = await searchWithRetry({ query: state.query, startIndex, orderBy: state.sortBy })
      dispatch({ type: 'LOAD_MORE_SUCCESS', books: result.items ?? [], page: nextPage })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '載入更多時發生錯誤，請稍後再試'
      dispatch({ type: 'LOAD_MORE_ERROR', message })
    }
  }, [state.loading, state.query, state.page, state.sortBy])

  const setSortBy = useCallback((sort: SortOption) => {
    if (state.query) {
      search(state.query, sort)
    } else {
      dispatch({ type: 'SET_SORT', sortBy: sort })
    }
  }, [state.query, search])

  const hasMore = state.books.length < state.totalItems && state.books.length > 0

  return {
    ...state,
    hasMore,
    search,
    loadMore,
    reset,
    setSortBy,
  }
}
