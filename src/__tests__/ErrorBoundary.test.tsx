import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('渲染正常子元件時不顯示 fallback', () => {
    render(
      <ErrorBoundary>
        <p>正常畫面</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('正常畫面')).toBeInTheDocument()
  })

  it('子元件丟出例外時顯示 fallback，而非整頁白屏', () => {
    // React 會把邊界攔到的錯誤也印到 console.error，這裡靜音掉避免污染測試輸出
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('糟糕，畫面出了一點問題')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新整理' })).toBeInTheDocument()
  })
})
