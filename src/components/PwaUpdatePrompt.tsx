import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="pwa-toast" role="status">
      <p>{needRefresh ? '有新版本可用' : '已可離線使用'}</p>
      <div className="pwa-toast-actions">
        {needRefresh && (
          <button onClick={() => updateServiceWorker(true)}>更新</button>
        )}
        <button className="secondary" onClick={close}>關閉</button>
      </div>
    </div>
  )
}
