export function EmptyState() {
  const suggestions = ['村上春樹', '余華', '余光中', '三體', 'Harry Potter', 'Sapiens']

  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">◈</div>
      <p className="empty-hint">試試搜尋這些</p>
      <div className="suggestion-chips">
        {suggestions.map(s => (
          <span key={s} className="suggestion-chip">{s}</span>
        ))}
      </div>
    </div>
  )
}


