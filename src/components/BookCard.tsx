import { getBookCover, getAuthors } from '../services/booksApi'
import type { Book, ReadingStatus } from '../types'

const STATUS_LABEL: Record<ReadingStatus, string> = {
  'want-to-read': '想讀',
  'reading': '在讀',
  'read': '已讀',
}

const STATUS_CLASS: Record<ReadingStatus, string> = {
  'want-to-read': 'status-want',
  'reading': 'status-reading',
  'read': 'status-read',
}

interface BookCardProps {
  book: Book
  onClick: (book: Book) => void
  status: ReadingStatus | null
}

export function BookCard({ book, onClick, status }: BookCardProps) {
  const cover = getBookCover(book, 'large')
  const authors = getAuthors(book)
  const { title, averageRating, publishedDate } = book.volumeInfo
  const year = publishedDate?.slice(0, 4)

  return (
    <article
      className="book-card"
      onClick={() => onClick(book)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(book)}
      aria-label={`${title}，作者：${authors}`}
    >
      <div className="card-cover">
        {cover ? (
          <img
            src={cover}
            alt={`《${title}》封面`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="cover-placeholder" aria-hidden="true">
            <span>{title.slice(0, 2)}</span>
          </div>
        )}
        {status && (
          <span className={`status-chip ${STATUS_CLASS[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>

      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        <p className="card-author">{authors}</p>
        <div className="card-meta">
          {averageRating && (
            <span className="rating" aria-label={`評分 ${averageRating}`}>
              ★ {averageRating.toFixed(1)}
            </span>
          )}
          {year && <span className="year">{year}</span>}
        </div>
      </div>
    </article>
  )
}
