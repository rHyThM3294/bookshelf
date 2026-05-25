import { useState } from 'react'
import { getBookCover, getAuthors } from '../services/booksApi'
import type { ShelfBook, Book, ReadingStatus } from '../types'

const TABS: { value: ReadingStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'want-to-read', label: '想讀' },
  { value: 'reading', label: '在讀' },
  { value: 'read', label: '已讀' },
]

const STATUS_LABEL: Record<ReadingStatus, string> = {
  'want-to-read': '想讀',
  'reading': '在讀',
  'read': '已讀',
}

interface ShelfPanelProps {
  items: ShelfBook[]
  onBookClick: (book: Book) => void
  onRemove: (bookId: string) => void
  onStatusChange: (bookId: string, status: ReadingStatus) => void
  countByStatus: (status: ReadingStatus) => number
}

export function ShelfPanel({ items, onBookClick, onRemove, onStatusChange, countByStatus }: ShelfPanelProps) {
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'all'>('all')

  const filtered = activeTab === 'all' ? items : items.filter(i => i.status === activeTab)

  if (items.length === 0) {
    return (
      <div className="shelf-empty">
        <div className="shelf-empty-icon">◈</div>
        <h2>書架還是空的</h2>
        <p>搜尋並加入你想讀的書吧</p>
      </div>
    )
  }

  return (
    <section className="shelf-panel">
      <div className="shelf-header">
        <h1 className="shelf-title">我的書架</h1>
        <div className="shelf-stats">
          <span>{countByStatus('want-to-read')} 想讀</span>
          <span>{countByStatus('reading')} 在讀</span>
          <span>{countByStatus('read')} 已讀</span>
        </div>
      </div>

      <div className="shelf-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            className={`shelf-tab ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="tab-count">{countByStatus(tab.value as ReadingStatus)}</span>
            )}
          </button>
        ))}
      </div>

      <div className="shelf-list" role="list">
        {filtered.map(item => {
          const cover = getBookCover(item.book, 'small')
          const authors = getAuthors(item.book)
          const { title, publishedDate } = item.book.volumeInfo

          return (
            <div key={item.bookId} className="shelf-item" role="listitem">
              <div
                className="shelf-item-cover"
                onClick={() => onBookClick(item.book)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onBookClick(item.book)}
                aria-label={`查看《${title}》詳情`}
              >
                {cover ? (
                  <img src={cover} alt={`《${title}》封面`} loading="lazy" />
                ) : (
                  <div className="cover-placeholder small">
                    <span>{title.slice(0, 1)}</span>
                  </div>
                )}
              </div>

              <div className="shelf-item-info">
                <h3
                  className="shelf-item-title"
                  onClick={() => onBookClick(item.book)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onBookClick(item.book)}
                >
                  {title}
                </h3>
                <p className="shelf-item-author">{authors}</p>
                {publishedDate && (
                  <p className="shelf-item-year">{publishedDate.slice(0, 4)}</p>
                )}
              </div>

              <div className="shelf-item-controls">
                <select
                  className="status-select"
                  value={item.status}
                  onChange={e => onStatusChange(item.bookId, e.target.value as ReadingStatus)}
                  aria-label={`《${title}》的閱讀狀態`}
                >
                  {Object.entries(STATUS_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <button
                  className="remove-icon-btn"
                  onClick={() => onRemove(item.bookId)}
                  aria-label={`從書架移除《${title}》`}
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
