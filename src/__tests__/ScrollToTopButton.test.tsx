import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScrollToTopButton } from '../components/ScrollToTopButton'

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true })
}

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    setScrollY(0)
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('scrollY 未超過 150px 時是隱藏的', () => {
    render(<ScrollToTopButton />)
    // aria-hidden="true" 時無障礙樹會把可存取名稱算成空字串，這裡改用 hidden:true 撈出唯一的按鈕
    const button = screen.getByRole('button', { hidden: true })
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveAttribute('tabindex', '-1')
  })

  it('捲動超過 150px 後顯示，且可用鍵盤操作', () => {
    render(<ScrollToTopButton />)

    setScrollY(151)
    fireEvent.scroll(window)

    const button = screen.getByRole('button', { name: '回到頂部' })
    expect(button).toHaveAttribute('aria-hidden', 'false')
    expect(button).toHaveAttribute('tabindex', '0')
  })

  it('點擊後捲回頁面頂部', async () => {
    render(<ScrollToTopButton />)
    setScrollY(200)
    fireEvent.scroll(window)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '回到頂部' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('jsdom 沒有 window.matchMedia 時，仍能正常捲回頂部（不噴例外）', async () => {
    // jsdom 預設沒有實作 matchMedia，這裡確保程式碼有防呆而不是讓點擊整個壞掉
    render(<ScrollToTopButton />)
    setScrollY(200)
    fireEvent.scroll(window)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '回到頂部' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('偏好減少動態效果時，直接跳頂而不平滑捲動', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    render(<ScrollToTopButton />)
    setScrollY(200)
    fireEvent.scroll(window)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '回到頂部' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
