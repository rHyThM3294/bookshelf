import { useEffect, useRef } from 'react'
import { getBookCover, getAuthors, truncateDescription } from '../services/booksApi'
import type { Book, ReadingStatus } from '../types'

interface BookModalProps {
  book: Book
  onClose: () => void
  status: ReadingStatus | null
  onAddToShelf: (status: ReadingStatus) => void
  onRemove: () => void
}

const SHELF_OPTIONS: { value: ReadingStatus; label: string; emoji: string }[] = [
  { value: 'want-to-read', label: '想讀', emoji: '📌' },
  { value: 'reading', label: '在讀', emoji: '📖' },
  { value: 'read', label: '已讀', emoji: '✓' },
]

export function BookModal({ book, onClose, status, onAddToShelf, onRemove }: BookModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const { title, description, pageCount, categories, averageRating, ratingsCount, publisher, publishedDate, previewLink } =
    book.volumeInfo

  const cover = getBookCover(book, 'large')
  const authorsText = getAuthors(book)

  useEffect(() => {
    closeRef.current?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`《${title}》詳細資訊`}
    >
      <div className="modal" ref={modalRef}>
        <button
          ref={closeRef}
          className="modal-close"
          onClick={onClose}
          aria-label="關閉"
        >
          ×
        </button>

        <div className="modal-body">
          <div className="modal-cover">
            {cover ? (
              <img src={cover} alt={`《${title}》封面`} />
            ) : (
              <div className="cover-placeholder large">
                <span>{title.slice(0, 2)}</span>
              </div>
            )}
          </div>

          <div className="modal-info">
            <h2 className="modal-title">{title}</h2>
            <p className="modal-author">{authorsText}</p>

            <div className="modal-meta">
              {averageRating && (
                <span className="meta-item">
                  ★ {averageRating.toFixed(1)}
                  {ratingsCount && <span className="meta-sub">（{ratingsCount.toLocaleString()} 評分）</span>}
                </span>
              )}
              {pageCount && <span className="meta-item">{pageCount} 頁</span>}
              {publisher && <span className="meta-item">{publisher}</span>}
              {publishedDate && <span className="meta-item">{publishedDate.slice(0, 4)} 年</span>}
            </div>

            {categories && categories.length > 0 && (
              <div className="category-tags">
                {categories.slice(0, 3).map(cat => (
                  <span key={cat} className="category-tag">{cat}</span>
                ))}
              </div>
            )}

            {description && (
              <p className="modal-description">
                {truncateDescription(description, 300)}
              </p>
            )}

            <div className="modal-actions">
              <div className="shelf-actions">
                {SHELF_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`shelf-btn ${status === opt.value ? 'active' : ''}`}
                    onClick={() => onAddToShelf(opt.value)}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="secondary-actions">
                {status && (
                  <button className="remove-btn" onClick={() => { onRemove(); onClose() }}>
                    從書架移除
                  </button>
                )}
                {previewLink && (
                  <a
                    href={previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preview-link"
                  >
                    Google Books 預覽 ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
