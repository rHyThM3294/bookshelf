import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { SortOption } from '../types'

interface SearchBarProps {
  onSearch: (query: string, sort?: SortOption) => void
  loading: boolean
  query: string
}

export function SearchBar({ onSearch, loading, query }: SearchBarProps) {
  const [input, setInput] = useState(query)

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
