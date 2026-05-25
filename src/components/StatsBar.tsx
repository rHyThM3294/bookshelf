import type { SortOption } from '../types'

interface StatsBarProps {
  totalItems: number
  shown: number
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export function StatsBar({ totalItems, shown, sortBy, onSortChange }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <p className="stats-text">
        共 <strong>{totalItems.toLocaleString()}</strong> 本，顯示 {shown} 本
      </p>
      <div className="sort-control">
        <label htmlFor="sort-select" className="sort-label">排序</label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortOption)}
        >
          <option value="relevance">相關度</option>
          <option value="newest">最新</option>
        </select>
      </div>
    </div>
  )
}
