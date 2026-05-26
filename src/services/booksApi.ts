import type { BooksApiResponse, Book, SortOption } from '../types'
import { cacheGet, cacheSet, getInFlight, setInFlight, pruneExpiredCache } from './searchCache'

const BASE_URL = 'https://www.googleapis.com/books/v1'
const MAX_RESULTS = 12
const API_KEY: string | undefined = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY as string | undefined)
  : undefined

// 啟動時清理過期快取
pruneExpiredCache()

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new ApiError(429, '請求次數過多，請稍後再試')
    }
    if (response.status === 403) {
      throw new ApiError(403, 'API 金鑰配額已用完，請明天再試或更換金鑰')
    }
    if (response.status >= 500) {
      throw new ApiError(response.status, '伺服器暫時無法使用，請稍後再試')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      (errorData as { error?: { message?: string } }).error?.message ?? `請求失敗 (${response.status})`
    )
  }

  return response.json() as Promise<T>
}

export interface SearchBooksParams {
  query: string
  startIndex?: number
  orderBy?: SortOption
  langRestrict?: string
}

/** 產生快取 key（包含所有影響結果的參數） */
function buildCacheKey(params: Required<Omit<SearchBooksParams, 'langRestrict'>> & { langRestrict?: string }): string {
  return `${params.query}|${params.startIndex}|${params.orderBy}|${params.langRestrict ?? ''}`
}

export async function searchBooks(params: SearchBooksParams): Promise<BooksApiResponse> {
  const { query, startIndex = 0, orderBy = 'relevance', langRestrict } = params

  if (!query.trim()) {
    return { kind: 'books#volumes', totalItems: 0, items: [] }
  }

  const cacheKey = buildCacheKey({ query: query.trim(), startIndex, orderBy, langRestrict })

  // 1. 先查快取
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  // 2. 若相同請求正在進行中，等它完成就好（不要再發一次）
  const existing = getInFlight(cacheKey)
  if (existing) return existing

  // 3. 建立新請求
  const url = new URL(`${BASE_URL}/volumes`)
  url.searchParams.set('q', query.trim())
  url.searchParams.set('maxResults', String(MAX_RESULTS))
  url.searchParams.set('startIndex', String(startIndex))
  url.searchParams.set('orderBy', orderBy)
  url.searchParams.set('printType', 'books')
  if (API_KEY) {
    url.searchParams.set('key', API_KEY)
  }
  if (langRestrict) {
    url.searchParams.set('langRestrict', langRestrict)
  }

  const promise = fetchJson<BooksApiResponse>(url.toString()).then(data => {
    cacheSet(cacheKey, data)  // 成功後寫入快取
    return data
  })

  setInFlight(cacheKey, promise)
  return promise
}

export async function getBookById(id: string): Promise<Book> {
  const url = new URL(`${BASE_URL}/volumes/${encodeURIComponent(id)}`)
  if (API_KEY) {
    url.searchParams.set('key', API_KEY)
  }
  return fetchJson<Book>(url.toString())
}

export function getBookCover(book: Book, size: 'small' | 'large' = 'large'): string {
  const links = book.volumeInfo.imageLinks
  if (!links) return ''

  const url = size === 'large' ? links.thumbnail : links.smallThumbnail
  if (!url) return ''

  return url.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
}

export function getAuthors(book: Book): string {
  const authors = book.volumeInfo.authors
  if (!authors || authors.length === 0) return '作者不詳'
  if (authors.length <= 2) return authors.join('、')
  return `${authors.slice(0, 2).join('、')} 等`
}

export function truncateDescription(description: string, maxLength = 200): string {
  if (description.length <= maxLength) return description
  return description.slice(0, maxLength).trimEnd() + '...'
}
