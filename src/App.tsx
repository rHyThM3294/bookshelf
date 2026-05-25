import { useState } from 'react'
import { useBookSearch } from './hooks/useBookSearch'
import { useShelf } from './hooks/useShelf'
import { SearchBar } from './components/SearchBar'
import { BookGrid } from './components/BookGrid'
import { BookModal } from './components/BookModal'
import { ShelfPanel } from './components/ShelfPanel'
import { EmptyState } from './components/EmptyState'
import { StatsBar } from './components/StatsBar'
import type { Book } from './types'
import './index.css'

export default function App() {
  const search = useBookSearch()
  const shelf = useShelf()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [view, setView] = useState<'search' | 'shelf'>('search')

  const hasResults = search.books.length > 0
  const hasSearched = search.query.length > 0

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">BookShelf</span>
          </div>

          <nav className="nav">
            <button
              className={`nav-btn ${view === 'search' ? 'active' : ''}`}
              onClick={() => setView('search')}
            >
              探索書籍
            </button>
            <button
              className={`nav-btn ${view === 'shelf' ? 'active' : ''}`}
              onClick={() => setView('shelf')}
            >
              我的書架
              {shelf.items.length > 0 && (
                <span className="badge">{shelf.items.length}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {view === 'search' ? (
          <>
            <div className="search-section">
              <h1 className="hero-title">
                探索你的<br />下一本書
              </h1>
              <SearchBar
                onSearch={search.search}
                loading={search.loading}
                query={search.query}
              />
              {hasResults && (
                <StatsBar
                  totalItems={search.totalItems}
                  shown={search.books.length}
                  sortBy={search.sortBy}
                  onSortChange={search.setSortBy}
                />
              )}
            </div>

            {search.error && (
              <div className="error-banner" role="alert">
                <span className="error-icon">⚠</span>
                {search.error}
              </div>
            )}

            {!hasSearched && !search.loading && (
              <EmptyState />
            )}

            {hasSearched && !search.loading && !search.error && search.books.length === 0 && (
              <div className="no-results">
                <p>找不到「{search.query}」的相關書籍</p>
                <p className="hint">試試其他關鍵字或調整搜尋條件</p>
              </div>
            )}

            {hasResults && (
              <BookGrid
                books={search.books}
                loading={search.loading}
                hasMore={search.hasMore}
                onBookClick={setSelectedBook}
                onLoadMore={search.loadMore}
                getStatus={shelf.getStatus}
              />
            )}

            {search.loading && search.books.length === 0 && (
              <div className="loading-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            )}
          </>
        ) : (
          <ShelfPanel
            items={shelf.items}
            onBookClick={setSelectedBook}
            onRemove={shelf.removeBook}
            onStatusChange={shelf.updateStatus}
            countByStatus={shelf.countByStatus}
          />
        )}
      </main>

      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          status={shelf.getStatus(selectedBook.id)}
          onAddToShelf={(status) => shelf.addBook(selectedBook, status)}
          onRemove={() => shelf.removeBook(selectedBook.id)}
        />
      )}
    </div>
  )
}
