import { useMemo } from 'react'

// 預設熱門搜尋詞（涵蓋中英文、各類型）
const DEFAULT_SUGGESTIONS = [
  '村上春樹', '余華', '余光中', '三體', 'Harry Potter', 'Sapiens',
  '張愛玲', '龍應台', '吳明益', '卡夫卡', '加缪', '米蘭·昆德拉',
  '解憂雜貨店', '百年孤寂', 'Atomic Habits', 'The Alchemist',
  '人類大歷史', '被討厭的勇氣', '蛤蟆先生去看心理師',
]

const HISTORY_KEY = 'bookshelf_search_history'
const MAX_HISTORY = 10

export function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function recordSearch(query: string) {
  try {
    const history = getSearchHistory().filter(h => h !== query)
    const updated = [query, ...history].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

interface EmptyStateProps {
  onSuggestionClick: (query: string) => void
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const history = useMemo(() => getSearchHistory(), [])

  // 取前 6 個歷史搜尋（若有），不足的用預設填補，合計最多顯示 10 個
  const displayed = useMemo(() => {
    const historySet = new Set(history)
    const defaults = DEFAULT_SUGGESTIONS.filter(s => !historySet.has(s))
    const combined = [...history.slice(0, 6), ...defaults]
    return combined.slice(0, 10)
  }, [history])

  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">◈</div>

      {history.length > 0 && (
        <>
          <p className="empty-hint">最近搜尋</p>
          <div className="suggestion-chips">
            {history.slice(0, 4).map(s => (
              <button
                key={`hist-${s}`}
                className="suggestion-chip suggestion-chip--history"
                onClick={() => onSuggestionClick(s)}
                title={`搜尋「${s}」`}
              >
                <span className="chip-icon">🕐</span>{s}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="empty-hint" style={{ marginTop: history.length > 0 ? '1.5rem' : undefined }}>
        試試搜尋這些
      </p>
      <div className="suggestion-chips">
        {displayed.map((s, i) => (
          <button
            key={`sug-${s}-${i}`}
            className="suggestion-chip"
            onClick={() => onSuggestionClick(s)}
            title={`搜尋「${s}」`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
