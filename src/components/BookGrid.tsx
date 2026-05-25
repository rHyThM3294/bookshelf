import { BookCard } from './BookCard'
import type { Book, ReadingStatus } from '../types'

interface BookGridProps {
  books: Book[]
  loading: boolean
  hasMore: boolean
  onBookClick: (book: Book) => void
  onLoadMore: () => void
  getStatus: (bookId: string) => ReadingStatus | null
}

export function BookGrid({
  books,
  loading,
  hasMore,
  onBookClick,
  onLoadMore,
  getStatus,
}: BookGridProps) {
  return (
    <section className="book-grid-section">
      <div className="book-grid" role="list" aria-label="搜尋結果">
        {books.map(book => (
          <div key={book.id} role="listitem">
            <BookCard
              book={book}
              onClick={onBookClick}
              status={getStatus(book.id)}
            />
          </div>
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="skeleton-card" aria-hidden="true" />
          ))}
      </div>

      {hasMore && !loading && (
        <div className="load-more-wrap">
          <button className="load-more-btn" onClick={onLoadMore}>
            載入更多
          </button>
        </div>
      )}
    </section>
  )
}
