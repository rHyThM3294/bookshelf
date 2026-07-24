import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { SortOption } from '../types'

interface SearchBarProps {
  onSearch: (query: string, sort?: SortOption) => void
  loading: boolean
  /** 目前生效中的搜尋詞（可能因建議詞點擊、瀏覽器上一頁等外部原因而改變） */
  query: string
}

export function SearchBar({ onSearch, loading, query }: SearchBarProps) {
  const [input, setInput] = useState(query)
  const [syncedQuery, setSyncedQuery] = useState(query)

  // query 因外部原因改變時（非使用者在這個輸入框打字），於渲染階段同步文字
  if (query !== syncedQuery) {
    setSyncedQuery(query)
    setInput(query)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) onSearch(input.trim())
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim()) onSearch(input.trim())
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <div className="search-input-wrap">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          className="search-input"
          placeholder="書名、作者、ISBN..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="搜尋書籍"
          autoComplete="off"
        />
        {input && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => setInput('')}
            aria-label="清除搜尋"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        className="search-btn"
        disabled={loading || !input.trim()}
        aria-busy={loading}
      >
        {loading ? <span className="spinner" aria-hidden="true" /> : '搜尋'}
      </button>
    </form>
  )
}
