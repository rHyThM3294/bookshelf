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
