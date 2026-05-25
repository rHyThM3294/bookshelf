// Google Books API types

export interface BookVolumeInfo {
  title: string
  authors?: string[]
  publisher?: string
  publishedDate?: string
  description?: string
  pageCount?: number
  categories?: string[]
  averageRating?: number
  ratingsCount?: number
  imageLinks?: {
    smallThumbnail?: string
    thumbnail?: string
  }
  language?: string
  previewLink?: string
  infoLink?: string
}

export interface BookSaleInfo {
  saleability: 'FOR_SALE' | 'FREE' | 'NOT_FOR_SALE' | 'FOR_PREORDER'
  buyLink?: string
}

export interface Book {
  id: string
  volumeInfo: BookVolumeInfo
  saleInfo?: BookSaleInfo
}

export interface BooksApiResponse {
  kind: string
  totalItems: number
  items?: Book[]
}

// App-level types

export type ReadingStatus = 'want-to-read' | 'reading' | 'read'

export interface ShelfBook {
  bookId: string
  status: ReadingStatus
  addedAt: string
  book: Book
}

export interface SearchState {
  query: string
  books: Book[]
  totalItems: number
  loading: boolean
  error: string | null
  page: number
}

export interface ShelfState {
  items: ShelfBook[]
}

export type SortOption = 'relevance' | 'newest'
