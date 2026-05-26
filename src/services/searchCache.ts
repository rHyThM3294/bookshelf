import type { BooksApiResponse } from '../types'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const MEM_CACHE_MAX = 50
const LS_KEY_PREFIX = 'bsCache:'

interface CacheEntry {
  data: BooksApiResponse
  expiresAt: number
}

const memCache = new Map<string, CacheEntry>()

function memGet(key: string): BooksApiResponse | null {
  const entry = memCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { memCache.delete(key); return null }
  memCache.delete(key)
  memCache.set(key, entry)
  return entry.data
}

function memSet(key: string, data: BooksApiResponse): void {
  if (memCache.size >= MEM_CACHE_MAX) {
    memCache.delete(memCache.keys().next().value!)
  }
  memCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

function lsGet(key: string): BooksApiResponse | null {
  try {
    const raw = localStorage.getItem(LS_KEY_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(LS_KEY_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function lsSet(key: string, data: BooksApiResponse): void {
  try {
    const entry: CacheEntry = { data, expiresAt: Date.now() + CACHE_TTL_MS }
    localStorage.setItem(LS_KEY_PREFIX + key, JSON.stringify(entry))
  } catch {
    // ignore
  }
}

export function pruneExpiredCache(): void {
  try {
    const now = Date.now()
    Object.keys(localStorage)
      .filter(k => k.startsWith(LS_KEY_PREFIX))
      .forEach(k => {
        try {
          const entry: CacheEntry = JSON.parse(localStorage.getItem(k)!)
          if (now > entry.expiresAt) localStorage.removeItem(k)
        } catch {
          localStorage.removeItem(k)
        }
      })
  } catch { /* ignore */ }
}

export function cacheGet(key: string): BooksApiResponse | null {
  return memGet(key) ?? lsGet(key)
}

export function cacheSet(key: string, data: BooksApiResponse): void {
  memSet(key, data)
  lsSet(key, data)
}

const inFlight = new Map<string, Promise<BooksApiResponse>>()

export function getInFlight(key: string): Promise<BooksApiResponse> | null {
  return inFlight.get(key) ?? null
}

export function setInFlight(key: string, promise: Promise<BooksApiResponse>): void {
  inFlight.set(key, promise)
  promise.then(
    () => inFlight.delete(key),
    () => inFlight.delete(key),
  )
}