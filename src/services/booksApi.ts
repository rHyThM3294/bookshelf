import type { BooksApiResponse, Book, SortOption } from '../types'

const BASE_URL = 'https://www.googleapis.com/books/v1'
const MAX_RESULTS = 12

export class ApiError extends Error{
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
async function fetchJson<T>(url: string): Promise<T>{
  const response = await fetch(url)

  if (!response.ok){
    if (response.status === 429){
      throw new ApiError(429, '請求次數過多，請稍後再試')
    }
    if (response.status >= 500){
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

export async function searchBooks(params: SearchBooksParams): Promise<BooksApiResponse> {
  const { query, startIndex = 0, orderBy = 'relevance', langRestrict } = params

  if (!query.trim()) {
    return { kind: 'books#volumes', totalItems: 0, items: [] }
  }

  const url = new URL(`${BASE_URL}/volumes`)
  url.searchParams.set('q', query.trim())
  url.searchParams.set('maxResults', String(MAX_RESULTS))
  url.searchParams.set('startIndex', String(startIndex))
  url.searchParams.set('orderBy', orderBy)
  url.searchParams.set('printType', 'books')
  url.searchParams.set('key', import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ?? '')
  if (langRestrict) {
    url.searchParams.set('langRestrict', langRestrict)
  }
  return fetchJson<BooksApiResponse>(url.toString())
}
export async function getBookById(id: string): Promise<Book> {
  const url = `${BASE_URL}/volumes/${encodeURIComponent(id)}?key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ?? ''}`
  return fetchJson<Book>(url)
}

export function getBookCover(book: Book, size: 'small' | 'large' = 'large'): string {
  const links = book.volumeInfo.imageLinks
  if (!links) return ''

  const url = size === 'large' ? links.thumbnail : links.smallThumbnail
  if (!url) return ''

  // Force HTTPS and higher quality
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
