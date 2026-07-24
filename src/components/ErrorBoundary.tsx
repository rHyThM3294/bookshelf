import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 頂層錯誤邊界：任何元件渲染時丟出未捕捉的例外，會顯示這個 fallback
 * 而不是整頁白屏。React 目前沒有 hook 版本，仍需用 class component。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-icon" aria-hidden="true">⚠</div>
          <h1>糟糕，畫面出了一點問題</h1>
          <p>請重新整理頁面再試一次。</p>
          <button onClick={() => window.location.reload()}>重新整理</button>
        </div>
      )
    }
    return this.props.children
  }
}
