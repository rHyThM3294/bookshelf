import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { useBookSearch } from './hooks/useBookSearch'
import { useShelf } from './hooks/useShelf'
import { SearchBar } from './components/SearchBar'
import { BookGrid } from './components/BookGrid'
import { EmptyState } from './components/EmptyState'
import { recordSearch } from './services/searchHistory'
import { getBookById } from './services/booksApi'
import { StatsBar } from './components/StatsBar'
import type { Book, SortOption } from './types'
import './index.css'

// Modal 與書架頁不在首次進站的關鍵路徑上，拆成獨立 chunk 縮小初始 bundle
const BookModal = lazy(() => import('./components/BookModal').then(m => ({ default: m.BookModal })))
const ShelfPanel = lazy(() => import('./components/ShelfPanel').then(m => ({ default: m.ShelfPanel })))

type View = 'search' | 'shelf'

/** 從網址讀出搜尋詞／排序／頁籤／書籍詳情，讓畫面可分享、重新整理不遺失 */
function parseUrlState(): { q: string; sort: SortOption; view: View; bookId: string | null } {
  const params = new URLSearchParams(window.location.search)
  const sortParam = params.get('sort')
  return {
    q: params.get('q') ?? '',
    sort: sortParam === 'newest' ? 'newest' : 'relevance',
    view: params.get('view') === 'shelf' ? 'shelf' : 'search',
    bookId: params.get('book'),
  }
}

export default function App() {
  const initial = parseUrlState()
  const search = useBookSearch(initial.q, initial.sort)
  const shelf = useShelf()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [view, setView] = useState<View>(initial.view)

  // 網址帶有書籍 ID 時（分享的書籍詳情連結），掛載時直接抓該本書並開啟 Modal
  useEffect(() => {
    if (initial.bookId) {
      getBookById(initial.bookId).then(setSelectedBook).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 將目前搜尋詞／排序／頁籤／書籍詳情同步到網址，讓畫面可分享、重新整理不遺失
  useEffect(() => {
    const params = new URLSearchParams()
    if (view === 'shelf') params.set('view', 'shelf')
    if (search.query) params.set('q', search.query)
    if (search.sortBy !== 'relevance') params.set('sort', search.sortBy)
    if (selectedBook) params.set('book', selectedBook.id)
    const queryString = params.toString()
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`
    if (newUrl !== window.location.pathname + window.location.search) {
      window.history.pushState(null, '', newUrl)
    }
  }, [view, search.query, search.sortBy, selectedBook])

  // 支援瀏覽器上一頁／下一頁：還原網址對應的搜尋、頁籤與書籍詳情
  useEffect(() => {
    const handlePopState = () => {
      const state = parseUrlState()
      setView(state.view)
      if (state.q) {
        search.search(state.q, state.sort)
      } else {
        search.reset()
      }
      if (state.bookId) {
        getBookById(state.bookId).then(setSelectedBook).catch(() => setSelectedBook(null))
      } else {
        setSelectedBook(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasResults = search.books.length > 0
  const hasSearched = search.query.length > 0

  // 點擊建議詞 / 歷史詞：直接觸發搜尋，SearchBar 會自動同步顯示文字
  const handleSuggestionClick = useCallback((query: string) => {
    recordSearch(query)
    search.search(query)
  }, [search])

  // 使用者自己手動搜尋時也記錄歷史
  const handleSearch = useCallback((q: string, sort?: Parameters<typeof search.search>[1]) => {
    recordSearch(q)
    search.search(q, sort)
  }, [search])

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          {/* Logo 點擊回首頁（切換到搜尋頁並重置） */}
          <button
            className="logo logo-btn"
            onClick={() => { setView('search'); search.reset() }}
            aria-label="回到首頁"
          >
            <span className="logo-icon">◈</span>
            <span className="logo-text">BookShelf</span>
          </button>

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
                onSearch={handleSearch}
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
              <EmptyState onSuggestionClick={handleSuggestionClick} />
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
          <Suspense fallback={<div className="panel-loading">載入中...</div>}>
            <ShelfPanel
              items={shelf.items}
              onBookClick={setSelectedBook}
              onRemove={shelf.removeBook}
              onStatusChange={shelf.updateStatus}
              countByStatus={shelf.countByStatus}
            />
          </Suspense>
        )}
      </main>

      {selectedBook && (
        <Suspense fallback={null}>
          <BookModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            status={shelf.getStatus(selectedBook.id)}
            onAddToShelf={(status) => shelf.addBook(selectedBook, status)}
            onRemove={() => shelf.removeBook(selectedBook.id)}
          />
        </Suspense>
      )}
    </div>
  )
}
