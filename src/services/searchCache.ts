/**
 * 搜尋結果快取 — 解決 Google Books API 配額耗盡問題
 *
 * 策略：
 * 1. LRU 記憶體快取：相同查詢直接從快取回傳，不呼叫 API
 * 2. localStorage 持久化快取：重新整理頁面也能復用結果（TTL 6 小時）
 * 3. 請求去重：同一查詢正在進行中時，後續請求等待同一個 Promise
 */

import type { BooksApiResponse } from '../types'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000   // 6 小時
const MEM_CACHE_MAX = 50                    // 最多保留 50 筆
const LS_KEY_PREFIX = 'bsCache:'

interface CacheEntry {
  data: BooksApiResponse
  expiresAt: number
}

// ── 記憶體 LRU ────────────────────────────────────────────────────────────────
const memCache = new Map<string, CacheEntry>()

function memGet(key: string): BooksApiResponse | null {
  const entry = memCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { memCache.delete(key); return null }
  // 移到最後（LRU 更新）
  memCache.delete(key)
  memCache.set(key, entry)
  return entry.data
}

function memSet(key: string, data: BooksApiResponse): void {
  if (memCache.size >= MEM_CACHE_MAX) {
    // 刪最舊的一筆
    memCache.delete(memCache.keys().next().value!)
  }
  memCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ── localStorage 持久化 ───────────────────────────────────────────────────────
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
    // localStorage 空間不足時靜默忽略
  }
}

/** 清除所有過期的 localStorage 快取 */
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

// ── 統一入口 ──────────────────────────────────────────────────────────────────
export function cacheGet(key: string): BooksApiResponse | null {
  return memGet(key) ?? lsGet(key)
}

export function cacheSet(key: string, data: BooksApiResponse): void{
  memSet(key, data)
  lsSet(key, data)
}

// ── 請求去重（in-flight dedup） ───────────────────────────────────────────────
const inFlight = new Map<string, Promise<BooksApiResponse>>()

export function getInFlight(key: string): Promise<BooksApiResponse> | null {
  return inFlight.get(key) ?? null
}

export function setInFlight(key: string, promise: Promise<BooksApiResponse>): void {
  inFlight.set(key, promise)
  // 用 then/catch 各自清除，避免 .finally() 產生無人接收的衍生 Promise rejection
  promise.then(
    () => inFlight.delete(key),
    () => inFlight.delete(key),
  )
}
