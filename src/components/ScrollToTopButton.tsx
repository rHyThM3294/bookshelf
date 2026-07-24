import { useCallback, useEffect, useState } from 'react'

const SHOW_THRESHOLD = 150

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SHOW_THRESHOLD)
    handleScroll() // 掛載時就先判斷一次（例如重新整理時頁面已有捲動位置）
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    // 尊重「減少動態效果」偏好設定的使用者，直接跳頂而不平滑捲動
    let prefersReducedMotion = false
    try {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      // matchMedia 不支援時，維持預設的平滑捲動
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [])

  return (
    <button
      className={`scroll-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="回到頂部"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
